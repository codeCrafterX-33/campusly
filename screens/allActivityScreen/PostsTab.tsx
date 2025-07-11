import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  Text,
} from "react-native";
import PostCard from "../../components/Post/PostCard";
import { PostContext } from "../../context/PostContext";
import Colors from "../../constants/Colors";
import Toast from "react-native-toast-message";
import { Tabs } from "react-native-collapsible-tab-view";
import { OnRefresh } from "../../util/OnRefresh";
import Checkmark from "../../components/checkmark";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PostsTab({
  setShowCheckmark,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
}) {
  const { userPosts, getUserPosts, posts } = useContext(PostContext);
  const [refreshing, setRefreshing] = useState(false);

  const publicPosts = userPosts.filter((post: any) => post.club === 0);

  return (
    <View style={styles.container}>
      <Tabs.FlatList
        data={publicPosts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item: any) => item.id.toString() + item.createdon}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              OnRefresh({
                setRefreshing,
                setShowCheckmark,
                getFunction: getUserPosts,
                route: "Posts",
              })
            }
            tintColor={Colors.PRIMARY}
            colors={[Colors.PRIMARY]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
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
