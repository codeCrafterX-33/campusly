import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import React, { useState, useRef, useContext, useEffect } from "react";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import axios from "axios";
import { VideoView, useVideoPlayer } from "expo-video";
import { AuthContext } from "../context/AuthContext";
import { PostContext } from "../context/PostContext";
import uploadImageToCloudinary from "../util/uploadToCloudinary";
import { postOptions } from "../configs/CloudinaryConfig";
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

  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, player]);

  return (
    <VideoView
      style={{ width: "100%", height: "100%" }}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
    />
  );
};

const CommentScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params as { post: any };

  const [commentContent, setCommentContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<
    { uri: string; type: "image" | "video" }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { userData } = useContext(AuthContext);
  const { getPosts } = useContext(PostContext);
  const commentInputRef = useRef<TextInput>(null);

  // Handle back button behavior
  useEffect(() => {
    const backAction = () => {
      if (commentContent.trim() || selectedMedia.length > 0) {
        // Show confirmation dialog if there's unsaved content
        // For now, just go back
        navigation.goBack();
        return true;
      }
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [commentContent, selectedMedia, navigation]);

  // Auto-focus input when screen opens
  useEffect(() => {
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 300);
  }, []);

  if (!post) return null;

  const name = post.username || "Anonymous";
  const content = post.content;

  const pickImages = async () => {
    const MAX_MEDIA = 4;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type as "image" | "video",
      }));

      const combined = [...selectedMedia, ...newMedia];

      if (combined.length > MAX_MEDIA) {
        Toast.show({
          type: "error",
          text1: `You can only select up to ${MAX_MEDIA} media items.`,
        });
        return;
      }

      setSelectedMedia(combined);
    }
  };

  const removeImage = (uri: string) => {
    setSelectedMedia((prev) => prev.filter((media) => media.uri !== uri));
  };

  const onCommentPost = async () => {
    if (!commentContent.trim() && selectedMedia.length === 0) {
      Toast.show({
        text1: "Please add some content or media",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      let postMedia = [];

      // Upload media to Cloudinary
      if (selectedMedia.length > 0) {
        for (const media of selectedMedia) {
          const uploadResponse = await uploadImageToCloudinary(
            media.uri,
            postOptions.folder,
            postOptions.upload_preset,
            media.type
          );
          postMedia.push({
            url: uploadResponse,
            type: media.type,
          });
        }
      }

      // TODO: Update this to use comments API endpoint when ready
      const result = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/post`,
        {
          content: commentContent,
          media: postMedia,
          visibleIn: 0, // Public post
          email: userData?.email,
          user_id: userData?.id,
          // parentPostId: post.id, // Will be used for comments API
        }
      );

      if (result.status === 201) {
        Toast.show({
          text1: "Your comment was posted",
          type: "success",
        });

        // Reset form and go back
        setCommentContent("");
        setSelectedMedia([]);
        navigation.goBack();

        // Refresh posts
        getPosts();
      }
    } catch (error) {
      Toast.show({
        text1: "Error posting comment",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
          Add Comment
        </Text>
        <TouchableOpacity
          onPress={onCommentPost}
          disabled={
            loading || (!commentContent.trim() && selectedMedia.length === 0)
          }
          style={[
            styles.postBtn,
            (loading ||
              (!commentContent.trim() && selectedMedia.length === 0)) &&
              styles.disabledBtn,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.postBtnText}>Reply</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        {/* Original Post Preview */}
        <View
          style={[
            styles.originalPostPreview,
            { backgroundColor: colors.surface || colors.background },
          ]}
        >
          <Text style={[styles.originalPostLabel, { color: Colors.GRAY }]}>
            Replying to <Text style={{ color: Colors.PRIMARY }}>@{name}</Text>
          </Text>
          {content && (
            <Text
              style={[
                styles.originalPostContent,
                { color: colors.onBackground },
              ]}
              numberOfLines={2}
            >
              {content}
            </Text>
          )}
        </View>

        {/* Comment Input */}
        <TextInput
          ref={commentInputRef}
          placeholder="Post your reply"
          placeholderTextColor={Colors.GRAY}
          style={[
            styles.commentInput,
            {
              backgroundColor: colors.background,
              color: colors.onBackground,
            },
          ]}
          multiline
          numberOfLines={8}
          maxLength={1000}
          value={commentContent}
          onChangeText={setCommentContent}
        />

        {/* Selected Media */}
        {selectedMedia.length > 0 && (
          <ScrollView
            horizontal
            style={styles.selectedImagesContainer}
            keyboardShouldPersistTaps="always"
            showsHorizontalScrollIndicator={false}
          >
            {selectedMedia.map((media, index) => (
              <View key={index} style={styles.selectedImageWrapper}>
                <Pressable
                  onPress={() => {
                    setPreviewIndex(index);
                    setModalVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: media.uri }}
                    style={styles.selectedImage}
                  />
                  {media.type === "video" && (
                    <View style={styles.selectedVideoOverlay}>
                      <Ionicons
                        name="play-circle-outline"
                        size={30}
                        color="white"
                      />
                    </View>
                  )}
                </Pressable>
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(media.uri)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>

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
          {selectedMedia.length > 1 && (
            <View style={styles.mediaCounter}>
              <Text style={styles.mediaCounterText}>
                {previewIndex + 1} / {selectedMedia.length}
              </Text>
            </View>
          )}

          {/* Carousel */}
          <FlatList
            data={selectedMedia}
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
              console.log(
                `Rendering item ${index}: ${item.uri}, isVideo: ${
                  item.type === "video"
                }`
              );
              return (
                <View style={styles.mediaSlide}>
                  {item.type === "video" ? (
                    <VideoComponent
                      uri={item.uri}
                      shouldPlay={index === previewIndex}
                    />
                  ) : (
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.fullscreenImage}
                      resizeMode="contain"
                    />
                  )}
                </View>
              );
            }}
          />

          {/* Navigation dots for multiple media */}
          {selectedMedia.length > 1 && (
            <View style={styles.dotsContainer}>
              {selectedMedia.map((_: any, index: number) => (
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
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>

      {/* Add Media Button - Following WritePost pattern */}
      <View style={styles.addMediaContainer}>
        <TouchableOpacity style={styles.addImagesBtn} onPress={pickImages}>
          <Ionicons name="image" size={24} color={Colors.PRIMARY} />
          <Text style={[styles.addImagesBtnText, { color: Colors.PRIMARY }]}>
            Add Media ({selectedMedia.length}/4)
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommentScreen;

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
    zIndex: 1000,
    elevation: 10,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 20,
  },
  postBtn: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1001,
    elevation: 11,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  postBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  originalPostPreview: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  originalPostLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  originalPostContent: {
    fontSize: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlignVertical: "top",
    minHeight: 200,
    marginBottom: 16,
  },
  selectedImagesContainer: {
    marginBottom: 16,
  },
  selectedImageWrapper: {
    position: "relative",
    marginRight: 12,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  selectedVideoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  removeImageBtn: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 4,
  },
  addImagesBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 8,
    borderStyle: "dashed",
  },
  addImagesBtnText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  addMediaContainer: {
    margin: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Media Preview Modal Styles
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
  videoPreviewContainer: {
    position: "relative",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
});
