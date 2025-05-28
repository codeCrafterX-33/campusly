import React, { useState, useEffect, useContext } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import axios from "axios";
import PostList from "../Post/PostList";
import usePersistedState from "../../util/PersistedState";
import { PostContext } from "../../context/PostContext";
import { AuthContext } from "../../context/AuthContext";

const LatestPost = () => {
  const [activeTab, setActiveTab] = useState("latest");
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
      <View style={styles.tabContainer}>
        <Pressable onPress={() => setActiveTab("latest")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "latest" && styles.activeTabText,
            ]}
          >
            Latest Post
          </Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab("trending")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "trending" && styles.activeTabText,
            ]}
          >
            Trending
          </Text>
        </Pressable>
      </View>
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
  tabText: {
    fontSize: 20,
    padding: 4,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
  },

  activeTabText: {
    color: "white",
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
  },
});
