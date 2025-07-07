 import React from "react";
import { View, Text, StyleSheet } from "react-native";
import PostCard from "../Post/PostCard";
import { useContext } from "react";
import { PostContext } from "../../context/PostContext";
import { Tabs } from "react-native-collapsible-tab-view";
const ProfileStudyTab = () => {
  const { userPosts } = useContext(PostContext);
  return (
    <Tabs.ScrollView style={styles.studyContainer}>
      <Text style={[styles.sectionTitle, { color: "black" }]}>
        Study Groups & Academic Posts
      </Text>
      {userPosts
        .filter((p: any) => p.type === "study" || p.type === "achievement")
        .map((post: any) => (
          <PostCard post={post} key={post.id} />
        ))}
    </Tabs.ScrollView>
  );
};

export default ProfileStudyTab;

const styles = StyleSheet.create({
  studyContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  });

