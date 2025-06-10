import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import EmptyState from "../components/Clubs/EmptyState";
import { useTheme } from "react-native-paper";
import { useContext } from "react";
import { ClubContext } from "../context/ClubContext";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { PostContext } from "../context/PostContext";
import usePersistedState from "../util/PersistedState";
import { Colors } from "react-native/Libraries/NewAppScreen";
import LatestPost from "../components/Home/LatestPost";
export default function Clubs() {
  const { colors } = useTheme();
  // Importing the ClubContext to access followed clubs and the function to get them
  const { followedClubs, getFollowedClubs, getClubs } = useContext(ClubContext);
  const { getPosts } = useContext(PostContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [followedClubsPosts, setFollowedClubsPosts] = usePersistedState(
    "followedClubsPosts",
    []
  );
  const { user } = useContext(AuthContext);

  const fetchPosts = async () => {
    try {
      if (followedClubs.length === 0) {
        return;
      }
      console.log(
        "fetching posts with club_id",
        followedClubs.map((club: any) => club.club_id)
      );
      await getPosts({
        id: followedClubs.map((club: any) => club.club_id),
        setClubPosts: setFollowedClubsPosts,
        clubPosts: followedClubsPosts,
      });
      if (followedClubsPosts.length > 0) {
        console.log("followedClubsPosts", followedClubsPosts);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Fetch posts when the component mounts or user changes
      try {
        setIsLoading(true);
        fetchPosts();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }, [user])
  );

  if (isLoading) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View>
        {followedClubs.length === 0 ? (
          <EmptyState />
        ) : (
          <LatestPost
            clubPosts={followedClubsPosts}
            clubRefreshing={isRefreshing}
            clubOnRefresh={() => fetchPosts()}
            club_id={followedClubs.map((club: any) => club.club_id)}
          />

        )}
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
