import React, { useState, useContext, useEffect } from "react";
import { View, Text, useWindowDimensions, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { PostContext } from "../context/PostContext";
import { ClubContext } from "../context/ClubContext";
import { EventContext } from "../context/EventContext";
import PostCard from "../components/Post/PostCard";
import ProfileEventCard from "../components/Events/ProfileEventCard";
import Colors from "../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
const AllActivityScreen = () => {
  const { colors } = useTheme();
  const layout = useWindowDimensions();

  const { userPosts, getUserPosts } = useContext(PostContext);
  const { followedClubs, getFollowedClubs } = useContext(ClubContext);
  const { registeredEvents, getRegisteredEvents, eventIsRegistered } =
    useContext(EventContext);

  useEffect(() => {
    getUserPosts();
    getFollowedClubs();
    getRegisteredEvents();
  }, []);

  return (
    <Tabs.Container
      renderHeader={() => (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Activity</Text>
        </View>
      )}
      renderTabBar={(props) => (
        <MaterialTabBar
          {...props}
          scrollEnabled={true}
          labelStyle={{
            fontSize: RFValue(14),
            textTransform: "none",
            color: "gray",
          }}
          tabStyle={{ backgroundColor: "white" }}
          indicatorStyle={{ backgroundColor: Colors.PRIMARY }}
          activeColor={Colors.PRIMARY}
          inactiveColor="#999"
        />
      )}
    >
      <Tabs.Tab name="Posts">
        <Tabs.ScrollView>
          <View style={styles.tabContent}>
            {userPosts.map((post: any, index: number) => (
              <PostCard key={index} post={post} />
            ))}
          </View>
        </Tabs.ScrollView>
      </Tabs.Tab>

      <Tabs.Tab name="Clubs">
        <Tabs.ScrollView>
          <View style={styles.tabContent}>
            {followedClubs.map((club: any, index: number) => (
              <Text key={index}>{club.name}</Text>
            ))}
          </View>
        </Tabs.ScrollView>
      </Tabs.Tab>

      <Tabs.Tab name="Events">
        <Tabs.ScrollView>
          <View style={styles.tabContent}>
            {registeredEvents.map((event: any, index: number) => (
              <ProfileEventCard
                key={index}
                {...event}
                isRegistered={eventIsRegistered(event.event_id)}
              />
            ))}
          </View>
        </Tabs.ScrollView>
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
