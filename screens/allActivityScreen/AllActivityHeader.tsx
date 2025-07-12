import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import { useContext } from "react";
import { EventContext } from "../../context/EventContext";
import { PostContext } from "../../context/PostContext";
import { RFValue } from "react-native-responsive-fontsize";

export default function AllActivityHeader({
  currentTab,
}: {
  currentTab: string;
}) {
  const { userPosts } = useContext(PostContext);
  const { registeredEvents } = useContext(EventContext);
  let count = 10;

  switch (currentTab) {
    case "Posts":
      count = userPosts.length;
      break;
    case "Clubs":
      const clubPosts = userPosts.filter(
        (post: any) => post.club !== 0 && post.club !== null
      );
      count = clubPosts.length;
      break;
    case "Events":
      count = registeredEvents.length;
      break;
    case "Comments":
      count = 0;
      break;
    case "Likes":
      count = 0;
      break;
  }
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {currentTab === "Clubs"
          ? `Club posts (${count})`
          : `${currentTab} (${count})`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 10,
    paddingVertical: 20,
    backgroundColor: Colors.DARK_GRAY,
  },
  headerTitle: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    color: "white",
  },
  count: {
    fontSize: RFValue(16),
    color: "white",
  },
});
