import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../constants/Colors";
import { AuthContext } from "../context/AuthContext";
import { ClubContext } from "../context/ClubContext";
import { PostContext } from "../context/PostContext";
import Button from "../components/ui/Button";
import { useThemeContext } from "../context/ThemeContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import PostCard from "../components/Post/PostCard";
import CampuslyAlert from "../components/CampuslyAlert";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = 60;
const LOGO_HEIGHT = 250;

type TabType = "posts" | "media" | "about";

export default function ClubScreen() {
  const { colors } = useTheme();
  const { isDarkMode } = useThemeContext();
  const route = useRoute();
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);
  const { getFollowedClubs, followedClubs } = useContext(ClubContext);
  const { getPosts } = useContext(PostContext);

  const { club } = route.params as { club: any };

  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [isFollowed, setIsFollowed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const [clubPosts, setClubPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const mainTabsOpacity = new Animated.Value(1); // Start fully visible
  const mainTabsAnimation = new Animated.Value(0); // Start at normal position
  const stickyTabsAnimation = new Animated.Value(-100); // Start above the screen

  // Check if user is following this club and if user is admin
  useEffect(() => {
    const checkUserStatus = () => {
      // Check if user is following this club
      const followed = followedClubs.some(
        (followedClub: any) => followedClub.club_id === club.id
      );
      setIsFollowed(followed);

      // Check if user is owner of this club
      const isOwner = userData?.id === club.user_id;
      setIsAdmin(isOwner);
    };

    checkUserStatus();
  }, [followedClubs, club.id, userData?.id, club.user_id]);

  // Fetch club posts when component mounts
  useEffect(() => {
    const fetchClubPosts = async () => {
      if (!club?.id) return;

      setIsLoadingPosts(true);
      try {
        await getPosts({
          id: [club.id],
          setClubPosts: setClubPosts,
        });
      } catch (error) {
        console.error("Error fetching club posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchClubPosts();
  }, [club?.id, getPosts]);

  // Animate sticky tabs when they appear/disappear
  useEffect(() => {
    if (isTabsSticky) {
      Animated.timing(stickyTabsAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Fade out and slide down main tabs
      Animated.parallel([
        Animated.timing(mainTabsOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainTabsAnimation, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(stickyTabsAnimation, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Fade in and slide up main tabs
      Animated.parallel([
        Animated.timing(mainTabsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(mainTabsAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isTabsSticky]);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    if (isFollowed) {
      try {
        const response = await axios.delete(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/club/unfollowclub/${userData?.id}`,
          {
            data: { clubId: club?.id },
          }
        );

        if (response.status === 200) {
          await getFollowedClubs();
          console.log("Club unfollowed");
        } else {
          console.log("Club unfollow failed");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          Toast.show({
            text1: "Club unfollow failed",
            text2: "Please try again",
            type: "error",
          });
        }
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/club/followclub/${userData?.id}`,
          {
            clubId: club?.id,
            user_email: userData?.email,
          }
        );

        if (response.status === 201) {
          await getFollowedClubs();
          console.log("Club followed");
        } else {
          console.log("Club follow failed");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error.response?.data);
          Toast.show({
            text1: "Club follow failed",
            text2: "Please try again",
            type: "error",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteClub = async () => {
    if (!userData?.id || !club?.id) return;

    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/club/deleteclub/${club.id}`,
        {
          data: { user_id: userData.id },
        }
      );

      if (response.status === 200) {
        Toast.show({
          text1: "Club deleted successfully",
          text2: "The club has been permanently deleted",
          type: "success",
        });
        // Navigate back to clubs list or home
        navigation.goBack();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        Toast.show({
          text1: "Failed to delete club",
          text2: error.response?.data?.message || "Please try again",
          type: "error",
        });
      }
      console.error("Error deleting club:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={() => setActiveTab(tab)}
    >
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

  const renderHashtag = (hashtag: string) => (
    <TouchableOpacity key={hashtag} style={styles.hashtagContainer}>
      <Text style={styles.hashtagText}>#{hashtag}</Text>
    </TouchableOpacity>
  );

  const renderTrendingHashtags = () => (
    <View style={styles.hashtagsSection}>
      <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
        Trending Hashtags
      </Text>
      <View style={styles.hashtagsContainer}>
        {trendingHashtags.map(renderHashtag)}
      </View>
    </View>
  );

  const renderPostsTab = () => (
    <View style={styles.tabContent}>
      {renderTrendingHashtags()}
      <View style={styles.postsSection}>
        {isLoadingPosts ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.onBackground }]}>
              Loading posts...
            </Text>
          </View>
        ) : clubPosts.length > 0 ? (
          clubPosts.map((post, index) => (
            <PostCard
              key={post.id || index}
              post={post}
              onCommentPress={() => {
                (navigation as any).navigate("CommentScreen", { post });
              }}
            />
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Icon
              name="post-outline"
              size={48}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.emptyStateText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              No posts yet
            </Text>
            <Text
              style={[
                styles.emptyStateSubtext,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Be the first to share something in this club!
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderMediaTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.mediaSection}>
        {isLoadingPosts ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.onBackground }]}>
              Loading media...
            </Text>
          </View>
        ) : clubPosts.length > 0 ? (
          <View style={styles.mediaGrid}>
            {clubPosts
              .filter(
                (post) =>
                  post.media &&
                  Array.isArray(post.media.media) &&
                  post.media.media.length > 0
              )
              .map((post, index) =>
                post.media.media.map((mediaItem: any, mediaIndex: number) => (
                  <TouchableOpacity
                    key={`${post.id}-${mediaIndex}`}
                    style={styles.mediaItem}
                    onPress={() => {
                      // Navigate to post screen to view media
                      (navigation as any).navigate("PostScreen", { post });
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          mediaItem.type === "image"
                            ? mediaItem.url
                            : mediaItem.url.replace(
                                "/upload/",
                                "/upload/w_500,h_500,c_fill,q_auto,f_jpg/"
                              ),
                      }}
                      style={styles.mediaThumbnail}
                    />
                    {mediaItem.type === "video" && (
                      <View style={styles.videoOverlay}>
                        <Icon
                          name="play-circle-outline"
                          size={32}
                          color="white"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Icon
              name="image-outline"
              size={48}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.emptyStateText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              No media yet
            </Text>
            <Text
              style={[
                styles.emptyStateSubtext,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Share some photos or videos to see them here!
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.aboutSection}>
        <View style={styles.aboutCard}>
          <Text style={[styles.aboutTitle, { color: colors.onBackground }]}>
            About {club.name}
          </Text>
          <Text
            style={[
              styles.aboutDescription,
              { color: colors.onSurfaceVariant },
            ]}
          >
            {club.about}
          </Text>
        </View>

        <View style={styles.aboutCard}>
          <Text style={[styles.aboutTitle, { color: colors.onBackground }]}>
            Club Details
          </Text>
          <View style={styles.detailRow}>
            <Icon name="account-group" size={20} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.onBackground }]}>
              {club.member_count || 0} members
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.onBackground }]}>
              Created {new Date(club.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="account" size={20} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.onBackground }]}>
              Created by {club.createdby}
            </Text>
          </View>
        </View>

        {isAdmin && (
          <View style={styles.adminCard}>
            <Text style={[styles.adminTitle, { color: colors.primary }]}>
              Admin Actions
            </Text>
            <Button
              onPress={() => (navigation as any).navigate("EditClub", { club })}
              viewStyle={styles.adminButton}
            >
              Edit Club
            </Button>
          </View>
        )}
      </View>
    </View>
  );

  const trendingHashtags = [
    "nigeria",
    "naija",
    "Nigerian",
    "nigerians",
    "ng",
    "ngr",
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Club Logo Background */}
      <View style={styles.logoBackground}>
        <Image source={{ uri: club.club_logo }} style={styles.logoImage} />
      </View>

      {/* Transparent Overlay Header */}
      <View style={styles.overlayHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerStripe} />
        </View>

        <TouchableOpacity>
          <Icon name="magnify" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Sticky Tabs Container */}
      <Animated.View
        style={[
          styles.stickyTabsContainer,
          {
            transform: [{ translateY: stickyTabsAnimation }],
            opacity: stickyTabsAnimation.interpolate({
              inputRange: [-100, 0],
              outputRange: [0, 1],
            }),
          },
        ]}
      >
        {renderTabButton("posts", "Posts")}
        {renderTabButton("media", "Media")}
        {renderTabButton("about", "About")}
      </Animated.View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={(event) => {
          const scrollY = event.nativeEvent.contentOffset.y;
          const tabsThreshold = 450; // Threshold when main tabs are completely out of view
          const mainTabsDisappearThreshold = 400; // Threshold when main tabs start disappearing
          const mainTabsReappearThreshold = 500; // Threshold when main tabs should reappear

          // Show sticky tabs when main tabs are out of view
          if (scrollY > tabsThreshold) {
            setIsTabsSticky(true);
          }
          // Hide sticky tabs when scrolling back up
          else if (scrollY < mainTabsDisappearThreshold) {
            setIsTabsSticky(false);
          }
          // Show main tabs again when scrolling down past sticky tabs
          else if (scrollY > mainTabsReappearThreshold) {
            setIsTabsSticky(false);
          }
        }}
        scrollEventThrottle={32}
      >
        {/* Community Title Section */}
        <View style={styles.communitySection}>
          <Text style={styles.communityTitle}>
            {club.name.length > 30
              ? `${club.name.substring(0, 30)}...`
              : club.name}
          </Text>

          <View style={styles.communityHeader}>
            <Text style={styles.membersCount}>33K Members</Text>

            <View style={styles.communityRight}>
              <TouchableOpacity style={styles.shareButton}>
                <Icon name="share-variant-outline" size={20} color="white" />
              </TouchableOpacity>

              {isAdmin ? (
                <View style={styles.adminActions}>
                  <Button
                    onPress={() =>
                      (navigation as any).navigate("EditClub", { club })
                    }
                    viewStyle={[styles.adminButton, styles.editButton]}
                    smallText={true}
                  >
                    Edit
                  </Button>
                  <Button
                    onPress={() => setShowDeleteAlert(true)}
                    viewStyle={[styles.adminButton, styles.deleteButton]}
                    smallText={true}
                    outline={true}
                  >
                    Delete
                  </Button>
                </View>
              ) : (
                <Button
                  onPress={handleFollowToggle}
                  isLoading={isLoading}
                  outline={isFollowed}
                  viewStyle={styles.joinButton}
                  smallText={true}
                >
                  {isFollowed ? "Joined" : "Join"}
                </Button>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            <Text
              style={styles.communityDescription}
              numberOfLines={isDescriptionExpanded ? undefined : 2}
            >
              {club.about}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs */}
        <Animated.View
          style={[
            styles.tabsContainer,
            {
              opacity: mainTabsOpacity,
              transform: [{ translateY: mainTabsAnimation }],
            },
          ]}
        >
          {renderTabButton("posts", "Posts")}
          {renderTabButton("media", "Media")}
          {renderTabButton("about", "About")}
        </Animated.View>

        {/* Tab Content */}
        {activeTab === "posts" && renderPostsTab()}
        {activeTab === "media" && renderMediaTab()}
        {activeTab === "about" && renderAboutTab()}

        {/* Bottom spacing */}
        <View style={{ height: 300 }} />
      </ScrollView>

      {/* Delete Confirmation Alert */}
      <CampuslyAlert
        isVisible={showDeleteAlert}
        type="error"
        onClose={() => setShowDeleteAlert(false)}
        messages={{
          success: {
            title: "Club Deleted! 🗑️",
            message: "The club has been successfully deleted.",
            icon: "🎉",
          },
          error: {
            title: "Delete Club? 🗑️",
            message:
              "This action cannot be undone. The club and all its content will be permanently deleted! 😱",
            icon: "⚠️",
          },
        }}
        onPress={handleDeleteClub}
        onPress2={() => setShowDeleteAlert(false)}
        buttonText="Yes, delete it"
        buttonText2="Cancel"
        overrideDefault={true}
        isLoading={isDeleting}
        loadingText="Deleting... 🗑️"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  logoBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: LOGO_HEIGHT,
    zIndex: 1,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
    top: 0,
  },
  overlayHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerStripe: {
    width: 40,
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingTop: LOGO_HEIGHT,
  },
  communitySection: {
    padding: 20,
    backgroundColor: `${Colors.PRIMARY}CC`, // Primary color with 80% opacity
    marginBottom: 20,
  },
  communityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  communityLeft: {
    flex: 1,
  },
  communityRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  communityTitle: {
    fontSize: RFValue(32),
    fontWeight: "900",
    color: "white",
    textAlign: "left",
    marginBottom: 20,
    width: "100%",
  },
  membersCount: {
    fontSize: RFValue(14),
    color: "white",
  },
  shareButton: {
    marginRight: 15,
  },
  joinButton: {
    width: RFValue(120),
    height: RFValue(36),
  },
  communityDescription: {
    fontSize: RFValue(16),
    color: "white",
    textAlign: "center",
    lineHeight: RFValue(22),
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stickyTabsContainer: {
    position: "absolute",
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: RFValue(14),
    fontWeight: "600",
  },
  activeTabText: {
    color: Colors.PRIMARY,
  },
  inactiveTabText: {
    color: "#666",
  },
  hashtagsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    marginBottom: 20,
  },
  hashtagContainer: {
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  hashtagText: {
    color: "#666",
    fontSize: RFValue(12),
    fontWeight: "500",
  },
  postsSection: {
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  // New styles for tab content
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    marginBottom: 15,
  },
  hashtagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    fontSize: RFValue(16),
    marginTop: 10,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: RFValue(18),
    fontWeight: "600",
    marginTop: 15,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: RFValue(14),
    marginTop: 8,
    textAlign: "center",
    lineHeight: RFValue(20),
  },
  mediaSection: {
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 10,
  },
  mediaItem: {
    width: (width - 56) / 3,
    height: (width - 56) / 3,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  mediaThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  aboutSection: {
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  aboutCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutTitle: {
    fontSize: RFValue(20),
    fontWeight: "700",
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: RFValue(16),
    marginLeft: 12,
  },
  adminCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  adminTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    marginBottom: 15,
  },
  adminButton: {
    width: "100%",
  },
  adminActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: RFValue(80),
    height: RFValue(36),
  },
  deleteButton: {
    width: RFValue(80),
    height: RFValue(36),
    borderColor: "#FF6B6B",
  },
});
