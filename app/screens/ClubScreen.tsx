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
import Button from "../components/ui/Button";
import { useThemeContext } from "../context/ThemeContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";

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

  const { club } = route.params as { club: any };

  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [isFollowed, setIsFollowed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
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

      // Check if user is admin of this club
      const admin = userData?.email === club.createdby;
      setIsAdmin(admin);
    };

    checkUserStatus();
  }, [followedClubs, club.id, userData?.email, club.createdby]);

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

  const renderPost = (post: any, index: number) => (
    <View key={index} style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: post.avatar || "https://via.placeholder.com/40" }}
          style={styles.postAvatar}
        />
        <View style={styles.postInfo}>
          <Text style={[styles.postAuthor, { color: colors.onBackground }]}>
            {post.author}
          </Text>
          <Text style={[styles.postHandle, { color: colors.onSurfaceVariant }]}>
            @{post.handle}
          </Text>
          <Text style={[styles.postTime, { color: colors.onSurfaceVariant }]}>
            {post.time}
          </Text>
        </View>
        {post.isPinned && <Icon name="pin" size={16} color={Colors.PRIMARY} />}
      </View>

      <Text style={[styles.postContent, { color: colors.onBackground }]}>
        {post.content}
      </Text>

      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Icon
            name="comment-outline"
            size={16}
            color={colors.onSurfaceVariant}
          />
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
            {post.replies}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="repeat" size={16} color={colors.onSurfaceVariant} />
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
            {post.reposts}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon
            name="heart-outline"
            size={16}
            color={colors.onSurfaceVariant}
          />
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
            {post.likes}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon
            name="share-variant-outline"
            size={16}
            color={colors.onSurfaceVariant}
          />
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>
            {post.impressions}
          </Text>
        </View>
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

  const mockPosts = [
    {
      author: "Naija",
      handle: "Naija_PR",
      time: "23 Mar 24",
      content: "Join the Naija community",
      replies: 78,
      reposts: 31,
      likes: 403,
      impressions: "116K",
      isPinned: true,
      avatar: "https://via.placeholder.com/40",
    },
    {
      author: "Goke",
      handle: "gokehqs",
      time: "5h ago",
      content: "Overthinking postponed, nepa don bring light",
      replies: 39,
      reposts: 91,
      likes: 132,
      impressions: "3K",
      isPinned: false,
      avatar: "https://via.placeholder.com/40",
    },
    {
      author: "Goke",
      handle: "gokehqs",
      time: "17h ago",
      content: "'Calm and reserved' but you schooled in a polytechnic",
      replies: 34,
      reposts: 76,
      likes: 132,
      impressions: "6.5K",
      isPinned: false,
      avatar: "https://via.placeholder.com/40",
    },
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
                <Button
                  onPress={() =>
                    (navigation as any).navigate("EditClub", { club })
                  }
                  viewStyle={styles.joinButton}
                  smallText={true}
                >
                  Edit Club
                </Button>
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

        {/* Trending Hashtags */}
        <View style={styles.hashtagsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingHashtags.map(renderHashtag)}
          </ScrollView>
        </View>

        {/* Posts Feed */}
        <View style={styles.postsSection}>
          {mockPosts.map((post, index) => renderPost(post, index))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 300 }} />
      </ScrollView>
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
  postContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: RFValue(14),
    fontWeight: "600",
  },
  postHandle: {
    fontSize: RFValue(12),
  },
  postTime: {
    fontSize: RFValue(12),
  },
  postContent: {
    fontSize: RFValue(16),
    lineHeight: RFValue(22),
    marginBottom: 15,
  },
  postStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: RFValue(12),
    marginLeft: 4,
  },
});
