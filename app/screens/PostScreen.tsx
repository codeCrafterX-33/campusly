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
  BackHandler,
  RefreshControl,
} from "react-native";
import React, { useState, useRef, useContext, useEffect } from "react";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { VideoView, useVideoPlayer } from "expo-video";
import { AuthContext } from "../context/AuthContext";
import { PostContext } from "../context/PostContext";
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

const PostScreen = () => {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { post } = route.params as { post: any };

  const [modalVisible, setModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const { userData } = useContext(AuthContext);
  const { getPosts } = useContext(PostContext);
  const carouselRef = useRef<FlatList>(null);

  // Function to refresh comments when a new comment is posted
  const handleCommentPosted = () => {
    setRefreshTrigger((prev) => prev + 1);
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
      // This will run when the screen comes into focus
      // We'll refresh comments to show any new ones
      handleCommentPosted();
    }, [])
  );

  // Handle back button behavior
  useEffect(() => {
    const backAction = () => {
      // Navigate back when modal is not open
      navigation.goBack();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  if (!post) return null;

  const name = post.username || "Anonymous";
  const content = post.content;
  const image = post.image || "https://via.placeholder.com/50";
  const createdon = post.createdon || new Date().toISOString();

  let media = [];
  if (Array.isArray(post.media)) {
    media = post.media;
  } else if (post.media && Array.isArray(post.media.media)) {
    media = post.media.media;
  }

  // Comment functionality moved to PostCard component

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
          Post
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        style={styles.scrollContainer}
        data={[{ type: "post" }, { type: "comments" }]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={({ item }) => {
          if (item.type === "post") {
            return (
              <PostCard
                post={post}
                clickable={false}
                onCommentPress={() => {
                  console.log(
                    "Navigating to CommentScreen with post:",
                    post.id
                  );
                  navigation.navigate("CommentScreen", { post });
                }}
              />
            );
          } else if (item.type === "comments") {
            return (
              <View
                style={[
                  styles.commentsSection,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text
                  style={[styles.commentsTitle, { color: colors.onBackground }]}
                >
                  Comments
                </Text>
                <CommentsList
                  postId={post.id}
                  onCommentPress={(comment) => {
                    // Handle comment press if needed
                    console.log("Comment pressed:", comment);
                  }}
                  onReplyPress={(comment) => {
                    // Navigate to CommentScreen with parent comment
                    navigation.navigate("CommentScreen", {
                      post,
                      parentComment: comment,
                    });
                  }}
                  currentUserId={userData?.id}
                  refreshTrigger={refreshTrigger}
                />
              </View>
            );
          }
          return null;
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
          />
        }
      />

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
