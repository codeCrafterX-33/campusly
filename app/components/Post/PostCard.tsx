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
} from "react-native";
import React, { useState, useRef } from "react";
import UserAvatar from "./Useravatar";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";

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
    />
  );
};

const PostCard = ({ post }: { post: any }) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  if (!post) return null;

  const name = post.name || "Anonymous";
  const content = post.content || "No content";
  const image = post.image || "https://via.placeholder.com/50";
  const createdon = post.createdon || new Date().toISOString();

  let media = [];
  if (Array.isArray(post.media)) {
    media = post.media;
  } else if (post.media && Array.isArray(post.media.media)) {
    media = post.media.media;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UserAvatar
        name={name}
        image={image}
        date={createdon}
        style={{ backgroundColor: colors.background }}
      />

      <Text style={[styles.content, { color: colors.onBackground }]}>
        {content}
      </Text>

      {post.imageurl && (
        <Pressable onPress={() => setModalVisible(true)}>
          <Image source={{ uri: post.imageurl }} style={styles.image} />
        </Pressable>
      )}

      {/* Media preview */}
      {media && Array.isArray(media) && media.length > 0 && (
        <View style={styles.mediaGrid}>
          {media.map((item: any, index: number) => {
            if (!item?.type || !item?.url)
              return (
                <Pressable>
                  <Text>No media</Text>
                </Pressable>
              );
            const type = item.type.trim().toLowerCase();
            return (
              <Pressable
                key={index}
                onPress={() => {
                  setPreviewIndex(index);
                  setModalVisible(true);
                }}
              >
                {type === "image" ? (
                  <Image source={{ uri: item.url }} style={styles.mediaItem} />
                ) : type === "video" ? (
                  <View style={[styles.mediaItem, styles.videoThumb]}>
                    <Ionicons
                      name="play-circle-outline"
                      size={40}
                      color="white"
                    />
                  </View>
                ) : (
                  <Image source={{ uri: post.imageurl }} style={styles.image} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}

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

      <View style={styles.footerContainer}>
        <View style={styles.footerItem}>
          <Ionicons name="heart-outline" size={17} color={Colors.GRAY} />
          <Text style={styles.footerText}>{post.likes || 0}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={17} color={Colors.GRAY} />
          <Text style={styles.footerText}>{post.comments || 0}</Text>
        </View>
      </View>
    </View>
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
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
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

  mediaItem: {
    width: (SCREEN_WIDTH - 60) / 2,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#000",
  },

  videoThumb: {
    justifyContent: "center",
    alignItems: "center",
  },
});
