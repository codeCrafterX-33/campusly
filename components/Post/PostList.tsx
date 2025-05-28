import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import PostCard from "./PostCard";
import { PostContext } from "../../context/PostContext";

const PostList = ({ posts }: { posts: any }) => {
  const { refreshing, onRefresh } = useContext(PostContext);
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item, index }) => <PostCard post={item} />}
        keyExtractor={(item, index) => item.id + index.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      {posts.length === 0 && <Text>No posts found</Text>}
    </View>
  );
};

export default PostList;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});
