import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { VideoView, useVideoPlayer } from "expo-video";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import Colors from "../../constants/Colors";
import UserAvatar from "./Useravatar";
import CampuslyAlert from "../CampuslyAlert";
import { AuthContext } from "../../context/AuthContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Video component using new expo-video API
const VideoComponent = ({
  uri,
  shouldPlay,
}: {
  uri: string;
  shouldPlay: boolean;
}) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.muted = false;
  });

  React.useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, player]);

  return <VideoView style={styles.fullscreenImage} player={player} />;
};

// Function to format date: day and month if same year, full date if different year
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isSameYear = date.getFullYear() === now.getFullYear();

  if (isSameYear) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

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
  image: string;
  studentstatusverified: boolean;
  like_count: number;
  comment_count?: number;
  comment_depth: number;
  parent_post_id: number;
  replies?: Comment[];
  // Additional fields for profile navigation
  headline?: string;
  about?: string;
  school?: string;
  city?: string;
  country?: string;
  joined_at?: string;
  skills?: string[];
  interests?: string[];
}

interface CommentCardProps {
  comment: Comment;
  depth?: number;
  onLike: (commentId: number) => void;
  onReply: (comment: Comment) => void;
  onDelete?: (commentId: number) => void;
  onCommentPress?: (comment: Comment) => void;
  isOwner?: boolean;
  isLiked?: boolean;
  parentComment?: Comment;
}

const CommentCard = ({
  comment,
  depth = 0,
  onLike,
  onReply,
  onDelete,
  onCommentPress,
  isOwner = false,
  isLiked = false,
  parentComment,
}: CommentCardProps) => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userData, getCachedUser } = useContext(AuthContext);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showReplies, setShowReplies] = useState(false);
  // No depth restrictions - allow infinite nesting like Twitter

  const confirmDeleteComment = async () => {
    setLoading(true);
    try {
      onDelete?.(comment.id);
      setShowDeleteAlert(false);
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!comment) return null;

  // Check if essential data is available
  if (!comment.firstname || !comment.lastname || !comment.username) {
    return null; // Don't render until data is complete
  }

  const fullName = `${comment.firstname} ${comment.lastname}`;
  const userName = comment.username;
  const content = comment.content || "";
  const image = comment.image || "https://via.placeholder.com/50";
  const createdon = comment.createdon || new Date().toISOString();
  const isReply = depth > 0;
  const canReply = true; // Allow infinite nesting like Twitter

  // Parse media from JSONB
  let media: any[] = [];
  if (
    comment.media &&
    comment.media.media &&
    Array.isArray(comment.media.media)
  ) {
    media = comment.media.media;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Comment Content */}
      <Pressable
        style={[
          styles.commentContent,
          { marginLeft: Math.min(depth * 16, 80) },
        ]}
        onPress={() => {
          if (onCommentPress) {
            // Use the callback if provided (from PostScreen)
            onCommentPress(comment);
          } else {
            // Fallback to direct navigation (from other screens)
            navigation.navigate("PostScreen", {
              post: {
                id: comment.id,
                content: comment.content,
                media: comment.media,
                createdon: comment.createdon,
                createdby: comment.createdby,
                user_id: comment.user_id,
                firstname: comment.firstname,
                lastname: comment.lastname,
                username: comment.username,
                image: comment.image,
                studentstatusverified: comment.studentstatusverified,
                like_count: comment.like_count,
                comment_count: comment.comment_count || 0,
                parent_post_id: comment.parent_post_id,
              },
            });
          }
        }}
      >
        {/* User Info Row */}
        <View style={styles.userInfoRow}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              if (comment.user_id) {
                // Only prevent navigation to your own profile
                if (comment.user_id === userData?.id) {
                  console.log("Cannot navigate to own profile from comment");
                  return;
                }

                console.log(
                  "Navigating to commenter profile:",
                  comment.user_id
                );
                console.log("Comment data for navigation:", {
                  user_id: comment.user_id,
                  firstname: comment.firstname,
                  lastname: comment.lastname,
                  username: comment.username,
                  headline: comment.headline,
                  about: comment.about,
                  school: comment.school,
                  city: comment.city,
                  country: comment.country,
                  joined_at: comment.joined_at,
                  skills: comment.skills,
                  interests: comment.interests,
                });
                // Check if we have cached data for instant display
                const cachedUser = getCachedUser(comment.user_id.toString());

                navigation.navigate("Profile", {
                  user_id: comment.user_id.toString(),
                  firstname: comment.firstname,
                  lastname: comment.lastname,
                  username: comment.username,
                  image: comment.image,
                  studentstatusverified: comment.studentstatusverified,
                  headline: comment.headline || "",
                  about: comment.about || "",
                  school: comment.school || "",
                  city: comment.city || "",
                  country: comment.country || "",
                  joined_at: comment.joined_at || "",
                  skills: comment.skills || [],
                  interests: comment.interests || [],
                });
              }
            }}
            style={styles.clickableAvatar}
          >
            <Image
              source={{ uri: image }}
              style={
                comment.user_id && comment.user_id !== userData?.id
                  ? styles.clickableProfilePicture
                  : styles.profilePicture
              }
            />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <View style={styles.nameWithVerification}>
                <Text style={[styles.userName, { color: colors.onBackground }]}>
                  {fullName}
                </Text>
                {comment.studentstatusverified && (
                  <View style={styles.greenCheckBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#10B981"
                    />
                  </View>
                )}
                {comment.studentstatusverified && (
                  <View style={styles.verificationBadge}>
                    <Text style={styles.verificationText}>🎓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.userHandle}>
                @{userName.replace(/\s+/g, "")}
              </Text>
            </View>
            <Text style={styles.timestamp}>{formatDate(createdon)}</Text>
          </View>
          <TouchableOpacity
            style={styles.ellipsisButton}
            onPress={(e) => {
              e.stopPropagation();
              setOptionsModalVisible(true);
            }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={Colors.GRAY}
            />
          </TouchableOpacity>
        </View>

        {/* Replying To */}
        {parentComment && (
          <View style={styles.replyingToContainer}>
            <Text style={[styles.replyingToText, { color: Colors.GRAY }]}>
              Replying to{" "}
              <Text
                style={[styles.replyingToName, { color: colors.onBackground }]}
              >
                {parentComment.firstname} {parentComment.lastname}
              </Text>
            </Text>
          </View>
        )}

        {/* Comment Text */}
        {content && (
          <Text style={[styles.commentText, { color: colors.onBackground }]}>
            {content}
          </Text>
        )}

        {/* Media Display */}
        {media && media.length > 0 && (
          <View style={styles.mediaContainer}>
            {media.map((item: any, index: number) => {
              if (!item?.type || !item?.url) return null;

              const type = item.type.trim().toLowerCase();
              return (
                <Pressable
                  key={index}
                  style={styles.mediaItem}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (!item.isUploading) {
                      setPreviewIndex(index);
                      setMediaModalVisible(true);
                    }
                  }}
                >
                  {type === "image" ? (
                    <View style={{ position: "relative" }}>
                      <Image
                        source={{ uri: item.url }}
                        style={[
                          styles.mediaImage,
                          item.isUploading && { opacity: 0.7 },
                        ]}
                        resizeMode="cover"
                      />
                      {item.isUploading && (
                        <View
                          style={[styles.uploadingOverlay, styles.mediaImage]}
                        >
                          <ActivityIndicator
                            size="small"
                            color={Colors.PRIMARY}
                          />
                          <Text style={styles.uploadingText}>Uploading...</Text>
                        </View>
                      )}
                    </View>
                  ) : type === "video" ? (
                    <View style={styles.videoContainer}>
                      <Image
                        source={{
                          uri: item.url.replace(
                            "/upload/",
                            "/upload/w_200,h_200,c_fill,q_auto,f_jpg/"
                          ),
                        }}
                        style={[
                          styles.mediaImage,
                          item.isUploading && { opacity: 0.7 },
                        ]}
                        resizeMode="cover"
                      />
                      <View style={styles.videoOverlay}>
                        <Ionicons
                          name="play-circle-outline"
                          size={24}
                          color="white"
                        />
                      </View>
                      {item.isUploading && (
                        <View
                          style={[styles.uploadingOverlay, styles.mediaImage]}
                        >
                          <ActivityIndicator
                            size="small"
                            color={Colors.PRIMARY}
                          />
                          <Text style={styles.uploadingText}>Uploading...</Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Footer - Consistent with PostCard */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.footerItem}
            onPress={(e) => {
              e.stopPropagation();
              onLike(comment.id);
            }}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#FF6B6B" : Colors.GRAY}
            />
            <Text style={styles.footerText}>{comment.like_count || 0}</Text>
          </TouchableOpacity>
          {/* 
          {canReply && (
            <TouchableOpacity
              style={styles.footerItem}
              onPress={(e) => {
                e.stopPropagation();
                onReply(comment);
              }}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={Colors.GRAY}
              />
              <Text style={styles.footerText}>Reply</Text>
            </TouchableOpacity>
          )} */}

          <TouchableOpacity
            style={styles.footerItem}
            onPress={(e) => {
              e.stopPropagation();
              onReply(comment);
            }}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={20}
              color={Colors.GRAY}
            />
            <Text style={styles.footerText}>{comment.comment_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={(e) => {
              e.stopPropagation();
              // TODO: Add repost functionality
            }}
          >
            <Ionicons name="repeat-outline" size={20} color={Colors.GRAY} />
            <Text style={styles.footerText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerItem}
            onPress={(e) => {
              e.stopPropagation();
              // TODO: Add bookmark functionality
            }}
          >
            <Ionicons name="bookmark-outline" size={20} color={Colors.GRAY} />
          </TouchableOpacity>
        </View>

        {/* Replies Toggle */}
      </Pressable>

      {/* Options Modal */}
      <Modal
        visible={optionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comment Options</Text>
              <TouchableOpacity
                onPress={() => setOptionsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={Colors.GRAY} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalOptions}>
              {isOwner && (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setOptionsModalVisible(false);
                    setShowDeleteAlert(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                  <Text style={[styles.modalOptionText, { color: "#FF6B6B" }]}>
                    Delete Comment
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setOptionsModalVisible(false);
                  // TODO: Add copy functionality
                }}
              >
                <Ionicons name="copy-outline" size={24} color={Colors.GRAY} />
                <Text style={[styles.modalOptionText, { color: Colors.GRAY }]}>
                  Copy Text
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setOptionsModalVisible(false);
                  // TODO: Add report functionality
                }}
              >
                <Ionicons name="flag-outline" size={24} color={Colors.GRAY} />
                <Text style={[styles.modalOptionText, { color: Colors.GRAY }]}>
                  Report Comment
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Media Preview Modal */}
      <Modal visible={mediaModalVisible} transparent={true}>
        <View style={styles.fullscreenContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setMediaModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          {/* Media Display */}
          {media && media.length > 0 && (
            <View style={styles.fullscreenMediaContainer}>
              {media[previewIndex]?.type?.trim().toLowerCase() === "image" ? (
                <Image
                  source={{ uri: media[previewIndex].url }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              ) : media[previewIndex]?.type?.trim().toLowerCase() ===
                "video" ? (
                <VideoComponent
                  uri={media[previewIndex].url}
                  shouldPlay={true}
                />
              ) : null}
            </View>
          )}

          {/* Navigation dots for multiple media */}
          {media && media.length > 1 && (
            <View style={styles.dotsContainer}>
              {media.map((_: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    index === previewIndex && styles.activeDot,
                  ]}
                  onPress={() => setPreviewIndex(index)}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>

      {/* Delete Confirmation Alert */}
      <CampuslyAlert
        isVisible={showDeleteAlert}
        type="error"
        onClose={() => setShowDeleteAlert(false)}
        messages={{
          success: {
            title: "Comment Deleted! 🗑️",
            message: "Your comment has been successfully deleted.",
            icon: "🎉",
          },
          error: {
            title: "Delete Comment? 🗑️",
            message:
              "This action cannot be undone. Your comment will be permanently deleted! 😱",
            icon: "⚠️",
          },
        }}
        onPress={confirmDeleteComment}
        onPress2={() => setShowDeleteAlert(false)}
        buttonText="Yes, delete it"
        buttonText2="Cancel"
        overrideDefault={true}
        isLoading={loading}
        loadingText="Deleting... 🗑️"
      />
    </View>
  );
};

export default CommentCard;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.GRAY + "30",
  },
  commentContent: {
    flex: 1,
  },
  userInfoRow: {
    flexDirection: "row",
    marginBottom: 8,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  profilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  clickableProfilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.PRIMARY + "30",
  },
  clickableAvatar: {
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  ellipsisButton: {
    padding: 4,
    marginTop: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  nameWithVerification: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  greenCheckBadge: {
    marginLeft: 4,
  },
  verificationBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    borderWidth: 1,
    borderColor: "#000",
  },
  verificationText: {
    fontSize: 10,
  },
  replyingToContainer: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.GRAY + "50",
  },
  replyingToText: {
    fontSize: 12,
  },
  replyingToName: {
    fontWeight: "600",
  },
  userHandle: {
    fontSize: 12,
    color: Colors.GRAY,
    marginLeft: 8,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.GRAY,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  mediaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  mediaItem: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  videoContainer: {
    position: "relative",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  footerContainer: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  footerText: {
    fontSize: 17,
    color: Colors.GRAY,
    marginLeft: 6,
  },
  repliesToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 4,
  },
  repliesText: {
    fontSize: 12,
    marginLeft: 4,
  },
  repliesContainer: {
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.PRIMARY,
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for bottom
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptions: {
    paddingVertical: 10,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 15,
  },
  // Media preview modal styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenMediaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 10,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "white",
  },

  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  uploadingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
