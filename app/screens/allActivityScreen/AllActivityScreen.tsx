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
  const [isLoading, setIsLoading] = useState(true);
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
  const [tabLoading, setTabLoading] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);

  // Extract user_id from route params
  const { user_id } = route.params || {};
  console.log("AllActivityScreen - Route params:", route.params);
  console.log(
    "AllActivityScreen - Extracted user_id:",
    user_id,
    "Type:",
    typeof user_id
  );

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          getUserPosts(),
          getFollowedClubs(),
          getRegisteredEvents(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle loading when user_id changes (viewing different user)
  useEffect(() => {
    if (user_id) {
      setIsLoading(true);
      // The data will be loaded by the individual tabs
      // Set a timeout to hide loading after a reasonable time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user_id]);

  // Handle tab change with loading
  const handleTabChange = ({ tabName }: { tabName: string }) => {
    setCurrentTab(tabName);
    setTabLoading(true);
    
    // Simulate loading time for tab switch
    setTimeout(() => {
      setTabLoading(false);
    }, 500);
  };

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
        renderHeader={() => (
          <AllActivityHeader 
            currentTab={currentTab} 
            user_id={user_id} 
            isLoading={isLoading || refreshing || tabLoading}
          />
        )}
        initialTabName={route.params.activeTab}
        onTabChange={handleTabChange}
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
          <PostsTab setShowCheckmark={setShowCheckmark} user_id={user_id} />
        </Tabs.Tab>

        <Tabs.Tab name="Clubs">
          <Clubstab setShowCheckmark={setShowCheckmark} user_id={user_id} />
        </Tabs.Tab>

        {!user_id ? (
          <Tabs.Tab name="Events">
            <EventsTab setShowCheckmark={setShowCheckmark} user_id={user_id} />
          </Tabs.Tab>
        ) : null}

        <Tabs.Tab name="Media">
          <MediaTab setShowCheckmark={setShowCheckmark} user_id={user_id} />
        </Tabs.Tab>

        <Tabs.Tab name="Comments">
          <CommentsTab setShowCheckmark={setShowCheckmark} user_id={user_id} />
        </Tabs.Tab>
        <Tabs.Tab name="Likes">
          <LikesTab setShowCheckmark={setShowCheckmark} user_id={user_id} />
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
