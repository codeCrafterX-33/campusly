import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useRef, useContext, useEffect } from "react";
import UserAvatar from "./Useravatar";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { AuthContext } from "../../context/AuthContext";
import { PostContext } from "../../context/PostContext";
import { useLikeCache } from "../../context/LikeCacheContext";
import CampuslyAlert from "../CampuslyAlert";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { Moment } from "../../util/Moment";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

  return (
    <VideoView
      style={styles.fullscreenImage}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
      nativeControls={true}
    />
  );
};

const PostCard = ({
  post,
  onCommentPress,
  onPostPress,
  onDelete,
  onPostUpdate,
  clickable = true,
}: {
  post: any;
  onCommentPress?: () => void;
  onPostPress?: () => void;
  onDelete?: (postId: number) => void;
  onPostUpdate?: (updatedPost: any) => void;
  clickable?: boolean;
}) => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const { userData, getUserById, getCachedUser } = useContext(AuthContext);
  const { getPosts, deletePost } = useContext(PostContext);
  const {
    toggleLike,
    isLiking,
    getCachedLikeStatus,
    getCachedLikeCount,
    setCachedLikeCount,
    checkLikeStatus,
    getLikeCount,
  } = useLikeCache();
  const carouselRef = useRef<FlatList>(null);

  // Like state - use cached values or fallback to post data
  const [isLiked, setIsLiked] = useState(
    () => getCachedLikeStatus(post.id) ?? false
  );
  const [likeCount, setLikeCount] = useState(
    () => getCachedLikeCount(post.id) ?? post.like_count ?? 0
  );

  // Preload user data when post becomes visible (handled by parent FlatList)
  // This useEffect is removed - preloading is now handled by onViewableItemsChanged

  // Sync with cache - use cached values or post data as fallback
  useEffect(() => {
    // Check cache first - use cached values immediately
    const cachedLiked = getCachedLikeStatus(post.id);
    const cachedCount = getCachedLikeCount(post.id);

    if (cachedLiked !== null) {
      setIsLiked(cachedLiked);
    } else {
      // Default to not liked, but don't cache this default value
      // The cache will be populated when user interacts or when we fetch from server
      setIsLiked(false);
    }

    if (cachedCount !== null) {
      setLikeCount(cachedCount);
    } else {
      // Use post data as fallback and cache it
      const count = post.like_count || 0;
      setLikeCount(count);
      setCachedLikeCount(post.id, count);
    }
  }, [
    post.id,
    post.like_count,
    getCachedLikeStatus,
    getCachedLikeCount,
    setCachedLikeCount,
  ]);

  // Background check for like status when cache is empty
  useEffect(() => {
    const checkInitialLikeStatus = async () => {
      const cachedLiked = getCachedLikeStatus(post.id);

      // Only check server if we don't have cached data
      if (cachedLiked === null && userData?.id) {
        try {
          const isLiked = await checkLikeStatus(post.id);
          setIsLiked(isLiked);
        } catch (error) {
          // Silently fail - we'll default to false
          console.warn("Could not fetch initial like status:", error);
        }
      }
    };

    checkInitialLikeStatus();
  }, [post.id, userData?.id, getCachedLikeStatus, checkLikeStatus]);

  const handleLike = async () => {
    if (!userData?.id) return;

    // The toggleLike function handles optimistic updates and caching
    await toggleLike(post.id);

    // Sync local state with cache after toggle
    const cachedLiked = getCachedLikeStatus(post.id);
    const cachedCount = getCachedLikeCount(post.id);

    if (cachedLiked !== null) {
      setIsLiked(cachedLiked);
    }
    if (cachedCount !== null) {
      setLikeCount(cachedCount);
    }
  };

  const handleDelete = (postId: number) => {
    if (!userData?.id) return;
    setShowDeleteAlert(true);
  };

  const confirmDeletePost = async () => {
    if (!userData?.id || !post) return;

    setLoading(true);
    try {
      const success = await deletePost(post.id, userData.id);
      if (success) {
        setShowDeleteAlert(false);
        // Post will be automatically removed from state by the deletePost function
        console.log("Post deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  const name = post.username || "Anonymous";
  const fullname =
    post.firstname && post.lastname
      ? `${post.firstname} ${post.lastname}`
      : name;
  const content = post.content;
  const image = post.image || "https://via.placeholder.com/50";
  const createdon = post.createdon || new Date().toISOString();

  let media = [];
  if (Array.isArray(post.media)) {
    media = post.media;
  } else if (post.media && Array.isArray(post.media.media)) {
    media = post.media.media;
  }

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={() => {
        if (onPostPress) {
          onPostPress();
        } else if (clickable) {
          navigation.navigate("PostScreen", { post });
        }
      }}
    >
      <View style={styles.headerContainer}>
        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              console.log("Avatar clicked! Post data:", {
                user_id: post.user_id,

                username: post.username,
                firstname: post.firstname,
                lastname: post.lastname,
              });
              console.log("Navigation object:", navigation);

              // Try different user ID fields that might be available
              const userId = post.user_id;
              console.log("Resolved user ID:", userId);

              if (userId) {
                // Check if we have cached complete profile data first
                const cachedUser = getCachedUser(userId.toString());

                if (cachedUser) {
                  console.log(
                    "🟢 PostCard - Using cached complete profile data for post author:",
                    userId,
                    "Source: PostCard_Cached"
                  );
                  // If we have cached data, pass minimal params since Profile will use cached data
                  console.log("Navigating with cached user data");
                  navigation.navigate("Profile", {
                    user_id: userId,
                  });
                } else {
                  console.log(
                    "🟡 PostCard - No cached data, passing post data for immediate display:",
                    userId,
                    "Source: PostCard_Fresh"
                  );
                  // Pass post data for immediate display while fetching complete data
                  console.log("Navigating with fresh user data");
                  navigation.navigate("Profile", {
                    user_id: userId,
                    firstname: post.firstname,
                    lastname: post.lastname,
                    username: post.username,
                    image: post.image,
                    studentstatusverified: post.studentstatusverified,
                    headline: post.headline,
                    about: post.about,
                    school: post.school,
                    city: post.city,
                    country: post.country,
                    joined_at: post.joined_at,
                    skills: post.skills,
                    interests: post.interests,
                  });
                }
              } else {
                console.log("No user_id found in post data");
              }
            }}
            style={styles.clickableAvatar}
          >
            <Image source={{ uri: image }} style={styles.profileImage} />
          </TouchableOpacity>
          <View style={styles.userTextInfo}>
            <View style={styles.nameRow}>
              <View style={styles.nameWithVerification}>
                <Text style={[styles.userName, { color: colors.onBackground }]}>
                  {fullname}
                </Text>
                {post.studentstatusverified && (
                  <View style={styles.greenCheckBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#10B981"
                    />
                  </View>
                )}
                {post.studentstatusverified && (
                  <View style={styles.verificationBadge}>
                    <Text style={styles.verificationText}>🎓</Text>
                  </View>
                )}
              </View>
              {post.username && (
                <Text style={styles.userHandle}>
                  @{post.username.replace(/\s+/g, "")}
                </Text>
              )}
            </View>
            <Text style={styles.timestamp}>{Moment(createdon || "")}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.ellipsisButton}
          onPress={(e) => {
            e.stopPropagation();
            setOptionsModalVisible(true);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.GRAY} />
        </TouchableOpacity>
      </View>

      <View style={styles.postBody}>
        {content && (
          <Text style={[styles.content, { color: colors.onBackground }]}>
            {content}
          </Text>
        )}

        {post.imageurl && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setModalVisible(true);
            }}
          >
            <Image source={{ uri: post.imageurl }} style={styles.image} />
          </Pressable>
        )}

        {/* Media preview */}
        {media && Array.isArray(media) && media.length > 0 && (
          <View style={styles.mediaGrid}>
            {media.map((item: any, index: number) => {
              if (!item?.type || !item?.url) {
                console.log("Missing media item:", item);
                return (
                  <Pressable>
                    <Text>No media</Text>
                  </Pressable>
                );
              }
              const type = item.type.trim().toLowerCase();

              // Check if this is the last item in an odd-numbered row
              const isLastInOddRow =
                media.length % 2 !== 0 && // Total count is odd
                index === media.length - 1; // This is the last item

              // Use full width for single items or last items in odd rows
              const useFullWidth = media.length === 1 || isLastInOddRow;

              return (
                <Pressable
                  key={index}
                  style={[useFullWidth && styles.fullWidthMediaContainer]}
                  onPress={(e) => {
                    e.stopPropagation();
                    setPreviewIndex(index);
                    setModalVisible(true);
                  }}
                >
                  {type === "image" ? (
                    <View style={{ position: "relative" }}>
                      <Image
                        source={{ uri: item.url }}
                        style={[
                          useFullWidth
                            ? styles.singleMediaItem
                            : styles.mediaItem,
                        ]}
                      />
                    </View>
                  ) : type === "video" ? (
                    <View style={styles.videoThumb}>
                      <Image
                        source={{
                          uri: item.url.replace(
                            "/upload/",
                            "/upload/w_500,h_500,c_fill,q_auto,f_jpg/"
                          ),
                        }}
                        style={[
                          useFullWidth
                            ? styles.singleMediaThumbnail
                            : styles.mediaThumbnail,
                        ]}
                      />
                      <View style={styles.videoOverlay}>
                        <Ionicons
                          name="play-circle-outline"
                          size={40}
                          color="white"
                        />
                      </View>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: post.imageurl }}
                      style={styles.image}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.fullscreenContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          {/* Media counter */}
          {media.length > 1 && (
            <View style={styles.mediaCounter}>
              <Text style={styles.mediaCounterText}>
                {previewIndex + 1} / {media.length}
              </Text>
            </View>
          )}

          {/* Carousel */}
          <FlatList
            ref={carouselRef}
            data={
              media.length > 0 ? media : [{ type: "image", url: post.imageurl }]
            }
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={previewIndex}
            getItemLayout={(data, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setPreviewIndex(newIndex);
            }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              if (!item?.type || !item?.url) {
                return (
                  <View style={styles.mediaSlide}>
                    <Text style={styles.noMediaText}>No media available</Text>
                  </View>
                );
              }

              const type = item.type.trim().toLowerCase();
              return (
                <View style={styles.mediaSlide}>
                  {type === "image" ? (
                    <Image
                      source={{ uri: item.url }}
                      style={styles.fullscreenImage}
                      resizeMode="contain"
                    />
                  ) : type === "video" ? (
                    <VideoComponent
                      uri={item.url}
                      shouldPlay={index === previewIndex}
                    />
                  ) : (
                    <Image
                      source={{ uri: item.url }}
                      style={styles.fullscreenImage}
                      resizeMode="contain"
                    />
                  )}
                </View>
              );
            }}
          />

          {/* Navigation dots for multiple media */}
          {media.length > 1 && (
            <View style={styles.dotsContainer}>
              {media.map((_: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dot,
                    index === previewIndex
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                  onPress={() => {
                    setPreviewIndex(index);
                    carouselRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>

      {/* Options Modal */}
      <Modal
        visible={optionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.onBackground }]}>
                Post Options
              </Text>
              <TouchableOpacity
                onPress={() => setOptionsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.onBackground} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalOptions}>
              {/* Only show delete option if user owns the post */}
              {userData && post.user_id === userData.id && (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setOptionsModalVisible(false);
                    handleDelete(post.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
                  <Text style={[styles.modalOptionText, { color: "#FF6B6B" }]}>
                    Delete Post
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
                <Ionicons
                  name="copy-outline"
                  size={24}
                  color={colors.onBackground}
                />
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: colors.onBackground },
                  ]}
                >
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
                <Ionicons
                  name="flag-outline"
                  size={24}
                  color={colors.onBackground}
                />
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: colors.onBackground },
                  ]}
                >
                  Report Post
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* dedicated CommentScreen */}

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          disabled={isLiking}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={20}
            color={isLiked ? "#EF4444" : Colors.GRAY}
          />
          <Text
            style={[
              styles.footerText,
              { color: isLiked ? "#EF4444" : Colors.GRAY },
            ]}
          >
            {likeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={(e) => {
            e.stopPropagation();
            if (onCommentPress) {
              console.log("PostCard: Calling onCommentPress");
              onCommentPress();
            } else {
              console.log(
                "PostCard: Navigating to CommentScreen with post:",
                post.id
              );
              navigation.navigate("CommentScreen", { post });
            }
          }}
        >
          <Ionicons name="chatbubble-outline" size={20} color={Colors.GRAY} />
          <Text style={styles.footerText}>{post.comment_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={(e) => {
            e.stopPropagation();
            // TODO: Add repost functionality
          }}
        >
          <Ionicons name="repeat-outline" size={20} color={Colors.GRAY} />
          <Text style={styles.footerText}>{post.reposts || 0}</Text>
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

      {/* Delete Confirmation Alert */}
      <CampuslyAlert
        isVisible={showDeleteAlert}
        type="error"
        onClose={() => setShowDeleteAlert(false)}
        messages={{
          success: {
            title: "Post Deleted! 🗑️",
            message: "Your post has been successfully deleted.",
            icon: "🎉",
          },
          error: {
            title: "Delete Post? 🗑️",
            message:
              "This action cannot be undone. Your post will be permanently deleted! 😱",
            icon: "⚠️",
          },
        }}
        onPress={confirmDeletePost}
        onPress2={() => setShowDeleteAlert(false)}
        buttonText="Yes, delete it"
        buttonText2="Cancel"
        overrideDefault={true}
        isLoading={loading}
        loadingText="Deleting... 🗑️"
      />
    </Pressable>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 16,
    backgroundColor: Colors.WHITE,
    padding: 15,
    borderWidth: 0.2,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 5,
    borderColor: Colors.GRAY,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pressedContainer: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
    backgroundColor: "#f8f8f8",
    borderColor: Colors.PRIMARY,
    borderWidth: 0.5,
  },
  postBody: {
    flex: 1,
  },
  content: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginTop: 10,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
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
    padding: 5,
  },
  mediaCounter: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mediaCounterText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  mediaSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  noMediaText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 50,
    flexDirection: "row",
    alignSelf: "center",
    zIndex: 1000,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "white",
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
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
    marginLeft: 5,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  fullWidthMediaContainer: {
    width: "100%",
  },

  mediaItem: {
    width: (SCREEN_WIDTH - 60) / 2,
    height: 150,
    borderRadius: 8,
    backgroundColor: "transparent",
  },

  singleMediaItem: {
    width: SCREEN_WIDTH - 46,
    height: 250,
    borderRadius: 8,
    backgroundColor: "transparent",
  },

  videoThumb: {
    position: "relative",
  },
  mediaThumbnail: {
    width: (SCREEN_WIDTH - 60) / 2,
    height: 150,
    borderRadius: 8,
  },
  singleMediaThumbnail: {
    width: SCREEN_WIDTH - 46,
    height: 250,
    borderRadius: 8,
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    zIndex: 1,
  },
  videoLabel: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
    fontWeight: "600",
  },

  videoTouchContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  videoTopTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "transparent",
  },

  videoLeftTouch: {
    position: "absolute",
    top: 80,
    left: 0,
    width: 60,
    bottom: 80,
    backgroundColor: "transparent",
  },

  videoRightTouch: {
    position: "absolute",
    top: 80,
    right: 0,
    width: 60,
    bottom: 80,
    backgroundColor: "transparent",
  },

  // Header and Options Modal Styles
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  clickableAvatar: {
    marginRight: 8,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.PRIMARY + "30",
  },
  userTextInfo: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  nameWithVerification: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
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
  userHandle: {
    fontSize: 12,
    color: "gray",
    marginLeft: 8,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
  ellipsisButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area padding
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
    color: "#000",
  },

  // Comment Modal Styles removed - now using dedicated CommentScreen
});
