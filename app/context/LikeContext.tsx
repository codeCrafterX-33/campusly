import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

interface LikeContextType {
  likePost: (postId: number) => Promise<boolean>;
  unlikePost: (postId: number) => Promise<boolean>;
  toggleLike: (postId: number) => Promise<boolean>;
  getLikeCount: (postId: number) => Promise<number>;
  checkLikeStatus: (postId: number) => Promise<boolean>;
  isLiking: boolean;
}

const LikeContext = createContext<LikeContextType | undefined>(undefined);

export const useLikeContext = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error("useLikeContext must be used within a LikeProvider");
  }
  return context;
};

interface LikeProviderProps {
  children: React.ReactNode;
}

export const LikeProvider: React.FC<LikeProviderProps> = ({ children }) => {
  const [isLiking, setIsLiking] = useState(false);
  const { userData } = useContext(AuthContext);

  const toggleLike = useCallback(
    async (postId: number): Promise<boolean> => {
      if (!userData?.id) {
        console.error("User not authenticated");
        return false;
      }

      setIsLiking(true);
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/like/${postId}/toggle`,
          { userId: userData.id }
        );

        return response.data.isLiked;
      } catch (error) {
        console.error("Error toggling like:", error);
        return false;
      } finally {
        setIsLiking(false);
      }
    },
    [userData?.id]
  );

  const likePost = useCallback(
    async (postId: number): Promise<boolean> => {
      if (!userData?.id) {
        console.error("User not authenticated");
        return false;
      }

      setIsLiking(true);
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/like/${postId}/toggle`,
          { userId: userData.id }
        );

        return response.data.isLiked;
      } catch (error) {
        console.error("Error liking post:", error);
        return false;
      } finally {
        setIsLiking(false);
      }
    },
    [userData?.id]
  );

  const unlikePost = useCallback(
    async (postId: number): Promise<boolean> => {
      if (!userData?.id) {
        console.error("User not authenticated");
        return false;
      }

      setIsLiking(true);
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/like/${postId}/toggle`,
          { userId: userData.id }
        );

        return !response.data.isLiked;
      } catch (error) {
        console.error("Error unliking post:", error);
        return false;
      } finally {
        setIsLiking(false);
      }
    },
    [userData?.id]
  );

  const getLikeCount = useCallback(async (postId: number): Promise<number> => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/like/${postId}/count`
      );
      return response.data.likeCount;
    } catch (error) {
      console.error("Error getting like count:", error);
      return 0;
    }
  }, []);

  const checkLikeStatus = useCallback(
    async (postId: number): Promise<boolean> => {
      if (!userData?.id) {
        return false;
      }

      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/like/${postId}/status?userId=${userData.id}`
        );

        // Check if response has the expected structure
        if (response.data && typeof response.data.isLiked === "boolean") {
          return response.data.isLiked;
        }

        console.warn(
          "Unexpected response structure for like status:",
          response.data
        );
        return false;
      } catch (error) {
        // Don't log network errors as they're expected when server is down
        if (
          error.code === "NETWORK_ERROR" ||
          error.message?.includes("Network Error")
        ) {
          console.warn("Server not available for like status check");
        } else {
          console.error("Error checking like status:", error);
        }
        return false;
      }
    },
    [userData?.id]
  );

  const value: LikeContextType = {
    likePost,
    unlikePost,
    toggleLike,
    getLikeCount,
    checkLikeStatus,
    isLiking,
  };

  return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
};
