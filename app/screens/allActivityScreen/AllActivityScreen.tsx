import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  StyleSheet,
  RefreshControl,
  Vibration,
  StatusBar,
} from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { PostContext } from "../../context/PostContext";
import { ClubContext } from "../../context/ClubContext";
import { EventContext } from "../../context/EventContext";
import PostCard from "../../components/Post/PostCard";
import ProfileEventCard from "../../components/Events/ProfileEventCard";
import Colors from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import ProfilePostsTab from "./PostsTab";
import { Toast } from "react-native-toast-message/lib/src/Toast";

import Checkmark from "../../components/checkmark";
import PostsTab from "./PostsTab";
import Clubstab from "./Clubstab";
import EventsTab from "./EventsTab";
import { ThemeContext } from "../../context/ThemeContext";
import AllActivityHeader from "./AllActivityHeader";
import LikesTab from "./LikesTab";
import CommentsTab from "./CommentsTab";
import MediaTab from "./MediaTab";

const AllActivityScreen = ({ navigation, route }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const layout = useWindowDimensions();
  const { isDarkMode } = useContext(ThemeContext);

  const { userPosts, getUserPosts } = useContext(PostContext);
  const { followedClubs, getFollowedClubs } = useContext(ClubContext);
  const { registeredEvents, getRegisteredEvents, eventIsRegistered } =
    useContext(EventContext);

  const [currentTab, setCurrentTab] = useState(
    route.params.activeTab || "Posts"
  );
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);

  useEffect(() => {
    getUserPosts();
    getFollowedClubs();
    getRegisteredEvents();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      {showCheckmark && (
        <Checkmark visible={showCheckmark} setVisible={setShowCheckmark} />
      )}
      <Tabs.Container
        renderHeader={() => <AllActivityHeader currentTab={currentTab} />}
        initialTabName={route.params.activeTab}
        onTabChange={({ tabName }) => setCurrentTab(tabName)}
        lazy={false}
        renderTabBar={(props) => (
          <MaterialTabBar
            {...props}
            scrollEnabled={true}
            keepActiveTabCentered={true}
            labelStyle={{
              fontSize: RFValue(14),
              textTransform: "none",
              color: colors.onBackground,
            }}
            tabStyle={{
              backgroundColor: colors.background,
            }}
            indicatorStyle={{ backgroundColor: Colors.PRIMARY }}
            activeColor={Colors.PRIMARY}
            inactiveColor={colors.onBackground}
          />
        )}
      >
        <Tabs.Tab name="Posts">
          <PostsTab setShowCheckmark={setShowCheckmark} />
        </Tabs.Tab>

        <Tabs.Tab name="Clubs">
          <Clubstab setShowCheckmark={setShowCheckmark} />
        </Tabs.Tab>

        <Tabs.Tab name="Events">
          <EventsTab setShowCheckmark={setShowCheckmark} />
        </Tabs.Tab>

        <Tabs.Tab name="Media">
          <MediaTab setShowCheckmark={setShowCheckmark} />
        </Tabs.Tab>

        <Tabs.Tab name="Comments">
          <CommentsTab setShowCheckmark={setShowCheckmark} />
        </Tabs.Tab>
        <Tabs.Tab name="Likes">
          <LikesTab setShowCheckmark={setShowCheckmark} />
        </Tabs.Tab>
      </Tabs.Container>
    </View>
  );
};

export default AllActivityScreen;

const styles = StyleSheet.create({
  tabContent: {
    padding: 16,
    backgroundColor: "#fff",
    minHeight: 400,
  },
});
