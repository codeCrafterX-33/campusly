import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PostCard from "../Post/PostCard";
import { useContext } from "react";
import { PostContext } from "../../context/PostContext";

const ProfilePostTab = () => {
  const { userPosts } = useContext(PostContext);
  return (
    <View style={styles.postsContainer}>
      {userPosts.map((post: any, index: number) => (
        <PostCard post={post} key={index + post.id} />
      ))}
    </View> 
  );
};

export default ProfilePostTab;

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    padding: 16,
  },
});

