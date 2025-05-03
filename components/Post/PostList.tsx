import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import PostCard from "./PostCard";
import { PostContext } from "../../context/PostContext";

const PostList = ({ posts }: { posts: any }) => {
  const { refreshing, onRefresh } = useContext(PostContext);
  return (
    <View>
      <FlatList
        data={posts}
        renderItem={({ item, index }) => <PostCard post={item} />}
        keyExtractor={(item, index) => index.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

export default PostList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
