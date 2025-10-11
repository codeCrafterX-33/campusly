import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Colors from "../../constants/Colors";
import { useContext } from "react";
import { EventContext } from "../../context/EventContext";
import { PostContext } from "../../context/PostContext";
import { RFValue } from "react-native-responsive-fontsize";

export default function AllActivityHeader({
  currentTab,
  user_id,
  isLoading = false,
}: {
  currentTab: string;
  user_id: string | undefined;
  isLoading?: boolean;
}) {
  const { userPosts, viewingUserPosts, comments, viewingUserComments } =
    useContext(PostContext);
  const { registeredEvents } = useContext(EventContext);
  const posts = user_id ? viewingUserPosts : userPosts;
  const commentPosts = user_id ? viewingUserComments : comments;
  let count = 0;
  const publicPosts = posts.filter((post: any) => post.club === 0);
  const mediaPosts = posts.filter(
    (post: any) =>
      Array.isArray(post.media.media) && post.media.media.length > 0
  );

  console.log("commentPosts", commentPosts);
  switch (currentTab) {
    case "Posts":
      count = publicPosts.length;
      break;
    case "Clubs":
      const clubPosts = posts.filter(
        (post: any) => post.club !== 0 && post.club !== null
      );
      count = clubPosts.length;
      break;
    case "Events":
      count = registeredEvents.length;
      break;
    case "Media":
      count = mediaPosts.reduce((total: number, post: any) => {
        return total + (post.media?.media?.length || 0);
      }, 0);
      break;
    case "Comments":
      count = commentPosts.length;
      break;
    case "Likes":
      count = 0;
      break;
  }
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>
          {currentTab === "Clubs" ? "Club posts" : currentTab}
        </Text>
        <View style={styles.countContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.count}>({count})</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: Colors.DARK_GRAY,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    color: "white",
  },
  countContainer: {
    minWidth: 40,
    alignItems: "center",
  },
  count: {
    fontSize: RFValue(16),
    color: "white",
  },
});
