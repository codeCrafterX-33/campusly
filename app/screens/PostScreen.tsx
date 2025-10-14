import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  RefreshControl,
  Animated,
  BackHandler,
} from "react-native";
import React, { useState, useRef, useContext, useEffect } from "react";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { useFocusEffect } from "@react-navigation/native";
// Removed React Navigation imports
import { VideoView, useVideoPlayer } from "expo-video";
import { AuthContext } from "../context/AuthContext";
import { PostContext } from "../context/PostContext";
import { usePostHistory } from "../context/PostHistoryContext";
import PostCard from "../components/Post/PostCard";
import CommentsList from "../components/Post/CommentsList";
import Colors from "../constants/Colors";

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

const PostScreen = ({ route }: { route: any }) => {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { post: propPost, threadHistory: initialThreadHistory } =
    route.params || {};

  // Parse the post data if it's passed as a string
  const post = propPost;
  const parsedThreadHistory = initialThreadHistory;

  const [modalVisible, setModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [threadHistory, setThreadHistory] = useState<any[]>(
    parsedThreadHistory || []
  ); // Track full thread history

  // Handle post updates (like count changes, etc.)
  const handlePostUpdate = (updatedPost: any) => {
    setCurrentPost(updatedPost);
  };
  const [isNavigatingToCommentScreen, setIsNavigatingToCommentScreen] =
    useState(false);
  const isNavigatingRef = useRef(false);

  // Animation states
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const { userData } = useContext(AuthContext);
  const { getPosts, posts } = useContext(PostContext);
  const {
    postHistory,
    addPostToHistory,
    goBackToPreviousPost,
    canGoBack,
    clearHistory,
    clearPersistedCache,
  } = usePostHistory();
  const carouselRef = useRef<FlatList>(null);
  const threadListRef = useRef<FlatList>(null);

  // Add current post to history when component mounts
  useEffect(() => {
    if (currentPost) {
      addPostToHistory(currentPost);
    }
  }, [currentPost, addPostToHistory]);

  // Watch for changes in posts and refresh current post
  useEffect(() => {
    if (posts.length > 0 && currentPost) {
      refreshCurrentPost();
    }
  }, [posts, currentPost]);

  // Trigger initial animation when component mounts
  useEffect(() => {
    animateInitialLoad();
  }, []);

  // Disable back button on PostScreen
  useEffect(() => {
    const backAction = () => {
      // Return true to prevent default back behavior
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Function to refresh comments when a new comment is posted
  const handleCommentPosted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Function to update a specific comment in thread history
  const updateThreadComment = (commentId: number, updatedData: any) => {
    setThreadHistory((prev) => {
      return prev.map((item) => {
        if (item.type === "threadComment" && item.data.id === commentId) {
          return {
            ...item,
            data: {
              ...item.data,
              ...updatedData,
            },
          };
        }
        return item;
      });
    });
  };

  // Animation functions
  const animateThreadTransition = (callback: () => void) => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Fade out and slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Execute the callback (state change)
      callback();

      // Reset and fade in
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    });
  };

  const animateInitialLoad = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle navigation to a new post (from comments)
  const handlePostNavigation = (newPost: any) => {
    setCurrentPost(newPost);
    addPostToHistory(newPost);
  };

  // Refresh current post data from updated posts
  const refreshCurrentPost = () => {
    if (currentPost && posts.length > 0) {
      const updatedPost = posts.find((p: any) => p.id === currentPost.id);
      if (updatedPost) {
        setCurrentPost(updatedPost);

        // Also update thread history if it contains the current post
        setThreadHistory((prev) => {
          return prev.map((item) => {
            if (item.type === "post" && item.data.id === currentPost.id) {
              return { ...item, data: updatedPost };
            }
            return item;
          });
        });
      }
    }
  };

  // Handle comment click for infinite threading
  const handleCommentClick = (comment: any) => {
    console.log("PostScreen - Comment clicked for threading:", comment.id);
    animateThreadTransition(() => {
      setThreadHistory((prev) => [...prev, comment]);
      // Scroll to the specific comment that was clicked
      setTimeout(() => {
        const threadData = buildThreadData();
        const commentIndex = threadData.findIndex(
          (item) => item.type === "threadComment" && item.data.id === comment.id
        );
        console.log("PostScreen - Comment index found:", commentIndex);
        if (commentIndex !== -1) {
          try {
            threadListRef.current?.scrollToIndex({
              index: commentIndex,
              animated: true,
              viewPosition: 0, // Position at top of screen
            });
          } catch (error) {
            console.log(
              "PostScreen - ScrollToIndex error, using scrollToOffset:",
              error
            );
            // Fallback to scrollToOffset
            const estimatedItemHeight = 250;
            const offset = commentIndex * estimatedItemHeight;
            threadListRef.current?.scrollToOffset({
              offset: offset,
              animated: true,
            });
          }
        }
      }, 200); // Increased timeout to ensure animation completes
    });
  };

  // Handle back to previous thread level
  const handleBackToPreviousThread = () => {
    console.log("PostScreen - Back to previous thread level");
    animateThreadTransition(() => {
      setThreadHistory((prev) => prev.slice(0, -1)); // Remove last item
      // Scroll to the last remaining comment in thread
      setTimeout(() => {
        const threadData = buildThreadData();
        const lastCommentIndex = threadData.findIndex(
          (item) => item.type === "threadComment"
        );
        console.log("PostScreen - Last comment index found:", lastCommentIndex);
        if (lastCommentIndex !== -1) {
          try {
            threadListRef.current?.scrollToIndex({
              index: lastCommentIndex,
              animated: true,
              viewPosition: 0,
            });
          } catch (error) {
            console.log(
              "PostScreen - ScrollToIndex error, using scrollToOffset:",
              error
            );
            const estimatedItemHeight = 250;
            const offset = lastCommentIndex * estimatedItemHeight;
            threadListRef.current?.scrollToOffset({
              offset: offset,
              animated: true,
            });
          }
        } else {
          // If no thread comments, scroll to top
          threadListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
      }, 200);
    });
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    console.log("PostScreen - handleBackNavigation called");
    console.log("PostScreen - threadHistory length:", threadHistory.length);
    console.log("PostScreen - canGoBack:", canGoBack());

    // If we're in a thread, go back to previous thread level first
    if (threadHistory.length > 0) {
      console.log("PostScreen - Going back to previous thread level");
      handleBackToPreviousThread();
      return;
    }

    // If we're at main post view, use post history
    if (canGoBack()) {
      const previousPost = goBackToPreviousPost();
      console.log("PostScreen - previousPost:", previousPost?.id);
      if (previousPost) {
        setCurrentPost(previousPost);
        // Scroll to top when navigating to previous post
        setTimeout(() => {
          threadListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
      }
    } else {
      console.log(
        "PostScreen - No more posts in history, going back to previous screen"
      );
      // No more posts in history, go back to previous screen
      navigation.goBack();
    }
  };

  // Build thread data for infinite threading
  const buildThreadData = () => {
    const threadData = [];

    console.log("PostScreen - buildThreadData - currentPost:", currentPost?.id);
    console.log("PostScreen - buildThreadData - threadHistory:", threadHistory);

    // Always show the main post first
    threadData.push({ type: "post", id: currentPost.id, data: currentPost });

    // Show the full thread history (all clicked comments/replies)
    threadHistory.forEach((threadItem, index) => {
      console.log(
        "PostScreen - Adding thread item:",
        threadItem.id,
        "level:",
        index + 1
      );
      threadData.push({
        type: "threadComment",
        id: threadItem.id,
        data: threadItem,
        level: index + 1, // Track the level for styling
      });
    });

    // Add comments section
    threadData.push({ type: "comments", id: "comments" });

    console.log(
      "PostScreen - Final thread data:",
      threadData.map((item) => ({ type: item.type, id: item.id }))
    );
    return threadData;
  };

  // Render thread items with connecting lines
  const renderThreadItem = (item: any, index: number) => {
    const isLastItem = index === buildThreadData().length - 1;
    const isFirstThreadComment =
      item.type === "threadComment" && item.level === 1;

    if (item.type === "post") {
      return (
        <View style={styles.threadItemContainer}>
          <View
            style={[
              styles.mainPostVerticalLine,
              { backgroundColor: Colors.PRIMARY },
            ]}
          />

          <View style={styles.mainPostContainer}>
            <PostCard
              post={item.data}
              clickable={false}
              onPostUpdate={handlePostUpdate}
              onDelete={(postId) => {
                // If the main post is deleted, clear thread history and go back
                setThreadHistory([]);
                navigation.goBack();
              }}
              onCommentPress={() => {
                console.log(
                  "PostScreen - Navigating to CommentScreen with post:",
                  item.data.id
                );
                setIsNavigatingToCommentScreen(true);
                isNavigatingRef.current = true;
                navigation.navigate("CommentScreen", {
                  post: item.data,
                  onCommentPosted: (updatedComment) => {
                    // Update the main post when a comment is posted
                    setCurrentPost((prev: any) => ({
                      ...prev,
                      comment_count: (prev.comment_count || 0) + 1,
                    }));
                  },
                });
              }}
            />
          </View>

          {/* Horizontal connecting line to next item */}
          {!isLastItem && (
            <View style={styles.mainPostConnectingLineContainer}>
              <View
                style={[
                  styles.connectingLine,
                  { backgroundColor: Colors.PRIMARY },
                ]}
              />
            </View>
          )}
        </View>
      );
    } else if (item.type === "threadComment") {
      return (
        <View style={styles.threadItemContainer}>
          {/* Vertical line on the left */}
          <View
            style={[styles.verticalLine, { backgroundColor: Colors.PRIMARY }]}
          />

          <View style={styles.cardContainer}>
            <View
              style={[
                styles.threadCommentContainer,
                {
                  backgroundColor: colors.background,
                  borderBottomColor: colors.onBackground,
                },
              ]}
            >
              <Text style={[styles.threadCommentLabel, { color: Colors.GRAY }]}>
                Replying to{" "}
                <Text style={{ color: Colors.PRIMARY }}>
                  @{item.data.username || "user"}
                </Text>
              </Text>
              <PostCard
                post={item.data}
                clickable={false}
                onDelete={(postId) => {
                  // If a threaded comment is deleted, remove it from thread history
                  setThreadHistory((prev) =>
                    prev.filter((threadItem) => threadItem.data.id !== postId)
                  );
                }}
                onCommentPress={() => {
                  console.log(
                    "PostScreen - Navigating to CommentScreen with thread comment:",
                    item.data.id
                  );
                  setIsNavigatingToCommentScreen(true);
                  isNavigatingRef.current = true;
                  navigation.navigate("CommentScreen", {
                    post: item.data,
                    onCommentPosted: (updatedComment) => {
                      // Update the thread comment when a reply is posted
                      updateThreadComment(item.data.id, {
                        comment_count: (item.data.comment_count || 0) + 1,
                      });
                    },
                  });
                }}
              />
            </View>
          </View>

          {/* Horizontal connecting line to next item */}
          {!isLastItem && (
            <View style={styles.connectingLineContainer}>
              <View
                style={[
                  styles.connectingLine,
                  { backgroundColor: Colors.PRIMARY },
                ]}
              />
            </View>
          )}
        </View>
      );
    } else if (item.type === "comments") {
      // Get the current thread context (last item in thread history, or main post)
      const currentThreadPost =
        threadHistory.length > 0
          ? threadHistory[threadHistory.length - 1]
          : currentPost;

      return (
        <View
          style={[
            styles.commentsSection,
            { backgroundColor: colors.background },
          ]}
        >
          <Text style={[styles.commentsTitle, { color: colors.onBackground }]}>
            {threadHistory.length > 0 ? "Replies" : "Comments"}
          </Text>
          <CommentsList
            postId={currentThreadPost.id}
            onCommentPress={(comment) => {
              // For infinite threading, clicking a comment adds it to thread history
              handleCommentClick(comment);
            }}
            onCommentDeleted={(deletedCommentId) => {
              // When a comment is deleted, check if it's in the thread history and remove it
              setThreadHistory((prev) => {
                const updatedHistory = prev.filter(
                  (threadItem) => threadItem.data.id !== deletedCommentId
                );
                // If we removed an item, we might need to adjust the current view
                return updatedHistory;
              });
            }}
            onReplyPress={(comment) => {
              console.log(
                "PostScreen - Navigating to CommentScreen with comment:",
                comment.id
              );
              setIsNavigatingToCommentScreen(true);
              isNavigatingRef.current = true;
              navigation.navigate("CommentScreen", {
                post: comment,
                parentComment: comment.parent_post_id,
                onCommentPosted: (updatedComment) => {
                  // Update the thread comment when a reply is posted
                  updateThreadComment(comment.id, {
                    comment_count: (comment.comment_count || 0) + 1,
                  });
                },
              });
            }}
            currentUserId={userData?.id}
            refreshTrigger={refreshTrigger}
          />
        </View>
      );
    }
    return null;
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getPosts();
      handleCommentPosted(); // Also refresh comments
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh comments when screen comes into focus (returning from CommentScreen)
  useFocusEffect(
    React.useCallback(() => {
      console.log("PostScreen - Screen came into focus");
      console.log(
        "PostScreen - Current post history length:",
        postHistory.length
      );
      // This will run when the screen comes into focus
      // We'll refresh comments to show any new ones
      handleCommentPosted();
    }, [postHistory])
  );

  // Clear history when actually leaving PostScreen (not when going to CommentScreen)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        console.log(
          "PostScreen - useFocusEffect cleanup, isNavigatingToCommentScreen:",
          isNavigatingRef.current
        );
        // Only clear history if we're not navigating to CommentScreen
        if (!isNavigatingRef.current) {
          console.log(
            "PostScreen - Clearing persisted post history and thread history"
          );
          clearPersistedCache();
          setThreadHistory([]); // Clear thread history when leaving PostScreen
        } else {
          console.log(
            "PostScreen - Preserving history (navigating to CommentScreen)"
          );
        }
      };
    }, [clearPersistedCache])
  );

  // Reset navigation flag when screen comes into focus (returning from CommentScreen)
  useFocusEffect(
    React.useCallback(() => {
      // Reset the flag when returning to PostScreen
      setIsNavigatingToCommentScreen(false);
      isNavigatingRef.current = false;
    }, [])
  );

  // Handle back button behavior

  if (!currentPost) return null;

  const name = currentPost.username || "Anonymous";
  const content = currentPost.content;
  const image = currentPost.image || "https://via.placeholder.com/50";
  const createdon = currentPost.createdon || new Date().toISOString();

  let media = [];
  if (Array.isArray(currentPost.media)) {
    media = currentPost.media;
  } else if (currentPost.media && Array.isArray(currentPost.media.media)) {
    media = currentPost.media.media;
  }

  // Comment functionality moved to PostCard component

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBackNavigation}>
          <Ionicons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
          Post
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Animated.View
        style={[
          styles.scrollContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <FlatList
          ref={threadListRef}
          data={buildThreadData()}
          keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
          renderItem={({ item, index }) => renderThreadItem(item, index)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          removeClippedSubviews={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.PRIMARY]}
              tintColor={Colors.PRIMARY}
            />
          }
        />
      </Animated.View>

      {/* Media Preview Modal */}
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

      {/* Comment Modal removed - now using PostCard's comment modal */}
    </View>
  );
};

export default PostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.GRAY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  threadCommentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  threadCommentLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: Colors.GRAY,
  },
  animatedContainer: {
    flex: 1,
  },
  threadItemContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  verticalLine: {
    width: 2,
    position: "absolute",
    left: 20,
    top: 0,
    bottom: 0,
    opacity: 0.3,
  },
  mainPostVerticalLine: {
    width: 2,
    position: "absolute",
    left: 20,
    top: -10,
    bottom: 0,
    opacity: 0.3,
  },
  mainPostContainer: {
    flex: 1,
    marginLeft: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.PRIMARY,
    paddingLeft: 12,
  },
  cardContainer: {
    flex: 1,
    marginLeft: 40,
  },
  mainPostConnectingLineContainer: {
    alignItems: "center",
    marginVertical: 4,
    marginLeft: 20,
  },
  connectingLineContainer: {
    alignItems: "center",
    marginVertical: 4,
    marginLeft: 40,
  },
  connectingLine: {
    height: 1,
    width: "60%",
    opacity: 0.4,
  },
  noCommentsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },

  // Media Modal Styles
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

  // Comment Modal Styles removed - now using PostCard's comment modal styles
});
