import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import usePersistedState from "../util/PersistedState";

interface Comment {
  id: number;
  content: string;
  media: { media: Array<{ url: string; type: string }> };
  createdon: string;
  createdby: string;
  user_id: number;
  firstname: string;
  lastname: string;
  username: string;
  user_image: string;
  studentstatusverified: boolean;
  like_count: number;
  comment_depth: number;
  parent_post_id: number;
  replies?: Comment[];
}

interface CreateCommentData {
  postId: number;
  content: string;
  media: Array<{ url: string; type: string }>;
  user_id: number;
  createdby: string;
  parentCommentId?: number;
}

interface CommentContextType {
  comments: { [postId: number]: Comment[] };
  loading: boolean;
  error: string | null;
  getComments: (postId: number) => Promise<void>;
  addComment: (commentData: CreateCommentData) => Promise<Comment | null>;
  updateComment: (
    commentId: number,
    content: string,
    user_id: number
  ) => Promise<boolean>;
  deleteComment: (commentId: number, user_id: number) => Promise<boolean>;
  likeComment: (commentId: number, user_id: number) => Promise<boolean>;
  refreshComments: (postId: number) => Promise<void>;
  clearComments: (postId: number) => void;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return context;
};

interface CommentProviderProps {
  children: React.ReactNode;
}

export const CommentProvider: React.FC<CommentProviderProps> = ({
  children,
}) => {
  const [comments, setComments] = usePersistedState("comments", {}) as [
    { [postId: number]: Comment[] },
    React.Dispatch<React.SetStateAction<{ [postId: number]: Comment[] }>>
  ];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getComments = useCallback(async (postId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/comment/${postId}`,
        {
          params: {
            page: 1,
            limit: 50,
            includeReplies: true,
          },
        }
      );

      const commentsData = response.data.comments || [];
      setComments((prev) => ({
        ...prev,
        [postId]: commentsData,
      }));
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(
    async (commentData: CreateCommentData): Promise<Comment | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/comment`,
          commentData
        );

        const newComment = response.data.data;

        // Add the new comment to the state
        setComments((prev) => ({
          ...prev,
          [commentData.postId]: [
            newComment,
            ...(prev[commentData.postId] || []),
          ],
        }));

        return newComment;
      } catch (err) {
        console.error("Error creating comment:", err);
        setError("Failed to create comment");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateComment = useCallback(
    async (
      commentId: number,
      content: string,
      user_id: number
    ): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await axios.put(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/comment/${commentId}`,
          {
            content,
            user_id,
          }
        );

        // Update the comment in state
        setComments((prev) => {
          const newComments = { ...prev };
          Object.keys(newComments).forEach((postId) => {
            newComments[parseInt(postId)] = newComments[parseInt(postId)].map(
              (comment) => {
                if (comment.id === commentId) {
                  return { ...comment, content };
                }
                return comment;
              }
            );
          });
          return newComments;
        });

        return true;
      } catch (err) {
        console.error("Error updating comment:", err);
        setError("Failed to update comment");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteComment = useCallback(
    async (commentId: number, user_id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await axios.delete(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/comment/${commentId}`,
          {
            data: { user_id },
          }
        );

        // Remove the comment from state
        setComments((prev) => {
          const newComments = { ...prev };
          Object.keys(newComments).forEach((postId) => {
            newComments[parseInt(postId)] = newComments[
              parseInt(postId)
            ].filter((comment) => comment.id !== commentId);
          });
          return newComments;
        });

        return true;
      } catch (err) {
        console.error("Error deleting comment:", err);
        setError("Failed to delete comment");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const likeComment = useCallback(
    async (commentId: number, user_id: number): Promise<boolean> => {
      try {
        setError(null);

        await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/comment/${commentId}/like`,
          { user_id }
        );

        // Update like count in state (optimistic update)
        setComments((prev) => {
          const newComments = { ...prev };
          Object.keys(newComments).forEach((postId) => {
            newComments[parseInt(postId)] = newComments[parseInt(postId)].map(
              (comment) => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    like_count: comment.like_count + 1,
                  };
                }
                return comment;
              }
            );
          });
          return newComments;
        });

        return true;
      } catch (err) {
        console.error("Error liking comment:", err);
        setError("Failed to like comment");
        return false;
      }
    },
    []
  );

  const refreshComments = useCallback(
    async (postId: number) => {
      await getComments(postId);
    },
    [getComments]
  );

  const clearComments = useCallback((postId: number) => {
    setComments((prev) => {
      const newComments = { ...prev };
      delete newComments[postId];
      return newComments;
    });
  }, []);

  const value: CommentContextType = {
    comments,
    loading,
    error,
    getComments,
    addComment,
    updateComment,
    deleteComment,
    likeComment,
    refreshComments,
    clearComments,
  };

  return (
    <CommentContext.Provider value={value}>{children}</CommentContext.Provider>
  );
};

export default CommentContext;
