import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
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

export default function ActivitySectionScreen({ screen }: { screen: string }) {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const { registeredEvents, getRegisteredEvents, eventIsRegistered } =
    useContext(EventContext);
  const { userPosts, getPosts } = useContext(PostContext);
  const { followedClubs, getFollowedClubs } = useContext(ClubContext);
  const [followedClubsPosts, setFollowedClubsPosts] = usePersistedState(
    "followedClubsPosts",
    []
  );

  useEffect(() => {
    getFollowedClubs();
    getPosts({
      id: followedClubs.map((club: any) => club.club_id),
      setClubPosts: setFollowedClubsPosts,
      clubPosts: followedClubsPosts,
    });
    getRegisteredEvents();
  }, []);

  const [activeTab, setActiveTab] = useState(miniTabs[0]);
  const renderTabs = () => {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {miniTabs.map((tab, index) => (
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
    const publicPosts = userPosts.filter((post: any) => post.club === 0);
    switch (activeTab) {
      case "Posts":
        content = (
          <View style={styles.activitySectionContainer}>
            <PostCard post={publicPosts[0]} />
          </View>
        );
        break;
      case "Clubs":
        content = (
          <View style={styles.activitySectionContainer}>
            <PostCard post={followedClubsPosts[0]} />
          </View>
        );
        break;
      case "Media":
        content = (
          <View style={styles.activitySectionContainer}>
            <Text style={[styles.emptyActivityText, { color: Colors.GRAY }]}>
              Nothing to see yet 👀
            </Text>
          </View>
        );
        break;
      case "Events":
        content = (
          <View style={styles.activitySectionContainer}>
            {registeredEvents.length > 0 ? (
              <ProfileEventCard
                {...registeredEvents[0]}
                isRegistered={eventIsRegistered(registeredEvents[0].event_id)}
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {renderTabs()}
      {renderTabContent({ tab: activeTab })}

      <TouchableOpacity
        style={styles.showMoreContainer}
        onPress={() =>
          navigation.navigate("AllActivityScreen", {
            activeTab: activeTab,
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

const ActivitySectionMiniScreen = () => {
  return (
    <View style={styles.fullScreenContainer}>
      <ActivitySectionScreen screen="mini" />
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
});
