import React, { useContext, useCallback } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { PostContext } from "../../context/PostContext";
import { useFocusEffect } from "@react-navigation/native";
import usePersistedState from "../../util/PersistedState";
import LatestPost from "../../components/Home/LatestPost";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "react-native-paper";


export default function FollowingScreen({ clubId }: { clubId: number }) {
  const { getPosts } = useContext(PostContext);
  const [clubPosts, setClubPosts] = usePersistedState("clubPosts", []);
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const fetchPosts = async () => {
        console.log("Fetching posts clubId", clubId);
        await getPosts({
          id: [clubId],
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
});
