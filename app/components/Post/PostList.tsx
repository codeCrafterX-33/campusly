import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import PostCard from "./PostCard";
import { PostContext } from "../../context/PostContext";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";

const PostList = ({
  posts,
  flatListRef,
  club_id = [0],
  clubRefreshing,
  clubOnRefresh,
}: {
  posts: any;
  flatListRef: any;
  club_id?: any[];
  clubRefreshing?: boolean;
  clubOnRefresh?: () => void;
}) => {
  const { refreshing, onRefresh } = useContext(PostContext);
  const { colors: color } = useTheme();

  const handleRefresh = () => {
    console.log("Refreshing with club_id:", club_id);
    onRefresh(club_id);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item, index }) => <PostCard post={item} />}
        keyExtractor={(item, index) => (item.id || "") + index.toString()}
        refreshing={clubRefreshing ? clubRefreshing : refreshing}
        onRefresh={clubOnRefresh ? clubOnRefresh : handleRefresh}
        contentContainerStyle={{ paddingBottom: 100 }}
        ref={flatListRef}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              marginTop: 20,
              justifyContent: "center",
            }}
          >
            <Text style={[{ color: color.onBackground }]}>
              No posts available
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]} // Android spinner color
            tintColor={Colors.PRIMARY} // iOS spinner color
          />
        }
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
