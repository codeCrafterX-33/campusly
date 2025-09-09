import React, { createContext, useContext, useCallback } from "react";
import usePersistedState from "../util/PersistedState";

interface Post {
  id: number;
  content: string;
  media: any;
  createdon: string;
  createdby: string;
  user_id: number;
  firstname: string;
  lastname: string;
  username: string;
  user_image: string;
  studentstatusverified: boolean;
  like_count: number;
  comment_count: number;
  parent_post_id?: number;
}

interface PostHistoryContextType {
  postHistory: Post[];
  addPostToHistory: (post: Post) => void;
  goBackToPreviousPost: () => Post | null;
  canGoBack: () => boolean;
  clearHistory: () => void;
  clearPersistedCache: () => void;
}

const PostHistoryContext = createContext<PostHistoryContextType | undefined>(
  undefined
);

export const usePostHistory = () => {
  const context = useContext(PostHistoryContext);
  if (!context) {
    throw new Error("usePostHistory must be used within a PostHistoryProvider");
  }
  return context;
};

interface PostHistoryProviderProps {
  children: React.ReactNode;
}

export const PostHistoryProvider: React.FC<PostHistoryProviderProps> = ({
  children,
}) => {
  const [postHistory, setPostHistory] = usePersistedState(
    "postHistory",
    []
  ) as [Post[], React.Dispatch<React.SetStateAction<Post[]>>];

  const addPostToHistory = useCallback((post: Post) => {
    setPostHistory((prev) => {
      // Don't add the same post if it's already the current one
      if (prev.length > 0 && prev[prev.length - 1].id === post.id) {
        console.log("PostHistory - Not adding duplicate post:", post.id);
        return prev;
      }
      console.log(
        "PostHistory - Adding post to history:",
        post.id,
        "Current history length:",
        prev.length
      );
      return [...prev, post];
    });
  }, []);

  const goBackToPreviousPost = useCallback((): Post | null => {
    let previousPost: Post | null = null;

    setPostHistory((prev) => {
      console.log(
        "PostHistory - goBackToPreviousPost, current history length:",
        prev.length
      );
      if (prev.length <= 1) {
        console.log(
          "PostHistory - Only one post in history, staying on current post"
        );
        return prev; // Keep at least one post (current)
      }
      // Get the previous post before removing the current one
      previousPost = prev[prev.length - 2];
      console.log("PostHistory - Going back to post:", previousPost?.id);
      return prev.slice(0, -1); // Remove the last post (current)
    });

    return previousPost;
  }, []);

  const canGoBack = useCallback((): boolean => {
    return postHistory.length > 1;
  }, [postHistory]);

  const clearHistory = useCallback(() => {
    console.log("PostHistory - Clearing history");
    setPostHistory([]);
  }, []);

  const clearPersistedCache = useCallback(async () => {
    console.log("PostHistory - Clearing persisted cache");
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.removeItem("postHistory");
      setPostHistory([]);
    } catch (error) {
      console.error("PostHistory - Error clearing persisted cache:", error);
    }
  }, []);

  const value: PostHistoryContextType = {
    postHistory,
    addPostToHistory,
    goBackToPreviousPost,
    canGoBack,
    clearHistory,
    clearPersistedCache,
  };

  return (
    <PostHistoryContext.Provider value={value}>
      {children}
    </PostHistoryContext.Provider>
  );
};
