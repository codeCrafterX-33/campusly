import React, { useState, useEffect, useContext } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import Colors from "../../constants/Colors";
import axios from "axios";
import PostList from "../Post/PostList";
import usePersistedState from "../../util/PersistedState";
import { PostContext } from "../../context/PostContext";
import { AuthContext } from "../../context/AuthContext";

const LatestPost = ({
  clubPosts,
  clubRefreshing,
  clubOnRefresh,
  flatListRef,
  club_id = 0,
}: {
  clubPosts?: any;
  clubRefreshing?: boolean;
  clubOnRefresh?: () => void;
  flatListRef?: any;
  club_id?: number;
}) => {
  const { posts } = useContext(PostContext);
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <PostList
        posts={clubPosts ? clubPosts : posts}
        flatListRef={flatListRef}
        club_id={club_id}
        clubRefreshing={clubRefreshing}
        clubOnRefresh={clubOnRefresh}
      />
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
