import React, { useState, useEffect, useContext } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import axios from "axios";
import PostList from "../Post/PostList";
import usePersistedState from "../../util/PersistedState";
import { PostContext } from "../../context/PostContext";
import { AuthContext } from "../../context/AuthContext";

const LatestPost = () => {
  const { posts, getPosts } = useContext(PostContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      if (posts.length === 0) {
        getPosts();
      }
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <PostList posts={posts} />
    </View>
  );
};

export default LatestPost;

const styles = StyleSheet.create({
  container: {},
  tabContainer: {
    display: "flex",
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },
});
