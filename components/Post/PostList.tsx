import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import PostCard from "./PostCard";
import { PostContext } from "../../context/PostContext";
import { Colors } from "react-native/Libraries/NewAppScreen";

const PostList = ({ posts, flatListRef }: { posts: any, flatListRef: any }) => {
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
        ref={flatListRef}
      />
    </View>
  );
};

export default PostList;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});
