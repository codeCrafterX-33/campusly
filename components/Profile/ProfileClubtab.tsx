import { View, Text, FlatList } from "react-native";
import React, { useContext } from "react";
import { PostContext } from "../../context/PostContext";
import PostCard from "../Post/PostCard";
import { Tabs } from "react-native-collapsible-tab-view";
export default function ProfileClubtab() {
  const { userPosts } = useContext(PostContext);
  return (
    <View>
      <Tabs.FlatList
        data={userPosts}
        renderItem={({ item, index }) => <PostCard post={item} />}
        keyExtractor={(item: any) => item.id + Math.random() + item.createdon}
      />
    </View>
  );
}
