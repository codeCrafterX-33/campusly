import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import React from "react";
import UserAvatar from "./Useravatar";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PostCard = ({ post }: { post: any }) => {
  const { colors } = useTheme();

  // Handle case where post is null or undefined
  if (!post) {
    return null;
  }

  // Ensure required fields have default values
  const name = post.name || "Anonymous";
  const content = post.content || "No content";
  const image = post.image || "https://via.placeholder.com/50";
  const createdon = post.createdon || new Date().toISOString();

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

      {post.imageurl ? (
        <Image source={{ uri: post.imageurl }} style={styles.image} />
      ) : null}

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
    objectFit: "cover",
    borderRadius: 10,
    marginTop: 10,
  },
  footerContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  footer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  footerItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  footerText: {
    fontSize: 17,
    color: Colors.GRAY,
    marginLeft: 5,
  },
});
