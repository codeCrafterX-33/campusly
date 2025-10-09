import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../constants/Colors";
import { PostContext } from "../context/PostContext";
import PostCard from "../components/Post/PostCard";
import { ClubContext } from "../context/ClubContext";
import usePersistedState from "../util/PersistedState";
import ProfileEventCard from "../components/Events/ProfileEventCard";
import { EventContext } from "../context/EventContext";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Button from "../components/ui/Button";
const miniTabs = ["Posts", "Clubs", "Events", "Media"];

export default function ActivitySectionScreen({
  screen,
  user_id,
}: {
  screen: string;
  user_id?: string;
}) {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const { registeredEvents, getRegisteredEvents, eventIsRegistered } =
    useContext(EventContext);
  const {
    userPosts,
    getPosts,
    GetUserPosts,
    setViewingUserPosts,
    viewingUserPosts,
  } = useContext(PostContext);
  const { followedClubs, getFollowedClubs } = useContext(ClubContext);
  const [followedClubsPosts, setFollowedClubsPosts] = usePersistedState(
    "followedClubsPosts",
    []
  );

  // Loading state to prevent showing old data
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(user_id);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Check if user_id has changed
    if (user_id !== currentUserId) {
      setIsLoading(true);
      setDataLoaded(false);
      setCurrentUserId(user_id);
    }

    if (user_id) {
      // Data is now fetched in Profile.tsx and available via viewingUserPosts
      setActiveTab("Posts");

      // Use a timeout to allow data to load and prevent immediate re-renders
      const timer = setTimeout(() => {
        setDataLoaded(true);
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Fallback to logged-in user's data
      console.log("👤 ActivitySection - Using logged-in user's context data");

      const loadData = async () => {
        setIsLoading(true);
        await Promise.all([
          getFollowedClubs(),
          getPosts({
            id: followedClubs.map((club: any) => club.club_id),
            setClubPosts: setFollowedClubsPosts,
            clubPosts: followedClubsPosts,
          }),
          getRegisteredEvents(),
        ]);
        setDataLoaded(true);
        setIsLoading(false);
      };

      loadData();
    }
  }, [user_id]);

  // Initial loading state
  useEffect(() => {
    // Show loading for initial render
    const initialTimer = setTimeout(() => {
      if (!isLoading) {
        setDataLoaded(true);
      }
    }, 100);

    return () => clearTimeout(initialTimer);
  }, []);

  // Always fetch registered events for the logged-in user
  useEffect(() => {
    if (!user_id) {
      getRegisteredEvents();
    }
  }, []);

  const [activeTab, setActiveTab] = useState(miniTabs[0]);
  const renderTabs = () => {
    // Hide Events tab when viewing another user's profile
    const tabsToShow = user_id ? ["Posts", "Clubs", "Media"] : miniTabs;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {tabsToShow.map((tab, index) => (
          <TouchableOpacity
            onPress={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.activeTab : styles.tab}
            key={index}
          >
            <Text
              style={activeTab === tab ? styles.activeTabText : styles.tabText}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTabContent = ({ tab }: { tab: string }) => {
    let content = null;

    // Use appropriate data source based on whether we're viewing a specific user
    const posts = user_id ? viewingUserPosts : userPosts;
    const clubs = followedClubs;
    const events = registeredEvents;
    const clubPosts = followedClubsPosts;

    const publicPosts = posts.filter((post: any) => post.club === 0);
    const viewingUserPublicPosts = viewingUserPosts.filter(
      (post: any) => post.club === 0
    );
    const viewingUserClubPosts = posts.filter(
      (post: any) =>
        post.club !== 0 && post.club !== null && post.user_id === user_id
    );
    const mediaPosts = posts.filter(
      (post: any) =>
        Array.isArray(post.media.media) && post.media.media.length > 0
    );
    const viewingUserMediaPosts = posts.filter(
      (post: any) =>
        Array.isArray(post.media.media) &&
        post.media.media.length > 0 &&
        post.user_id === user_id
    );

    switch (activeTab) {
      case "Posts":
        content = (
          <View style={styles.activitySectionContainer}>
            {user_id ? (
              viewingUserPublicPosts.length > 0 ? (
                <PostCard post={viewingUserPublicPosts[0]} />
              ) : (
                <View style={styles.emptyActivityContainer}>
                  <Text
                    style={[styles.emptyActivityText, { color: Colors.GRAY }]}
                  >
                    No posts yet 📝
                  </Text>
                </View>
              )
            ) : publicPosts.length > 0 ? (
              <PostCard post={publicPosts[0]} />
            ) : (
              <View style={styles.emptyActivityContainer}>
                <Text
                  style={[styles.emptyActivityText, { color: Colors.GRAY }]}
                >
                  No posts yet 📝
                </Text>
              </View>
            )}
          </View>
        );
        break;
      case "Clubs":
        content = (
          <View style={styles.activitySectionContainer}>
            {user_id ? (
              viewingUserClubPosts.length > 0 ? (
                <PostCard post={viewingUserClubPosts[0]} />
              ) : (
                <View style={styles.emptyActivityContainer}>
                  <Text
                    style={[styles.emptyActivityText, { color: Colors.GRAY }]}
                  >
                    No club posts yet 🏛️
                  </Text>
                </View>
              )
            ) : clubPosts.length > 0 ? (
              <PostCard post={clubPosts[0]} />
            ) : (
              <View style={styles.emptyActivityContainer}>
                <Text
                  style={[styles.emptyActivityText, { color: Colors.GRAY }]}
                >
                  No club posts yet 🏛️
                </Text>
              </View>
            )}
          </View>
        );
        break;
      case "Media":
        content = (
          <View style={styles.activitySectionContainer}>
            {user_id ? (
              viewingUserMediaPosts.length > 0 ? (
                <PostCard post={viewingUserMediaPosts[0]} />
              ) : (
                <View style={styles.emptyActivityContainer}>
                  <Text
                    style={[styles.emptyActivityText, { color: Colors.GRAY }]}
                  >
                    No media posts yet 📸
                  </Text>
                </View>
              )
            ) : mediaPosts.length > 0 ? (
              <PostCard post={mediaPosts[0]} />
            ) : (
              <View style={styles.emptyActivityContainer}>
                <Text
                  style={[styles.emptyActivityText, { color: Colors.GRAY }]}
                >
                  No media posts yet 📸
                </Text>
              </View>
            )}
          </View>
        );
        break;
      case "Events":
        content = (
          <View style={styles.activitySectionContainer}>
            {events.length > 0 ? (
              <ProfileEventCard
                {...events[0]}
                isRegistered={eventIsRegistered(events[0].id)}
              />
            ) : (
              <View style={styles.emptyActivityContainer}>
                <Text style={styles.emptyActivityText}>No events yet 🎈</Text>
                <Button
                  onPress={() =>
                    navigation.navigate("DrawerNavigator", {
                      screen: "TabLayout",
                      params: { screen: "Events" },
                    })
                  }
                >
                  Discover what's happening 🎉
                </Button>
              </View>
            )}
          </View>
        );
        break;
    }
    return content;
  };

  // Show loading state when switching users or initial load
  console.log(
    "ActivitySection - isLoading:",
    isLoading,
    "dataLoaded:",
    dataLoaded,
    "user_id:",
    user_id,
    "viewingUserPosts length:",
    viewingUserPosts.length
  );

  if (isLoading || !dataLoaded) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={[styles.loadingText, { color: colors.onBackground }]}>
          Loading activity...
        </Text>
      </View>
    );
  }

  // Handle mini mode for Profile screen
  if (screen === "mini") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {renderTabs()}
        {renderTabContent({ tab: activeTab })}

        <TouchableOpacity
          style={styles.showMoreContainer}
          onPress={() =>
            navigation.navigate("AllActivityScreen", {
              activeTab: activeTab,
              user_id: user_id,
            })
          }
        >
          <Text style={styles.showMoreText}>
            Show more {activeTab}
            <Icon name="arrow-right" size={20} color={Colors.PRIMARY} />
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {renderTabs()}
      {renderTabContent({ tab: activeTab })}

      <TouchableOpacity
        style={styles.showMoreContainer}
        onPress={() =>
          navigation.navigate("AllActivityScreen", {
            activeTab: activeTab,
            user_id: user_id,
          })
        }
      >
        <Text style={styles.showMoreText}>
          Show more {activeTab}
          <Icon name="arrow-right" size={20} color={Colors.PRIMARY} />
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const ActivitySectionMiniScreen = ({ user_id }: { user_id?: string }) => {
  return (
    <View style={styles.fullScreenContainer}>
      <ActivitySectionScreen screen="mini" user_id={user_id} />
    </View>
  );
};

export { ActivitySectionMiniScreen };

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tab: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.GRAY,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 99,
    paddingVertical: 8,
  },

  activeTab: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 99,
    paddingVertical: 8,
    backgroundColor: Colors.DARK_GRAY,
  },
  activeTabText: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.WHITE,
  },
  tabText: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.GRAY,
  },
  activitySectionContainer: {
    padding: 10,
  },
  showMoreText: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.PRIMARY,
    textAlign: "center",
  },
  showMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  emptyActivityText: {
    textAlign: "center",
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.GRAY,
  },
  emptyActivityContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: RFValue(18),
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
