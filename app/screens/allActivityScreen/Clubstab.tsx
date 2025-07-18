  import { RefreshControl, View, StyleSheet } from "react-native";
import React, { useContext, useState } from "react";
import { PostContext } from "../../context/PostContext";
import PostCard from "../../components/Post/PostCard";
import { Tabs } from "react-native-collapsible-tab-view";
import { OnRefresh } from "../../util/OnRefresh";
import Colors from "../../constants/Colors";

export default function ProfileClubtab({
  setShowCheckmark,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
}) {
  const { userPosts, getUserPosts } = useContext(PostContext);
  const [refreshing, setRefreshing] = useState(false);

  const clubPosts = userPosts.filter(
    (post: any) => post.club !== 0 && post.club !== null
  );

  return (
    <View style={styles.container}>
      <Tabs.FlatList
        data={clubPosts}
        renderItem={({ item, index }) => <PostCard post={item} />}
        keyExtractor={(item: any) => item.id + Math.random() + item.createdon}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              OnRefresh({
                setRefreshing,
                setShowCheckmark,
                getFunction: getUserPosts,
                route: "Clubs",
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
  },
});
