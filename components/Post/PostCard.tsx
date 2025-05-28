import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import UserAvatar from "./Useravatar";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";

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
    borderWidth: 0.1,
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
});
