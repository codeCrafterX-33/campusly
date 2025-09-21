import { createContext, useCallback, useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut, User } from "firebase/auth";
import { auth } from "../configs/FireBaseConfigs";
import axios from "axios";
import usePersistedState from "../util/PersistedState";

const AuthContext = createContext<any>({
  userData: null,
  setUserData: () => {},
  education: [],
  setEducation: () => {},
  logout: () => {},
  getUser: () => {},
  getUserById: () => {},
  getCachedUser: () => {},
  preloadUserData: () => {},
  onLogout: () => {},
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = usePersistedState("userData", null);
  const [education, setEducation] = usePersistedState("education", []);
  const [userCache, setUserCache] = useState<Map<string, any>>(new Map());
  const [preloadingUsers, setPreloadingUsers] = useState<Set<string>>(
    new Set()
  );
  const [preloadQueue, setPreloadQueue] = useState<string[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [failedUsers, setFailedUsers] = useState<Set<string>>(new Set());
  const [logoutCallbacks, setLogoutCallbacks] = useState<(() => void)[]>([]);
  const recentlyAddedUsers = useRef<Set<string>>(new Set());
  const processingUsers = useRef<Set<string>>(new Set());
  const queuedUsers = useRef<Set<string>>(new Set());

  const onLogout = (callback: () => void) => {
    setLogoutCallbacks((prev) => [...prev, callback]);
  };

  const logout = async () => {
    await auth.signOut();
    try {
      // Clear all user-related cached data
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("education");
      await AsyncStorage.removeItem("posts");
      await AsyncStorage.removeItem("userPosts");
      await AsyncStorage.removeItem("clubs");
      await AsyncStorage.removeItem("followedClubs");
      await AsyncStorage.removeItem("userCreatedClubs");

      // Reset all state to initial values
      setUserData(null);
      setEducation([]);
      setUserCache(new Map()); // Clear user cache
      setPreloadingUsers(new Set()); // Clear preloading set
      setPreloadQueue([]); // Clear preload queue
      setIsProcessingQueue(false); // Stop processing
      setFailedUsers(new Set()); // Clear failed users
      processingUsers.current.clear(); // Clear processing users
      recentlyAddedUsers.current.clear(); // Clear recently added users
      queuedUsers.current.clear(); // Clear queued users

      // Execute all logout callbacks to clear other contexts
      logoutCallbacks.forEach((callback) => callback());

      console.log("User logged out and all cached data cleared!");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const getUser = useCallback(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser?.email) {
        try {
          // Fetch user data
          const userResponse = await axios.get(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${currentUser.email}`
          );
          setUserData(userResponse.data.data[0]);
          console.log("User data:", userResponse.data.data[0]);

          // Fetch education data
          try {
            const educationResponse = await axios.get(
              `${process.env.EXPO_PUBLIC_SERVER_URL}/education/${currentUser.email}`
            );
            setEducation(educationResponse.data.data || []);
            console.log("Education data:", educationResponse.data.data);
          } catch (educationError) {
            console.warn("Failed to fetch education data:", educationError);
            setEducation([]); // Set empty array if education fetch fails
          }
        } catch (error) {
          console.warn("Failed to fetch user data:", error);
          setEducation([]); // Set empty array if user fetch fails
        }
      } else {
        // No user logged in, clear education state
        setEducation([]);
      }
    });

    return unsubscribe;
  }, []);

  const getUserById = useCallback(
    async (userId: string) => {
      // Check cache first
      if (userCache.has(userId)) {
        console.log("Returning cached user data for:", userId);
        return userCache.get(userId);
      }

      try {
        console.log("Fetching user data for:", userId);
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/user/id/${userId}`
        );
        const userData = response.data.data;

        // Cache the user data
        setUserCache((prev) => new Map(prev).set(userId, userData));

        return userData;
      } catch (error) {
        console.error("Failed to fetch user by ID:", error);
        throw error;
      }
    },
    [userCache]
  );

  const getCachedUser = useCallback(
    (userId: string) => {
      return userCache.get(userId) || null;
    },
    [userCache]
  );

  // Process preload queue in batches
  const processPreloadQueue = useCallback(async () => {
    if (isProcessingQueue || preloadQueue.length === 0) return;

    setIsProcessingQueue(true);
    const batchSize = 2; // Reduced to 2 users at a time
    const batch = preloadQueue.slice(0, batchSize);

    console.log(`Processing batch of ${batch.length} users:`, batch);
    console.log(`Current queue before processing:`, preloadQueue);

    // Filter out already cached users from the batch
    const uncachedBatch = batch.filter((userId) => !userCache.has(userId));
    if (uncachedBatch.length !== batch.length) {
      console.log(
        `Filtered out ${
          batch.length - uncachedBatch.length
        } already cached users`
      );
    }

    // Process batch concurrently
    const promises = uncachedBatch.map(async (userId) => {
      // Skip if already cached
      if (userCache.has(userId)) {
        console.log(`User ${userId} already cached, skipping processing`);
        return;
      }

      // Double-check to prevent duplicates and processing conflicts
      if (
        !userCache.has(userId) &&
        !preloadingUsers.has(userId) &&
        !processingUsers.current.has(userId)
      ) {
        try {
          setPreloadingUsers((prev) => new Set(prev).add(userId));
          processingUsers.current.add(userId);

          console.log("Preloading complete user profile for:", userId);

          // Add authentication headers if available
          const headers: any = {};
          if (userData?.id) {
            headers["Authorization"] = `Bearer ${userData.id}`;
          }

          // Fetch complete user data
          const userResponse = await axios.get(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/user/id/${userId}`,
            { headers }
          );
          const fetchedUserData = userResponse.data.data;

          // Fetch education data for the user
          let educationData = [];
          try {
            const educationResponse = await axios.get(
              `${process.env.EXPO_PUBLIC_SERVER_URL}/education/${fetchedUserData.email}`,
              { headers }
            );
            educationData = educationResponse.data.data || [];
          } catch (educationError) {
            console.warn(
              "Failed to preload education data for:",
              userId,
              educationError
            );
          }

          // Cache the complete user data with education
          const completeUserData = {
            ...fetchedUserData,
            education: educationData,
          };

          setUserCache((prev) => new Map(prev).set(userId, completeUserData));
          console.log(
            "Complete user profile preloaded and cached for:",
            userId
          );
        } catch (error: any) {
          console.warn("Failed to preload user data for:", userId, error);
          // Add to failed users set to prevent retries for any error
          setFailedUsers((prev) => new Set(prev).add(userId));
          // Remove from queue if it's still there
          setPreloadQueue((prev) => prev.filter((id) => id !== userId));
          console.log(
            "Added user to failed list and removed from queue:",
            userId,
            "Error type:",
            error.code || error.message
          );
        } finally {
          setPreloadingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          processingUsers.current.delete(userId);
        }
      } else {
        console.log(
          "Skipping user (already cached, preloading, or processing):",
          userId
        );
      }
    });

    await Promise.all(promises);

    // Remove processed users from queue AFTER processing is complete
    setPreloadQueue((prev) => {
      const newQueue = prev.slice(batchSize);
      console.log(`Queue after removing ${batchSize} users:`, newQueue);

      // Remove processed users from queuedUsers set
      batch.forEach((userId) => {
        queuedUsers.current.delete(userId);
      });

      return newQueue;
    });

    setIsProcessingQueue(false);

    // Process next batch after delay
    setTimeout(() => {
      // Check current queue length after state update
      setPreloadQueue((currentQueue) => {
        if (currentQueue.length > 0) {
          console.log(
            `Queue still has ${currentQueue.length} users, processing next batch`
          );
          processPreloadQueue();
        } else {
          console.log(`Queue is empty, stopping processing`);
        }
        return currentQueue;
      });
    }, 3000); // Increased to 3 second delay between batches
  }, [preloadQueue, isProcessingQueue, userCache, preloadingUsers, userData]);

  const preloadUserData = useCallback(
    (userId: string, priority: "high" | "normal" = "normal") => {
      // First check if user is already cached - if so, don't add to queue at all
      if (userCache.has(userId)) {
        console.log(`User ${userId} already cached, skipping preload`);
        return;
      }

      // Check if user is already being processed, recently added, failed, or queued
      if (
        preloadingUsers.has(userId) ||
        processingUsers.current.has(userId) ||
        recentlyAddedUsers.current.has(userId) ||
        failedUsers.has(userId) ||
        queuedUsers.current.has(userId)
      ) {
        console.log(
          `User ${userId} already being processed/recently added/failed/queued, skipping`
        );
        return;
      }

      console.log(`Attempting to add user ${userId} to queue. Checks:`, {
        cached: userCache.has(userId),
        preloading: preloadingUsers.has(userId),
        inQueue: preloadQueue.includes(userId),
        failed: failedUsers.has(userId),
        recentlyAdded: recentlyAddedUsers.current.has(userId),
        processing: processingUsers.current.has(userId),
        queued: queuedUsers.current.has(userId),
      });

      // Only add to queue if not already in queue
      if (!preloadQueue.includes(userId) && !queuedUsers.current.has(userId)) {
        // Add to recently added set to prevent rapid re-additions
        recentlyAddedUsers.current.add(userId);
        setTimeout(() => {
          recentlyAddedUsers.current.delete(userId);
        }, 10000); // Increased to 10 seconds

        // Add to queued users set
        queuedUsers.current.add(userId);

        setPreloadQueue((prev) => {
          // Double-check for duplicates in the current queue
          if (prev.includes(userId)) {
            console.log("User already in queue, skipping:", userId);
            return prev;
          }

          const newQueue = [...prev];

          // Limit queue size to prevent memory issues
          if (newQueue.length >= 30) {
            // Reduced from 50 to 30
            // Remove oldest normal priority users if queue is full
            const normalIndex = newQueue.findIndex(
              (id, index) => index > 15 // Remove from middle/end
            );
            if (normalIndex !== -1) {
              newQueue.splice(normalIndex, 1);
            }
          }

          if (priority === "high") {
            // Add high priority users to front of queue
            newQueue.unshift(userId);
          } else {
            // Add normal priority users to end of queue
            newQueue.push(userId);
          }
          return newQueue;
        });

        console.log(`Added user to preload queue (${priority}):`, userId);
      } else {
        console.log("User already in queue, skipping:", userId);
      }
    },
    [userCache, preloadingUsers, preloadQueue, failedUsers]
  );

  // Process queue when it changes
  useEffect(() => {
    if (preloadQueue.length > 0 && !isProcessingQueue) {
      const timeoutId = setTimeout(() => {
        processPreloadQueue();
      }, 2000); // 2 second delay before starting

      return () => clearTimeout(timeoutId);
    }
  }, [preloadQueue, isProcessingQueue, processPreloadQueue]);

  const value = {
    userData: userData,
    setUserData: setUserData,
    education: education,
    setEducation: setEducation,
    logout: logout,
    getUser: getUser,
    getUserById: getUserById,
    getCachedUser: getCachedUser,
    preloadUserData: preloadUserData,
    onLogout: onLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
