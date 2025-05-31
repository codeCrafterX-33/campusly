import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import UserAvatar from "./Useravatar";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
const PostCard = ({ post }: { post: any }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UserAvatar
        name={post?.name}
        image={post?.image}
        date={post?.createdon}
        style={{ backgroundColor: colors.background }}
      />
      <Text style={[styles.content, { color: colors.onBackground }]}>
        {post?.content}
      </Text>

      {post?.imageurl !== null ? (
        <Image source={{ uri: post?.imageurl }} style={styles.image} />
      ) : (
        <></>
      )}
      <View style={styles.footerContainer}>
        <View style={styles.footerItem}>
          <Ionicons name="heart-outline" size={17} color={Colors.GRAY} />
          <Text style={styles.footerText}>{post?.likes} 30</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={17} color={Colors.GRAY} />
          <Text style={styles.footerText}>{post?.comments} 13</Text>
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 15,
    borderTopWidth: 0.2,
    marginTop: 10,
    borderColor: Colors.GRAY,
  },
  content: {
    fontSize: 18,
    marginTop: 10,
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
  },
  footerText: {
    fontSize: 17,
    color: Colors.GRAY,
    marginLeft: -4,
  },
});
