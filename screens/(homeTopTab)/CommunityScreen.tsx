import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { PostContext } from "../../context/PostContext";
import usePersistedState from "../../util/PersistedState";
import LatestPost from "../../components/Home/LatestPost";
import { useTheme } from "react-native-paper";

const CommunityScreen = ({ club_id }: { club_id: number }) => {
  const { getPosts } = useContext(PostContext);
  const [clubPosts, setClubPosts] = usePersistedState(`clubPosts-${club_id}`, []);
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const fetchPosts = async () => {
        console.log("Fetching posts clubId", club_id);
        await getPosts({
          id: [club_id],
          clubPosts: clubPosts,
          setClubPosts: setClubPosts,
        });
        if (clubPosts.length > 0) {
          // console.log(clubPosts);
        }
      };
      fetchPosts();
    }, [])
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LatestPost clubPosts={clubPosts} />
    </View>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
});
