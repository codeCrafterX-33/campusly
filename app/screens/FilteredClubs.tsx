import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { ClubContext } from "../context/ClubContext";
import { AuthContext } from "../context/AuthContext";
import ClubCard from "../components/Clubs/ClubCard";
import Colors from "../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";

type TabType = "joined" | "my";

export default function FilteredClubs() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("joined");

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity style={styles.filter} onPress={() => setActiveTab(tab)}>
      <Text
        style={[
          styles.tabText,
          activeTab === tab ? styles.activeTabText : styles.inactiveTabText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Tab Header - Matching Event tabs style */}
      <View style={styles.tabHeader}>
        <View style={styles.tabBackground}>
          {renderTabButton("joined", "Joined Clubs")}
          {renderTabButton("my", "My Clubs")}
        </View>
      </View>

      {/* Tab Content */}
      {activeTab === "joined" ? <JoinedClubsTab /> : <MyClubsTab />}
    </View>
  );
}

// Joined Clubs Tab
function JoinedClubsTab() {
  const { colors } = useTheme();
  const { followedClubs, getFollowedClubs, refreshing, onRefresh } =
    useContext(ClubContext);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          await getFollowedClubs();
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [])
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

  if (followedClubs.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.emptyText, { color: colors.onBackground }]}>
          You haven't joined any clubs yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.onSurfaceVariant }]}>
          Explore clubs and join the ones that interest you!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.tabContent, { backgroundColor: colors.background }]}>
      <FlatList
        data={followedClubs}
        renderItem={({ item }) => (
          <ClubCard
            {...item}
            isFollowed={true}
            refreshData={getFollowedClubs}
            isAdmin={false}
            showEditDelete={false}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

// My Clubs Tab
function MyClubsTab() {
  const { colors } = useTheme();
  const { userCreatedClubs, getUserCreatedClubs, refreshing, onRefresh } =
    useContext(ClubContext);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          await getUserCreatedClubs();
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [])
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

  if (userCreatedClubs.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.emptyText, { color: colors.onBackground }]}>
          You haven't created any clubs yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.onSurfaceVariant }]}>
          Create your first club to get started!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.tabContent, { backgroundColor: colors.background }]}>
      <FlatList
        data={userCreatedClubs}
        renderItem={({ item }) => (
          <ClubCard
            {...item}
            isFollowed={false}
            refreshData={getUserCreatedClubs}
            isAdmin={true}
            showEditDelete={true}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tabBackground: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filter: {
    flex: 1,
    marginHorizontal: 2,
  },
  tabText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    textAlign: "center",
  },
  activeTabText: {
    backgroundColor: Colors.PRIMARY,
    color: "white",
    fontWeight: "700",
    elevation: 4,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  inactiveTabText: {
    color: Colors.PRIMARY,
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
