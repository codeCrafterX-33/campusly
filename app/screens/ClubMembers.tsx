import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../constants/Colors";
import { AuthContext } from "../context/AuthContext";
import { ClubContext } from "../context/ClubContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import Button from "../components/ui/Button";
import CampuslyAlert from "../components/CampuslyAlert";

type TabType = "all" | "admins";

type Member = {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  user_image: string;
  image: string;
  joined_date: string;
  is_admin: boolean;
};

export default function ClubMembers() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);
  const { getClubMembers, addClubAdmin, removeClubAdmin } =
    useContext(ClubContext);

  const { club } = route.params as { club: any };

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRemoveAlert, setShowRemoveAlert] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showAdminAlert, setShowAdminAlert] = useState(false);
  const [adminAction, setAdminAction] = useState<"promote" | "demote" | null>(
    null
  );
  const [isAdminActionLoading, setIsAdminActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  useEffect(() => {
    fetchMembers();
  }, [getClubMembers]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const membersData = await getClubMembers(club.id);
      console.log("Members data from context:", membersData);
      setMembers(membersData);
    } catch (error) {
      console.error("Error fetching members:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load members",
        text2: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMembers();
    setRefreshing(false);
  };

  // Filter members based on active tab
  const filteredMembers = members.filter((member) => {
    if (activeTab === "admins") {
      return member.is_admin;
    }
    return true; // Show all members for "all" tab
  });

  const renderTabButton = (tab: TabType, label: string, count: number) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab ? styles.activeTabButton : styles.inactiveTabButton,
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabText,
          activeTab === tab ? styles.activeTabText : styles.inactiveTabText,
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const handleRemoveMember = (member: Member) => {
    if (member.is_admin) {
      Toast.show({
        type: "error",
        text1: "Cannot remove admin",
        text2: "Admins cannot be removed from the club",
      });
      return;
    }

    setSelectedMember(member);
    setShowRemoveAlert(true);
  };

  const confirmRemoveMember = async () => {
    if (!selectedMember) return;

    setIsRemoving(true);
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/club/remove-member/${club.id}`,
        {
          data: {
            user_id: userData?.id,
            member_id: selectedMember.id,
          },
        }
      );

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Member removed",
          text2: `${selectedMember.username} has been removed from the club`,
        });
        await fetchMembers();
        // Navigate back to trigger focus listener and refresh member count
        navigation.goBack();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        Toast.show({
          type: "error",
          text1: "Failed to remove member",
          text2: error.response?.data?.message || "Please try again",
        });
      }
    } finally {
      setIsRemoving(false);
      setShowRemoveAlert(false);
      setSelectedMember(null);
    }
  };

  const handleAdminAction = (member: Member, action: "promote" | "demote") => {
    setSelectedMember(member);
    setAdminAction(action);
    setShowAdminAlert(true);
  };

  const confirmAdminAction = async () => {
    if (!selectedMember || !userData?.id || !club?.id || !adminAction) return;

    setIsAdminActionLoading(true);
    try {
      if (adminAction === "promote") {
        await addClubAdmin(club.id, selectedMember.id);
      } else {
        await removeClubAdmin(club.id, selectedMember.id);
      }

      // Refresh the members list to show updated admin status
      await fetchMembers();
    } catch (error) {
      console.error(`Error ${adminAction}ing admin:`, error);
    } finally {
      setIsAdminActionLoading(false);
      setShowAdminAlert(false);
      setAdminAction(null);
    }
  };

  const renderMember = ({ item }: { item: Member }) => (
    <View style={[styles.memberCard, { backgroundColor: colors.surface }]}>
      <View style={styles.memberInfo}>
        <View style={styles.avatarContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.avatar} />
          ) : (
            <Icon name="account-circle-outline" size={40} color={Colors.GRAY} />
          )}
        </View>
        <View style={styles.memberDetails}>
          <Text style={[styles.memberName, { color: colors.onBackground }]}>
            {item.firstname} {item.lastname}
          </Text>
          <Text
            style={[styles.memberUsername, { color: Colors.GRAY }]}
          >
            @{item.username}
          </Text>
          <Text style={[styles.joinDate, { color: Colors.GRAY }]}>
            Joined{" "}
            {new Date(item.joined_date).toLocaleDateString("en-US", {
              month: "long",

              year: "numeric",
            })}
          </Text>
        </View>
      </View>

      <View style={styles.memberActions}>
        {item.is_admin && (
          <View style={styles.adminBadge}>
            <Icon name="crown" size={16} color={Colors.PRIMARY} />
            <Text style={[styles.adminText, { color: Colors.PRIMARY }]}>
              Admin
            </Text>
          </View>
        )}

        {/* Admin management buttons - only show for club owner and in "All Members" tab */}
        {userData?.id === club.user_id &&
          item.id !== userData.id &&
          activeTab === "all" && (
            <View style={styles.adminManagementButtons}>
              {!item.is_admin ? (
                <TouchableOpacity
                  style={[styles.adminButton, styles.promoteButton]}
                  onPress={() => handleAdminAction(item, "promote")}
                >
                  <Icon name="account-plus" size={16} color={Colors.PRIMARY} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.adminButton, styles.demoteButton]}
                  onPress={() => handleAdminAction(item, "demote")}
                >
                  <Icon name="account-minus" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.adminButton, styles.removeButton]}
                onPress={() => handleRemoveMember(item)}
              >
                <Icon name="account-remove" size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
      </View>
    </View>
  );

  const renderEmpty = () => {
    const isAdminsTab = activeTab === "admins";
    return (
      <View style={styles.emptyContainer}>
        <Icon
          name={isAdminsTab ? "crown-outline" : "account-group-outline"}
          size={64}
          color={colors.onSurfaceVariant}
        />
        <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>
          {isAdminsTab ? "No admins yet" : "No members yet"}
        </Text>
        <Text
          style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}
        >
          {isAdminsTab
            ? "Only the club creator is an admin by default"
            : "Members will appear here once they join the club"}
        </Text>
        {isAdminsTab && members.length > 0 && (
          <Text style={[styles.helpText, { color: colors.onSurfaceVariant }]}>
            💡 Switch to "All Members" to promote members to admin
          </Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={[styles.loadingText, { color: colors.onBackground }]}>
          Loading members...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
          {club.name} Members
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        {renderTabButton("all", "All Members", members.length)}
        {renderTabButton(
          "admins",
          "Admins",
          members.filter((m) => m.is_admin).length
        )}
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMember}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <CampuslyAlert
        isVisible={showRemoveAlert}
        type="error"
        onClose={() => setShowRemoveAlert(false)}
        messages={{
          success: {
            title: "Member Removed! 👋",
            message: "The member has been successfully removed from the club.",
            icon: "🎉",
          },
          error: {
            title: "Remove Member? ⚠️",
            message: `Are you sure you want to remove ${selectedMember?.username} from the club? This action cannot be undone.`,
            icon: "⚠️",
          },
        }}
        onPress={confirmRemoveMember}
        onPress2={() => setShowRemoveAlert(false)}
        buttonText="Yes, remove them"
        buttonText2="Cancel"
        overrideDefault={true}
        isLoading={isRemoving}
        loadingText="Removing... 👋"
      />

      <CampuslyAlert
        isVisible={showAdminAlert}
        type="error"
        onClose={() => setShowAdminAlert(false)}
        messages={{
          success: {
            title:
              adminAction === "promote"
                ? "Admin Promoted! 👑"
                : "Admin Demoted! 👤",
            message:
              adminAction === "promote"
                ? `${selectedMember?.username} has been promoted to admin.`
                : `${selectedMember?.username} has been demoted from admin.`,
            icon: adminAction === "promote" ? "👑" : "👤",
          },
          error: {
            title:
              adminAction === "promote"
                ? "Promote to Admin? 👑"
                : "Demote from Admin? 👤",
            message:
              adminAction === "promote"
                ? `Are you sure you want to promote ${selectedMember?.username} to admin? They will be able to manage club members and content.`
                : `Are you sure you want to demote ${selectedMember?.username} from admin? They will lose admin privileges.`,
            icon: adminAction === "promote" ? "👑" : "👤",
          },
        }}
        onPress={confirmAdminAction}
        onPress2={() => setShowAdminAlert(false)}
        buttonText={
          adminAction === "promote" ? "Yes, promote them" : "Yes, demote them"
        }
        buttonText2="Cancel"
        overrideDefault={true}
        isLoading={isAdminActionLoading}
        loadingText={
          adminAction === "promote" ? "Promoting... 👑" : "Demoting... 👤"
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: RFValue(16),
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: Colors.PRIMARY,
  },
  inactiveTabButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  tabText: {
    fontSize: RFValue(14),
    fontWeight: "600",
  },
  activeTabText: {
    color: "white",
  },
  inactiveTabText: {
    color: Colors.PRIMARY,
  },
  listContainer: {
    padding: 16,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  memberUsername: {
    fontSize: RFValue(14),
    marginTop: 2,
  },
  joinDate: {
    fontSize: RFValue(12),
    marginTop: 2,
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.PRIMARY}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  adminText: {
    fontSize: RFValue(12),
    fontWeight: "600",
    marginLeft: 4,
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FF6B6B20",
  },
  adminManagementButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminButton: {
    padding: 8,
    borderRadius: 20,
  },
  promoteButton: {
    backgroundColor: `${Colors.PRIMARY}20`,
  },
  demoteButton: {
    backgroundColor: "#FF6B6B20",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: RFValue(14),
    marginTop: 8,
    textAlign: "center",
    lineHeight: RFValue(20),
  },
  helpText: {
    fontSize: RFValue(12),
    marginTop: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
});
