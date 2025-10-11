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
import Colors from "../constants/Colors";
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
  const { userData } = useContext(AuthContext);
  const { userCreatedClubs, getUserCreatedClubs } = useContext(ClubContext);

  const fetchPosts = async () => {
    try {
      // Get the IDs of the followed clubs and the user created clubs
      const followedClubsIDs = followedClubs.map((club: any) => club.club_id);
      const userCreatedClubsIDs = userCreatedClubs.map((club: any) => club.id);
      if (userCreatedClubsIDs.length > 0) {
        followedClubsIDs.push(...userCreatedClubsIDs);
      }

      if (followedClubsIDs.length === 0) {
        setFollowedClubsPosts([]); // Clear posts if no clubs
        return;
      }
      console.log("fetching posts with club_id", followedClubsIDs);
      await getPosts({
        id: followedClubsIDs,
        setClubPosts: setFollowedClubsPosts,
        clubPosts: followedClubsPosts,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch posts whenever followedClubs changes (when joining/leaving clubs)
  useEffect(() => {
    fetchPosts();
  }, [followedClubs]);

  useFocusEffect(
    useCallback(() => {
      // Fetch posts when the component comes into focus
      try {
        setIsLoading(true);
        fetchPosts();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }, [followedClubs]) // Now depends on followedClubs
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
