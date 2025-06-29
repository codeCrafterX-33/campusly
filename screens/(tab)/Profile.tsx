import React, {
  useState,
  useRef,
  useCallback,
  useContext,
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
import Toast from "react-native-toast-message";
import { useCheckAnimation } from "../../util/showSuccessCheckmark";
import PullToRefreshIndicator from "../../components/Profile/PullToRefreshIndicator";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HEADER_HEIGHT = 56;
const COVER_HEIGHT = 200;

const PULL_THRESHOLD = 80;

const Profile = () => {
  const { user } = useContext(AuthContext);
  const { userPosts, getUserPosts } = useContext(PostContext);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { showSuccessCheckmark, checkmark } = useCheckAnimation();

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

  const suggestionOpacity = useRef(new Animated.Value(0)).current;
  const suggestionTranslateY = useRef(new Animated.Value(-30)).current;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasTriggeredHaptic(false);

    try {
      const status = await getUserPosts();

      if (status === 200) {
        // Trigger success vibration
        Vibration.vibrate(100);
        setTimeout(() => {
          setRefreshing(false);
          showSuccessCheckmark(setShowCheckmark);
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        text1: "Couldn't refresh profile",
        text2: "Please check your internet or try again later.",
        type: "error",
        position: "bottom",
      });
      setRefreshing(false);
    }
  }, []);

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
          <Text style={styles.headerTweetCount}>{userPosts.length} posts</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>⋯</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Pull Progress Indicator */}
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        pullProgress={pullProgress}
        refreshing={refreshing}
        threshold={PULL_THRESHOLD}
      />

      {/* Success Checkmark */}
      {showCheckmark && checkmark()}

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.PRIMARY}
            colors={[Colors.PRIMARY]}
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
          <ProfileHeader user_id={user?.email} scrollY={scrollY} />
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
    backgroundColor: Colors.PRIMARY,
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
    backgroundColor: Colors.PRIMARY,
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
 
});

export default Profile;
