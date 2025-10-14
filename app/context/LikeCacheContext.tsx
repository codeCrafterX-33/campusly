import React, { createContext, useContext, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

interface LikeCacheContextType {
  // Cache management
  getCachedLikeStatus: (postId: number) => boolean | null;
  getCachedLikeCount: (postId: number) => number | null;
  setCachedLikeStatus: (postId: number, isLiked: boolean) => void;
  setCachedLikeCount: (postId: number, count: number) => void;

  // Like operations with caching
  toggleLike: (postId: number) => Promise<boolean>;
  checkLikeStatus: (postId: number) => Promise<boolean>;
  getLikeCount: (postId: number) => Promise<number>;

  // Cache invalidation
  invalidatePostCache: (postId: number) => void;
  invalidateAllCache: () => void;

  // Loading states
  isLiking: boolean;
}

const LikeCacheContext = createContext<LikeCacheContextType | undefined>(
  undefined
);

export const useLikeCache = () => {
  const context = useContext(LikeCacheContext);
  if (!context) {
    throw new Error("useLikeCache must be used within a LikeCacheProvider");
  }
  return context;
};

interface LikeCacheProviderProps {
  children: React.ReactNode;
}

export const LikeCacheProvider: React.FC<LikeCacheProviderProps> = ({
  children,
}) => {
  const { userData } = useContext(AuthContext);

  // Cache storage
  const [likeStatusCache, setLikeStatusCache] = useState<{
    [key: number]: boolean;
  }>({});
  const [likeCountCache, setLikeCountCache] = useState<{
    [key: number]: number;
  }>({});
  const [isLiking, setIsLiking] = useState(false);

  // Cache getters
  const getCachedLikeStatus = useCallback(
    (postId: number): boolean | null => {
      return likeStatusCache[postId] ?? null;
    },
    [likeStatusCache]
  );

  const getCachedLikeCount = useCallback(
    (postId: number): number | null => {
      return likeCountCache[postId] ?? null;
    },
    [likeCountCache]
  );

  // Cache setters
  const setCachedLikeStatus = useCallback(
    (postId: number, isLiked: boolean) => {
      setLikeStatusCache((prev) => ({
        ...prev,
        [postId]: isLiked,
      }));
    },
    []
  );

  const setCachedLikeCount = useCallback((postId: number, count: number) => {
    setLikeCountCache((prev) => ({
      ...prev,
      [postId]: count,
    }));
  }, []);

  // Toggle like with optimistic updates
  const toggleLike = useCallback(
    async (postId: number): Promise<boolean> => {
      if (!userData?.id) {
        console.error("User not authenticated");
        return false;
      }

      // Get current cached state
      const currentLiked = getCachedLikeStatus(postId);
      const currentCount = getCachedLikeCount(postId) ?? 0;

      // Optimistic update
      const newLiked = currentLiked === null ? true : !currentLiked;
      const newCount = newLiked
        ? currentCount + 1
        : Math.max(currentCount - 1, 0);

      setCachedLikeStatus(postId, newLiked);
      setCachedLikeCount(postId, newCount);

      setIsLiking(true);

      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/like/${postId}/toggle`,
          { userId: userData.id }
        );

        const serverLiked = response.data.isLiked;

        // Update cache with server response
        setCachedLikeStatus(postId, serverLiked);

        // Fetch updated like count from server
        try {
          const countResponse = await axios.get(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/like/${postId}/count`
          );
          setCachedLikeCount(postId, countResponse.data.likeCount);
        } catch (countError) {
          console.error("Error fetching updated like count:", countError);
        }

        return serverLiked;
      } catch (error) {
        console.error("Error toggling like:", error);

        // Revert optimistic update on error
        if (currentLiked !== null) {
          setCachedLikeStatus(postId, currentLiked);
        }
        setCachedLikeCount(postId, currentCount);

        return false;
      } finally {
        setIsLiking(false);
      }
    },
    [
      userData?.id,
      getCachedLikeStatus,
      getCachedLikeCount,
      setCachedLikeStatus,
      setCachedLikeCount,
    ]
  );

  // Check like status with caching
  const checkLikeStatus = useCallback(
    async (postId: number): Promise<boolean> => {
      if (!userData?.id) {
        return false;
      }

      // Return cached value if available
      const cached = getCachedLikeStatus(postId);
      if (cached !== null) {
        return cached;
      }

      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/like/${postId}/status?userId=${userData.id}`
        );

        if (response.data && typeof response.data.isLiked === "boolean") {
          setCachedLikeStatus(postId, response.data.isLiked);
          return response.data.isLiked;
        }

        return false;
      } catch (error: any) {
        console.error("Error checking like status:", error);
        return false;
      }
    },
    [userData?.id, getCachedLikeStatus, setCachedLikeStatus]
  );

  // Get like count with caching
  const getLikeCount = useCallback(
    async (postId: number): Promise<number> => {
      // Return cached value if available
      const cached = getCachedLikeCount(postId);
      if (cached !== null) {
        return cached;
      }

      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/like/${postId}/count`
        );

        const count = response.data.likeCount;
        setCachedLikeCount(postId, count);
        return count;
      } catch (error) {
        console.error("Error getting like count:", error);
        return 0;
      }
    },
    [getCachedLikeCount, setCachedLikeCount]
  );

  // Cache invalidation
  const invalidatePostCache = useCallback((postId: number) => {
    setLikeStatusCache((prev) => {
      const newCache = { ...prev };
      delete newCache[postId];
      return newCache;
    });
    setLikeCountCache((prev) => {
      const newCache = { ...prev };
      delete newCache[postId];
      return newCache;
    });
  }, []);

  const invalidateAllCache = useCallback(() => {
    setLikeStatusCache({});
    setLikeCountCache({});
  }, []);

  const value: LikeCacheContextType = {
    getCachedLikeStatus,
    getCachedLikeCount,
    setCachedLikeStatus,
    setCachedLikeCount,
    toggleLike,
    checkLikeStatus,
    getLikeCount,
    invalidatePostCache,
    invalidateAllCache,
    isLiking,
  };

  return (
    <LikeCacheContext.Provider value={value}>
      {children}
    </LikeCacheContext.Provider>
  );
};
