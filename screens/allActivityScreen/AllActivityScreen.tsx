import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  StyleSheet,
  RefreshControl,
  Vibration,
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
const AllActivityScreen = ({ navigation, route }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  const layout = useWindowDimensions();

  const { userPosts, getUserPosts } = useContext(PostContext);
  const { followedClubs, getFollowedClubs } = useContext(ClubContext);
  const { registeredEvents, getRegisteredEvents, eventIsRegistered } =
    useContext(EventContext);

  const [showCheckmark, setShowCheckmark] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);

  useEffect(() => {
    getUserPosts();
    getFollowedClubs();
    getRegisteredEvents();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {showCheckmark && (
        <Checkmark visible={showCheckmark} setVisible={setShowCheckmark} />
      )}
      <Tabs.Container
        renderHeader={() => (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Activity</Text>
          </View>
        )}
        initialTabName={route.params.activeTab}
        lazy={false}
        renderTabBar={(props) => (
          <MaterialTabBar
            {...props}
            scrollEnabled={true}
            labelStyle={{
              fontSize: RFValue(14),
              textTransform: "none",
              color: "black",
            }}
            tabStyle={{
              backgroundColor: "white",
            }}
            indicatorStyle={{ backgroundColor: Colors.PRIMARY }}
            activeColor={Colors.PRIMARY}
            inactiveColor="black"
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

        <Tabs.Tab name="Comments">
          <Tabs.ScrollView>
            <Text>Comments</Text>
          </Tabs.ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="Likes">
          <Tabs.ScrollView>
            <Text>Likes</Text>
          </Tabs.ScrollView>
        </Tabs.Tab>
      </Tabs.Container>
    </View>
  );
};

export default AllActivityScreen;

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: Colors.PRIMARY,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  tabContent: {
    padding: 16,
    backgroundColor: "#fff",
    minHeight: 400,
  },
});
