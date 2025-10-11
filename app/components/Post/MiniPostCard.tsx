import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

const MiniPostCard = ({ post }: { post: any }) => {
  const { colors } = useTheme();

  if (!post) return null;

  const fullName = post?.firstname + " " + post?.lastname;
  const userName = post?.username || "Anonymous";
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View>
        {/* Profile Picture and User Info Row */}
        <View style={styles.userInfoRow}>
          {/* Circular Profile Picture */}
          <Image source={{ uri: image }} style={styles.profilePicture} />

          {/* User Info Container */}
          <View style={styles.userInfoContainer}>
            {/* Header Row: Name, Handle, Timestamp */}
            <View style={styles.userHeader}>
              <View style={styles.nameHandleContainer}>
                <View style={styles.nameWithVerification}>
                  <Text
                    style={[
                      styles.userFullName,
                      { color: colors.onBackground },
                    ]}
                  >
                    {fullName}
                  </Text>
                {post.studentstatusverified && <View style={styles.greenCheckBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={Colors.PRIMARY}
                    />
                  </View>}
                  {post.studentstatusverified && (
                    <View style={styles.verificationBadge}>
                      <Text style={styles.verificationText}>🎓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userName}>
                  @{userName.replace(/\s+/g, "")}
                </Text>
              </View>
              <Text style={styles.timestamp}>
                {createdon ? formatDate(createdon) : "Now"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content and Media Row */}
      <View style={styles.contentRow}>
        {/* Empty View with Profile Picture Style - Left side */}
        <View style={styles.profilePicture}></View>

        {/* Post Text - Center */}
        <View style={styles.contentContainer}>
          {content && (
            <Text
              style={[styles.content, { color: colors.onBackground }]}
              numberOfLines={3}
            >
              {content}
            </Text>
          )}
        </View>

        {/* Media Grid - Right side */}
        {media && Array.isArray(media) && media.length > 0 && (
          <View style={styles.mediaContainer}>
            {media.map((item: any, index: number) => {
              if (!item?.type || !item?.url) return null;

              const type = item.type.trim().toLowerCase();
              const isLastItem = index === media.length - 1;

              // Calculate item dimensions based on media count
              let itemWidth: "100%" | "50%" = "50%";
              const itemHeight: "100%" | "50%" =
                media.length <= 2 ? "100%" : "50%";

              // Special case: 3rd item takes remaining width if no 4th item
              if (media.length === 1) {
                itemWidth = "100%";
              } else if (media.length === 3 && index === 2) {
                itemWidth = "100%";
              }

              return (
                <View
                  key={index}
                  style={[
                    styles.mediaItem,
                    { width: itemWidth, height: itemHeight },
                  ]}
                >
                  {type === "image" ? (
                    <Image
                      source={{ uri: item.url }}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />
                  ) : type === "video" ? (
                    <View style={styles.videoThumb}>
                      <Image
                        source={{
                          uri: item.url.replace(
                            "/upload/",
                            "/upload/w_80,h_80,c_fill,q_auto,f_jpg/"
                          ),
                        }}
                        style={styles.mediaImage}
                        resizeMode="cover"
                      />
                      <View style={styles.videoOverlay}>
                        <Ionicons
                          name="play-circle-outline"
                          size={20}
                          color="white"
                        />
                      </View>
                    </View>
                  ) : null}
                  {/* Show count indicator if more than 1 media */}
                  {media.length > 1 && isLastItem && (
                    <View style={styles.mediaCountOverlay}>
                      <Text style={styles.mediaCountText}>
                        +{media.length - 1}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

export default MiniPostCard;

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: Colors.WHITE,
    padding: 12,
    borderRadius: 8,
    alignSelf: "center",
    borderLeftWidth: 1,
    borderLeftColor: Colors.PRIMARY,
  },
  userInfoRow: {
    flexDirection: "row",

  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  profilePicture: {
    width: 48,
    height: 48,
    marginLeft: -20,
    borderRadius: 24,
    marginRight: 12,
    alignSelf: "flex-start",
  },
  userInfoContainer: {
    flex: 1,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  nameHandleContainer: {
    flex: 1,
  },
  nameWithVerification: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userFullName: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 6,
  },
  verificationBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
  },
  verificationText: {
    fontSize: 10,
  },
  greenCheckBadge: {
    marginLeft: 4,
  },
  userName: {
    fontSize: 14,
    color: Colors.GRAY,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.GRAY,
    marginLeft: 8,
    marginTop: 0,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  mediaContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.GRAY + "20",
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "flex-end",
  },
  mediaItem: {
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  videoThumb: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  mediaCountOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
