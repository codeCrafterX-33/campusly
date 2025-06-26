import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useEffect,
} from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
  StatusBar,
  StyleSheet,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import PostCard from "../../components/Post/PostCard";
import { PostContext } from "../../context/PostContext";
import Colors from "../../constants/Colors";
import ClubCard from "../../components/Clubs/ClubCard";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import { useNavigation } from "@react-navigation/native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 56;
const COVER_HEIGHT = 200;

const PULL_THRESHOLD = 80;

interface Tweet {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
}

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { userPosts, getUserPosts } = useContext(PostContext);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const [pullSuggestionText, setPullSuggestionText] = useState("");
  const [isPulling, setIsPulling] = useState(false);
  const [showPullSuggestion, setShowPullSuggestion] = useState(false); // Declare the variable

  const scrollY = useRef(new Animated.Value(0)).current;
  const pullProgress = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const suggestionOpacity = useRef(new Animated.Value(0)).current;
  const suggestionTranslateY = useRef(new Animated.Value(-30)).current;
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasTriggeredHaptic(false);

    // Force hide the pull suggestion immediately when refresh starts
    const status = await getUserPosts();

    if (status === 200) {
      // Trigger success vibration
      Vibration.vibrate(100);
      setTimeout(() => {
        setRefreshing(false);
        showSuccessCheckmark();
      }, 2000);
    } else {
      setRefreshing(false);
    }
  }, []);

  const showSuccessCheckmark = () => {
    setShowCheckmark(true);

    // Animate checkmark appearance
    Animated.parallel([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide checkmark after 2.5 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: 0,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(checkmarkOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowCheckmark(false);
      });
    }, 2500);
  };

  const showPullSuggestionInternal = () => {
    setShowPullSuggestion(true);
    Animated.parallel([
      Animated.timing(suggestionOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(suggestionTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }),
    ]).start();
  };

  const hidePullSuggestion = () => {
    // Clear any existing timeout
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }

    // Set a delay before hiding to prevent flickering
    hideTimeout.current = setTimeout(() => {
      if (showPullSuggestion && !isPulling) {
        Animated.parallel([
          Animated.timing(suggestionOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(suggestionTranslateY, {
            toValue: -20,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
          }),
        ]).start(() => {
          setShowPullSuggestion(false);
        });
      }
    }, 500); // Wait 500ms before hiding
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        if (offsetY < 0 && !refreshing) {
          const distance = Math.abs(offsetY);
          setPullDistance(distance);
          setIsPulling(true);

          // Clear hide timeout when pulling
          if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
          }

          // Update pull progress
          const progress = Math.min(distance / PULL_THRESHOLD, 1);
          pullProgress.setValue(progress);

          // Trigger haptic feedback when crossing threshold
          if (distance >= PULL_THRESHOLD && !hasTriggeredHaptic) {
            Vibration.vibrate(50);
            setHasTriggeredHaptic(true);
          } else if (distance < PULL_THRESHOLD && hasTriggeredHaptic) {
            setHasTriggeredHaptic(false);
          }
        } else {
          setPullDistance(0);
          pullProgress.setValue(0);
          setIsPulling(false);

          // Hide pull suggestion with delay
          hidePullSuggestion();
        }
      },
    }
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT - HEADER_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Pull progress animations
  const pullIndicatorRotation = pullProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pullIndicatorScale = pullProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.1, 1.2],
  });

  const pullTextOpacity = pullProgress.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0, 0.5, 0.8, 1],
  });

  const renderPullIndicator = () => {
    if (pullDistance === 0 || refreshing) return null;

    const isReady = pullDistance >= PULL_THRESHOLD;

    return (
      <Animated.View
        style={[
          styles.pullIndicator,
          {
            opacity: pullTextOpacity,
            transform: [{ translateY: Math.min(pullDistance - 20, 60) }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.pullIcon,
            {
              backgroundColor: isReady ? "#1DA1F2" : "#8B98A5",
              transform: [
                { rotate: pullIndicatorRotation },
                { scale: pullIndicatorScale },
              ],
            },
          ]}
        >
          <Text
            style={[styles.pullIconText, { color: isReady ? "#fff" : "#000" }]}
          >
            {isReady ? "🎉" : "↓"}
          </Text>
        </Animated.View>
        <Text
          style={[styles.pullText, { color: isReady ? "#1DA1F2" : "#8B98A5" }]}
        >
          {isReady ? "Release to refresh!" : "Pull to refresh"}
        </Text>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: pullProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
    );
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {["Posts", "Events", "Clubs", "About"].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Posts":
        return (
          <View style={styles.postsContainer}>
            {userPosts.map((post: any, index: number) => (
              <PostCard post={post} key={index + post.id} />
            ))}
          </View>
        );
      case "Clubs":
        return (
          <View style={styles.eventsContainer}>
            <Text style={styles.sectionTitle}>Club posts</Text>
          </View>
        );
      case "Study":
        return (
          <View style={styles.studyContainer}>
            <Text style={styles.sectionTitle}>
              Study Groups & Academic Posts
            </Text>
            {userPosts
              .filter(
                (p: any) => p.type === "study" || p.type === "achievement"
              )
              .map((post: any) => (
                <PostCard post={post} key={post.id} />
              ))}
          </View>
        );
      case "About":
        return (
          <View style={styles.aboutContainer}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            <View style={styles.academicInfo}>
              <Text style={styles.academicLabel}>
                GPA: <Text style={styles.academicValue}>3.8/4.0</Text>
              </Text>
              <Text style={styles.academicLabel}>
                Credits: <Text style={styles.academicValue}>45/120</Text>
              </Text>
              <Text style={styles.academicLabel}>
                Dean's List: <Text style={styles.academicValue}>Fall 2024</Text>
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Current Courses</Text>
            <View style={styles.coursesContainer}>
              {[
                "CS 101 - Intro to Programming",
                "Math 201 - Calculus II",
                "ENG 102 - Composition",
                "HIST 150 - World History",
              ].map((course, index) => (
                <View key={index} style={styles.courseItem}>
                  <Text style={styles.courseText}>{course}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    getUserPosts();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.PRIMARY} />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerName}>{user?.name}</Text>
          <Text style={styles.headerTweetCount}>1,234 Tweets</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>⋯</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Pull Suggestion in Header - Always render for better performance */}
      {showPullSuggestion && (
        <Animated.View
          style={[
            styles.pullSuggestion,
            {
              opacity: suggestionOpacity,
              transform: [{ translateY: suggestionTranslateY }],
            },
          ]}
        >
          <Text
            style={[
              styles.pullSuggestionText,
              {
                color:
                  pullDistance >= PULL_THRESHOLD
                    ? "#fff"
                    : "rgba(255,255,255,0.9)",
              },
            ]}
          >
            {pullSuggestionText || "Pull down to refresh"}
          </Text>
          {pullDistance >= PULL_THRESHOLD && (
            <Text style={styles.pullSuggestionEmoji}>🎉</Text>
          )}
        </Animated.View>
      )}

      {/* Pull Progress Indicator */}
      {renderPullIndicator()}

      {/* Success Checkmark */}
      {showCheckmark && (
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              opacity: checkmarkOpacity,
              transform: [{ scale: checkmarkScale }],
            },
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
          <Text style={styles.checkmarkLabel}>Updated!</Text>
        </Animated.View>
      )}

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1DA1F2"
            colors={["#1DA1F2"]}
            progressViewOffset={60}
          />
        }
      >
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=200&fit=crop",
            }}
            style={styles.coverPhoto}
          />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <ProfileHeader scrollY={scrollY} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileHandle}>{user?.email}</Text>
            <Text style={styles.profileBio}>
              Accounting at Afe Babalola University 🎓 | Full-stack developer |
              Study group organizer | Coffee enthusiast ☕ | Always down to help
              with coding!
            </Text>
            <View style={styles.profileMeta}>
              <Text style={styles.profileMetaText}>
                🏫 Afe Babalola University
              </Text>
              <Text style={styles.profileMetaText}>
                <Ionicons name="pin" size={16} color={Colors.PRIMARY} />
                Kuvuki Hostel
              </Text>
              <Text style={styles.profileMetaText}>📅 Class of 2020</Text>
              <Text style={styles.profileMetaText}>📅 Joined March 2020</Text>
            </View>
            <View style={styles.profileStats}>
              <TouchableOpacity style={styles.statItem}>
                <Text
                  style={[styles.statNumber, { color: colors.onBackground }]}
                >
                  1,234
                </Text>
                <Text style={styles.statLabel}>Connections</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text
                  style={[styles.statNumber, { color: colors.onBackground }]}
                >
                  5,678
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statItem]}>
                <Text
                  style={[styles.statNumber, { color: colors.onBackground }]}
                >
                  12
                </Text>
                <Text style={styles.statLabel}>Clubs</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        {renderTabBar()}

        {/* Tab content */}
        {renderTabContent()}
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + 44,
    backgroundColor: "#1DA1F2",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerTitle: {
    flex: 1,
    marginLeft: 16,
  },
  headerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTweetCount: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  pullIndicator: {
    position: "absolute",
    top: 140,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  pullIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  pullIconText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pullText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    width: 60,
    height: 3,
    backgroundColor: "rgba(139, 152, 165, 0.3)",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1DA1F2",
    borderRadius: 1.5,
  },
  coverContainer: {
    height: COVER_HEIGHT,
    position: "relative",
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileSection: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
  },

  profileInfo: {
    marginBottom: 16,
  },
  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileHandle: {
    color: "#8B98A5",
    fontSize: 16,
    marginBottom: 12,
  },
  profileBio: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  profileMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  profileMetaText: {
    color: Colors.GRAY,
    fontSize: 14,
    marginRight: 16,
    marginBottom: 4,
  },
  profileStats: {
    flexDirection: "row",
  },
  statItem: {
    flexDirection: "row",
    marginRight: 20,
  },
  statNumber: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 4,
  },
  statLabel: {
    color: "#8B98A5",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#2F3336",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#1DA1F2",
  },
  tabText: {
    color: "#8B98A5",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  tweetsContainer: {
    backgroundColor: "#000",
  },
  tweetContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2F3336",
  },
  tweetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tweetContent: {
    flex: 1,
  },
  tweetHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tweetName: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 4,
  },
  tweetHandle: {
    color: "#8B98A5",
    marginRight: 4,
  },
  tweetTime: {
    color: "#8B98A5",
    marginRight: 4,
  },
  tweetText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  tweetActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 300,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionCount: {
    color: "#8B98A5",
    fontSize: 14,
  },
  checkmarkContainer: {
    position: "absolute",
    top: 130,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1001,
  },
  checkmarkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  checkmarkLabel: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pullSuggestion: {
    position: "absolute",
    top: HEADER_HEIGHT + 44 + 8,
    left: 16,
    right: 16,
    backgroundColor: "rgba(29, 161, 242, 0.95)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  pullSuggestionText: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  pullSuggestionEmoji: {
    fontSize: 16,
    marginLeft: 8,
  },
  noPosts: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noPostsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  aboutContainer: {
    backgroundColor: "#000",
    padding: 16,
  },
  eventsContainer: {
    backgroundColor: "#000",
    padding: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  postsContainer: {
    backgroundColor: "#000",
  },
  studyContainer: {
    backgroundColor: "#000",
    padding: 16,
  },
  academicInfo: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  academicLabel: {
    color: "#8B98A5",
    marginBottom: 8,
  },
  academicValue: {
    color: "#fff",
    fontWeight: "bold",
  },
  coursesContainer: {
    marginTop: 8,
  },
  courseItem: {
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  courseText: {
    color: "#fff",
  },
});

export default Profile;
