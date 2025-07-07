import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  Text,
} from "react-native";
import PostCard from "../Post/PostCard";
import { PostContext } from "../../context/PostContext";
import Colors from "../../constants/Colors";
import Toast from "react-native-toast-message";
import { Tabs } from "react-native-collapsible-tab-view";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ProfilePostsTab() {
  const { userPosts, getUserPosts, posts } = useContext(PostContext);
  const [refreshing, setRefreshing] = useState(false);
  const [localPosts, setLocalPosts] = useState([]);

  // Use the appropriate posts data
  useEffect(() => {
    // Use posts if available, otherwise fall back to userPosts
    const postsToUse = posts && posts.length > 0 ? posts : userPosts;

    if (postsToUse && postsToUse.length > 0) {
      console.log("Posts to display:", postsToUse.length);
      setLocalPosts(postsToUse);
    } else {
      console.log("No posts available");
      setLocalPosts([]);
    }
  }, [posts, userPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getUserPosts();
      setRefreshing(false);
    } catch (error) {
      console.log(error);
      Toast.show({
        text1: "Couldn't refresh posts",
        text2: "Please check your internet or try again later.",
        type: "error",
        position: "bottom",
      });
      setRefreshing(false);
    }
  }, [getUserPosts]);

  // Simple index-based keyExtractor for guaranteed uniqueness
  const keyExtractor = (_item: any, index: number) => `post-${index}`;

  // Define a typed renderItem function
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    console.log(`Rendering post ${index}:`, item?.id || "unknown");
    return <PostCard post={item} />;
  };

  return (
    <View style={styles.container}>
      {!userPosts || userPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
        </View>
      ) : (
        <Tabs.FlatList
          data={userPosts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item: any) => item.id + Math.random() + item.createdon}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.PRIMARY}
              colors={[Colors.PRIMARY]}
            />
          }
          scrollEnabled={true}
          nestedScrollEnabled={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={false}
          onEndReachedThreshold={0.1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: "#000",
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100, // Add extra padding at bottom
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: Colors.GRAY,
    fontSize: 16,
  },
});
