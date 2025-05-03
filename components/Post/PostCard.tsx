import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import UserAvatar from "./Useravatar";
import Colors from "../../constants/Colors";

const PostCard = ({ post }: { post: any }) => {
  return (
    <View style={styles.container}>
      <UserAvatar
        name={post?.name}
        image={post?.image}
        date={post?.createdon}
      />
      <Text style={styles.content}>{post?.content}</Text>

      {post?.imageurl && (
        <Image source={{ uri: post?.imageurl }} style={styles.image} />
      )}
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
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
});
