import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import CommentCard from "./CommentCard";
import { useCommentContext } from "../../context/CommentContext";
import axios from "axios";

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
  replies?: Comment[];
}

interface CommentsListProps {
  postId: number;
  onCommentPress: (comment: Comment) => void;
  onReplyPress: (comment: Comment) => void;
  currentUserId?: number;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

const CommentsList = ({
  postId,
  onCommentPress,
  onReplyPress,
  currentUserId,
  refreshTrigger,
}: CommentsListProps) => {
  const { colors } = useTheme();
  const {
    comments: contextComments,
    loading: contextLoading,
    error: contextError,
    getComments: contextGetComments,
    refreshComments: contextRefreshComments,
    likeComment: contextLikeComment,
    deleteComment: contextDeleteComment,
  } = useCommentContext();

  // Get cached comments for this post
  const cachedComments = contextComments[postId] || [];

  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  const loadComments = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      if (loadingRef.current && !refresh) return;

      loadingRef.current = true;

      try {
        if (refresh) {
          setRefreshing(true);
        }

        console.log(
          "Loading comments for postId:",
          postId,
          "type:",
          typeof postId
        );

        // Use context method to load comments (this will use cache if available)
        await contextGetComments(postId);

        setPage(pageNum);
      } catch (err) {
        console.error("Error loading comments:", err);
      } finally {
        setRefreshing(false);
        loadingRef.current = false;
      }
    },
    [postId, contextGetComments]
  );

  const refreshComments = useCallback(() => {
    setPage(1);
    contextRefreshComments(postId);
  }, [postId, contextRefreshComments]);

  const loadMoreComments = useCallback(() => {
    if (hasMore && !contextLoading) {
      loadComments(page + 1);
    }
  }, [hasMore, contextLoading, page, loadComments]);

  useEffect(() => {
    loadComments(1);
  }, [postId]);

  // Refresh comments when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log("Refreshing comments due to trigger:", refreshTrigger);
      refreshComments();
    }
  }, [refreshTrigger, refreshComments]);

  const handleLike = async (commentId: number) => {
    if (!currentUserId) return;

    try {
      await contextLikeComment(commentId, currentUserId);
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!currentUserId) return;

    try {
      await contextDeleteComment(commentId, currentUserId);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    // Don't render if essential data is missing
    if (!item || !item.firstname || !item.lastname || !item.username) {
      return null;
    }

    // Handle case where user_id might be null for existing comments
    const isOwner = Boolean(
      item.user_id && currentUserId && item.user_id === currentUserId
    );
    console.log(
      "CommentsList - currentUserId:",
      currentUserId,
      "type:",
      typeof currentUserId,
      "item.user_id:",
      item.user_id,
      "type:",
      typeof item.user_id,
      "isOwner:",
      isOwner
    );

    return (
      <View key={item.id}>
        <CommentCard
          comment={item}
          depth={0}
          onLike={handleLike}
          onReply={onReplyPress}
          onDelete={handleDelete}
          isOwner={isOwner}
          isLiked={false} // TODO: Implement liked state
        />
        {/* Render replies if they exist */}
        {item.replies && item.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {item.replies.map((reply) => {
              // Don't render reply if essential data is missing
              if (
                !reply ||
                !reply.firstname ||
                !reply.lastname ||
                !reply.username
              ) {
                return null;
              }

              // Handle case where user_id might be null for existing comments
              const replyIsOwner = Boolean(
                reply.user_id &&
                  currentUserId &&
                  reply.user_id === currentUserId
              );
              console.log(
                "CommentsList Reply - currentUserId:",
                currentUserId,
                "type:",
                typeof currentUserId,
                "reply.user_id:",
                reply.user_id,
                "type:",
                typeof reply.user_id,
                "replyIsOwner:",
                replyIsOwner
              );

              return (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  depth={1}
                  onLike={handleLike}
                  onReply={onReplyPress}
                  onDelete={handleDelete}
                  isOwner={replyIsOwner}
                  isLiked={false}
                  parentComment={item} // Pass the parent comment for "replying to" display
                />
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!contextLoading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.PRIMARY} />
        <Text style={[styles.loadingText, { color: colors.onBackground }]}>
          Loading comments...
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={48} color={Colors.GRAY} />
      <Text style={[styles.emptyText, { color: colors.onBackground }]}>
        No comments yet
      </Text>
      <Text style={[styles.emptySubtext, { color: Colors.GRAY }]}>
        Be the first to comment!
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
      <Text style={[styles.errorText, { color: colors.onBackground }]}>
        {contextError}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={refreshComments}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (contextError) {
    return renderError();
  }

  // Show loading state when fetching comments for the first time
  if (contextLoading && cachedComments.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.PRIMARY} />
          <Text style={[styles.loadingText, { color: colors.onBackground }]}>
            Loading comments...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {cachedComments.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          {cachedComments.map((comment) => (
            <View key={comment.id}>{renderComment({ item: comment })}</View>
          ))}
          {renderFooter()}
        </>
      )}
    </View>
  );
};

export default CommentsList;

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  repliesContainer: {
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: Colors.GRAY + "30",
    paddingLeft: 8,
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
