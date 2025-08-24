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
} from "react-native";
import React, { useState } from "react";
import UserAvatar from "./Useravatar";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PostCard = ({ post }: { post: any }) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
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
      {media && Array.isArray(media) && media.length > 0  && (
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
        <Pressable
          style={styles.fullscreenContainer}
          onPress={() => setModalVisible(false)}
        >
          {media[previewIndex] ? (
            media[previewIndex].type.trim().toLowerCase() === "image" ? (
              <Image
                source={{ uri: media[previewIndex].url }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            ) : media[previewIndex].type.trim().toLowerCase() === "video" ? (
              <Video
                source={{ uri: media[previewIndex].url }}
                style={styles.fullscreenImage}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
              />
            ) : null
          ) : (
            <Image source={{ uri: post.imageurl }} style={styles.image} />
          )}
        </Pressable>
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
