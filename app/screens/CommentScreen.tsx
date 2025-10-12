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
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useRef, useContext, useEffect } from "react";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import axios from "axios";
import { VideoView, useVideoPlayer } from "expo-video";
import { AuthContext } from "../context/AuthContext";
import { PostContext } from "../context/PostContext";
import { useCommentContext } from "../context/CommentContext";
import { uploadMultipleMedia } from "../util/uploadToCloudinary";
import { postOptions } from "../configs/CloudinaryConfig";
import Colors from "../constants/Colors";
import MiniPostCard from "../components/Post/MiniPostCard";
import UserAvatar from "../components/Post/Useravatar";

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

const CommentScreen = ({ route }: { route: any }) => {
  const { post, parentComment, onCommentPosted } = route.params || {};
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  // Debug logging
  console.log("CommentScreen rendered with post:", post?.id);
  console.log("CommentScreen parentComment:", parentComment);

  const [commentContent, setCommentContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<
    { uri: string; type: "image" | "video" }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const { userData } = useContext(AuthContext);
  const { getPosts } = useContext(PostContext);
  const { addComment, getComments } = useCommentContext();
  const commentInputRef = useRef<TextInput>(null);

  // Fetch comments when component mounts
  useEffect(() => {
    if (post?.id) {
      console.log("Fetching comments for post:", post.id);
      getComments(parseInt(post.id));
    }
  }, [post?.id, getComments]);

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
  }, [commentContent, selectedMedia]);

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

    // Request permissions for accessing all photos
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.7,
      exif: false,
      base64: false,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
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
      let postMedia: Array<{ url: string; type: string }> = [];

      // Upload media to Cloudinary in parallel
      if (selectedMedia.length > 0) {
        console.log(
          `Uploading ${selectedMedia.length} media files in parallel...`
        );

        // Prepare files for parallel upload
        const filesToUpload = selectedMedia.map((media) => ({
          uri: media.uri,
          type: media.type,
        }));

        // Upload all files in parallel
        const uploadResults = await uploadMultipleMedia(filesToUpload);

        // Map upload results back to media objects
        postMedia = uploadResults.map((result, index) => ({
          url: result.url,
          type: result.type,
          thumbnailUrl: result.thumbnailUrl, // Include thumbnail for videos
        }));

        console.log(`Successfully uploaded ${postMedia.length} media files`);
      }

      // Create comment data
      const commentData = {
        postId: parseInt(post.id), // Convert to integer
        content: commentContent,
        media: postMedia,
        user_id: userData?.id || 0,
        createdby: userData?.email || "",
        parentCommentId: parentComment ? parentComment : undefined, // Use parent comment ID if replying
      };

      console.log("CommentScreen posting comment data:", commentData);

      // Create comment on server
      const newComment = await addComment(commentData);

      if (newComment) {
        console.log(
          "CommentScreen: Comment posted successfully, preparing to close"
        );

        Toast.show({
          text1: "Your comment was posted",
          type: "success",
        });

        // Reset form
        setCommentContent("");
        setSelectedMedia([]);

        // Refresh posts
        getPosts();

        // Call the callback to update thread comment if provided
        if (onCommentPosted) {
          onCommentPosted(newComment);
        }

        // Close the screen immediately after successful post
        console.log(
          "CommentScreen: Closing screen after successful comment post"
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error posting comment:", error);

      Toast.show({
        text1: "Error posting comment",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
            Reply
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
          {/* mini Post Card */}
          <View style={styles.postCardContainer}>
            <MiniPostCard post={post} />
          </View>

          {/* Replying to text */}
          <View style={styles.replyingToContainer}>
            <View style={styles.emptyBox}></View>
            <Text style={[styles.replyingToText, { color: Colors.GRAY }]}>
              Replying to <Text style={{ color: Colors.PRIMARY }}>@{name}</Text>
            </Text>
          </View>

          {/* Comment Input with User Image */}
          <View style={styles.inputContainer}>
            <Image
              source={{
                uri: userData?.image || "https://via.placeholder.com/50",
              }}
              style={styles.userImage}
            />
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
          </View>

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
    </SafeAreaView>
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
    borderBottomWidth: 0.2,
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
  postCardContainer: {},
  replyingToContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderLeftWidth: 1,
    borderLeftColor: Colors.PRIMARY,
    borderRadius: 8,
  },
  replyingToText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyBox: {
    width: 48,
    marginLeft: -20,
    borderRadius: 24,
    marginRight: 12,
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginTop: 0,
  },
  commentInput: {
    flex: 1,
    fontSize: 18,
    paddingTop: 10,
    textAlignVertical: "top",
    minHeight: 200,
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
