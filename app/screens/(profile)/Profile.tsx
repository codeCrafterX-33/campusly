import React, {
  useState,
  useRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
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
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { ActivitySectionMiniScreen } from "../ActivitySectionScreen";
import EducationCard from "../../components/Profile/EducationCard";
import ProfileSkeleton from "../../components/Skeletons/ProfileSkeleton";
import { ClubContext } from "../../context/ClubContext";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HEADER_HEIGHT = 56;
const COVER_HEIGHT = 200;

const PULL_THRESHOLD = 80;

const Profile = ({ navigation, route }: { navigation: any; route: any }) => {
  const { userData, education, getUserById, getCachedUser } =
    useContext(AuthContext);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userPosts, getUserPosts, viewingUserPosts, setViewingUserPosts } =
    useContext(PostContext);
  const { colors } = useTheme();
  const {
    followedClubs,
    getFollowedClubs,
    userCreatedClubs,
    getUserCreatedClubs,
  } = useContext(ClubContext);
  const { showSuccessCheckmark, checkmark } = useCheckAnimation();
  const [skills, setSkills] = useState<string[]>(userData?.skills);
  const [interests, setInterests] = useState<string[]>(userData?.interests);
  const { user_id } = route.params || {};
  console.log("Profile - Route params:", route.params);
  console.log("Profile - Extracted user_id:", user_id, "Type:", typeof user_id);

  const [viewingUserData, setViewingUserData] = useState<any>(null);
  const [viewingUserEducation, setViewingUserEducation] = useState<any[]>([]);

  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isLoadingEducation, setIsLoadingEducation] = useState(false);
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

  // Determine which user data to display
  const displayUserData = user_id ? viewingUserData : userData;
  const displayEducation = user_id ? viewingUserEducation : education;
  const isViewingOtherUser = !!user_id;
  const displayUserPosts = user_id ? viewingUserPosts : userPosts;

  // Calculate media count from posts
  const mediaCount = useMemo(() => {
    let count = 0;
    displayUserPosts.forEach((post: any) => {
      if (post?.media && Array.isArray(post.media.media)) {
        count += post.media.media.length;
        console.log(
          "Profile - Post",
          post.id,
          "has",
          post.media.media.length,
          "media items"
        );
      }
    });
    console.log("Profile - Total media count calculated:", count);
    return count;
  }, [displayUserPosts]);

  console.log(
    "Profile - Posts count:",
    displayUserPosts.length,
    "Media count:",
    mediaCount
  );

  const getPlaceholder = (value: string | undefined, placeholder: string) => ({
    text: value?.trim() || placeholder,
    style: {
      color: value?.trim() ? colors.onBackground : colors.onSurfaceVariant,
      fontStyle: (value?.trim() ? "normal" : "italic") as "normal" | "italic",
      opacity: value?.trim() ? 1 : 0.7,
    },
  });

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

  // Calculate username position: cover height + profile image overlap + padding + margins + name area
  const USERNAME_POSITION = COVER_HEIGHT + 40 + 16 + 16 + 25; // ~297px

  const headerOpacity = scrollY.interpolate({
    inputRange: [USERNAME_POSITION - 50, USERNAME_POSITION + 50],
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
    setSkills(displayUserData?.skills || []);
    setInterests(displayUserData?.interests || []);
  }, [displayUserData]);

  // Fetch viewing user data if user_id is provided
  useEffect(() => {
    const fetchViewingUserData = async () => {
      if (user_id) {
        // Check cache first for immediate display
        const cachedUser = getCachedUser(user_id);
        console.log(
          "Profile - Checking cache for user_id:",
          user_id,
          "Cached:",
          !!cachedUser
        );

        if (cachedUser) {
          console.log(
            "Profile - Using cached complete user data for immediate display"
          );
          console.log("Profile - Cached user education:", cachedUser.education);
          console.log("Profile - Cached user school:", cachedUser.school);
          console.log("Profile - Cached user headline:", cachedUser.headline);
          console.log("Profile - Cached user about:", cachedUser.about);
          console.log(
            "Profile - Full cached user data:",
            JSON.stringify(cachedUser, null, 2)
          );

          setViewingUserData(cachedUser);
          // Also set education separately for consistency
          if (cachedUser.education && Array.isArray(cachedUser.education)) {
            console.log(
              "Profile - Setting cached education data:",
              cachedUser.education
            );
            setViewingUserEducation(cachedUser.education);
            console.log(
              "Profile - Education state updated with cached data:",
              cachedUser.education
            );
          } else {
            console.log(
              "Profile - No education data in cache, fetching fresh education data"
            );
            // If no education in cache, fetch it fresh
            setIsLoadingEducation(true);
            try {
              const educationResponse = await axios.get(
                `${process.env.EXPO_PUBLIC_SERVER_URL}/education/${cachedUser.email}`
              );
              const educationData = educationResponse.data.data || [];
              console.log(
                "Profile - Fetched fresh education data:",
                educationData
              );
              setViewingUserEducation(educationData);
              console.log(
                "Profile - Education state updated with fresh data:",
                educationData
              );
            } catch (educationError) {
              console.warn(
                "Profile - Failed to fetch fresh education data:",
                educationError
              );
              setViewingUserEducation([]);
            } finally {
              setIsLoadingEducation(false);
            }
          }

          // Fetch user posts for the viewing user (cached path)
          try {
            console.log(
              "Profile - About to call getUserPosts with user_id (cached):",
              user_id,
              "Type:",
              typeof user_id
            );
            if (user_id) {
              const result = await getUserPosts(user_id);
              console.log("Profile - getUserPosts result (cached):", result);
              console.log(
                "Profile - viewingUserPosts after fetch (cached):",
                viewingUserPosts
              );
            } else {
              console.warn(
                "Profile - user_id is undefined in cached path, skipping getUserPosts call"
              );
            }
          } catch (postsError) {
            console.warn(
              "Failed to fetch viewing user posts (cached):",
              postsError
            );
          }

          setIsLoading(false);
          setShowSkeleton(false);
          return; // Don't fetch again if we have complete cached data
        }

        console.log(
          "No cached data, showing skeleton and fetching in background"
        );
        setShowSkeleton(true);
        setIsLoading(false); // Don't show the old loading state
        setIsLoadingEducation(true); // Set loading state immediately for education

        // Show basic info immediately from post data if available (for smooth transition)
        const basicUserData = {
          id: user_id,
          firstname: route.params?.firstname || "",
          lastname: route.params?.lastname || "",
          username: route.params?.username || "",
          image: route.params?.image || "https://via.placeholder.com/50",
          studentstatusverified: route.params?.studentstatusverified || false,
          headline: route.params?.headline || "",
          about: route.params?.about || "",
          school: route.params?.school || "",
          city: route.params?.city || "",
          country: route.params?.country || "",
          joined_at: route.params?.joined_at || "",
          skills: route.params?.skills || [],
          interests: route.params?.interests || [],
        };
        setViewingUserData(basicUserData);

        // Fetch complete data in background
        try {
          setIsRefreshingData(true);
          const userData = await getUserById(user_id);

          // Smooth transition: Replace skeleton with real data
          setViewingUserData(userData);
          setShowSkeleton(false);

          // Fetch user posts for the viewing user (background fetch path)
          try {
            console.log(
              "Profile - About to call getUserPosts with user_id (background):",
              user_id,
              "Type:",
              typeof user_id
            );
            if (user_id) {
              const result = await getUserPosts(user_id);
              console.log(
                "Profile - getUserPosts result (background):",
                result
              );
              console.log(
                "Profile - viewingUserPosts after fetch (background):",
                viewingUserPosts
              );
            } else {
              console.warn(
                "Profile - user_id is undefined in background path, skipping getUserPosts call"
              );
            }
          } catch (postsError) {
            console.warn(
              "Failed to fetch viewing user posts (background):",
              postsError
            );
          }

          // Fetch education data for the viewing user
          setIsLoadingEducation(true);
          try {
            const educationResponse = await axios.get(
              `${process.env.EXPO_PUBLIC_SERVER_URL}/education/${userData.email}`
            );
            setViewingUserEducation(educationResponse.data.data || []);
            console.log(
              "Profile - Education state updated with background fetch:",
              educationResponse.data.data || []
            );
          } catch (educationError) {
            console.warn(
              "Failed to fetch viewing user education data:",
              educationError
            );
            setViewingUserEducation([]);
          } finally {
            setIsLoadingEducation(false);
          }
        } catch (error) {
          console.error("Failed to fetch viewing user data:", error);
          setShowSkeleton(false); // Hide skeleton on error
        } finally {
          setIsRefreshingData(false);
        }
      } else {
        setIsLoading(false);
        setShowSkeleton(false);
      }
    };

    fetchViewingUserData();
  }, [user_id]);

  useEffect(() => {
    getUserPosts();
    getFollowedClubs();
    getUserCreatedClubs();
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  // Show loading skeleton only if no cached data and no basic data yet
  if (showSkeleton && user_id && !displayUserData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.PRIMARY} />
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerName}>@{displayUserData?.username}</Text>
          <Text style={styles.headerPostCount}>
            {displayUserPosts.length} posts
            {isRefreshingData && " • Updating..."}
          </Text>
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
        style={[styles.scrollView, { backgroundColor: colors.background }]}
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
            <Ionicons name="arrow-back" size={RFValue(24)} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View
          style={[
            styles.profileSection,
            { backgroundColor: colors.background },
          ]}
        >
          <ProfileHeader
            user_id={displayUserData?.email}
            scrollY={scrollY}
            userimage={displayUserData?.image}
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text
                style={[styles.profileName, { color: colors.onBackground }]}
              >
                {displayUserData?.firstname}
                {displayUserData?.lastname}
              </Text>
              {displayUserData?.studentstatusverified && (
                <Ionicons
                  name="checkmark-circle"
                  size={RFValue(20)}
                  color={Colors.PRIMARY}
                  style={styles.verificationCheckmark}
                />
              )}
            </View>
            <Text style={[styles.profileHandle]}>
              {" "}
              @{displayUserData?.username}
            </Text>

            {/* {bio} */}
            {(() => {
              const bio = getPlaceholder(
                displayUserData?.headline,
                "Mysterious stranger with no bio. Very suspicious 🤔"
              );
              return (
                <Text style={[styles.profileBio, bio.style]}>{bio.text}</Text>
              );
            })()}

            <View style={styles.profileMeta}>
              {/* School */}
              {(() => {
                const school = getPlaceholder(
                  displayUserData?.school,
                  "A mystery school… yet to be revealed 🕵️‍♂️"
                );
                return (
                  <Text
                    style={[styles.profileMetaText, { color: Colors.GRAY }]}
                  >
                    <Ionicons
                      name="school"
                      size={RFValue(16)}
                      color={Colors.PRIMARY}
                    />{" "}
                    {school.text}
                  </Text>
                );
              })()}

              {/* Degree and Field of Study */}
              {(() => {
                // Get education data from context
                const educationData =
                  displayEducation &&
                  Array.isArray(displayEducation) &&
                  displayEducation.length > 0
                    ? displayEducation.find((edu: any) => {
                        // Handle both string and object school formats
                        const schoolName =
                          typeof edu.school === "string"
                            ? edu.school
                            : edu.school?.name;

                        return schoolName === displayUserData?.school;
                      }) || displayEducation[0] // Fallback to first education if no match
                    : null;

                // Show loading only if we're actively fetching education data
                if (isLoadingEducation) {
                  return (
                    <View style={styles.educationLoadingContainer}>
                      <ActivityIndicator size="small" color={Colors.PRIMARY} />
                      <Text
                        style={[
                          styles.profileMetaText,
                          { color: colors.onSurfaceVariant, marginLeft: 8 },
                        ]}
                      >
                        Loading degree...
                      </Text>
                    </View>
                  );
                }

                if (!educationData) {
                  return (
                    <Text
                      style={[
                        styles.profileMetaText,
                        { color: colors.onSurfaceVariant, fontStyle: "italic" },
                      ]}
                    >
                      <Ionicons
                        name="school-outline"
                        size={16}
                        color={Colors.PRIMARY}
                      />{" "}
                      No degree info yet 🎓
                    </Text>
                  );
                }

                // Parse school data safely
                let schoolName = "";
                try {
                  if (typeof educationData.school === "string") {
                    const parsed = JSON.parse(educationData.school);
                    schoolName = parsed.name || "";
                  } else if (
                    educationData.school &&
                    typeof educationData.school === "object"
                  ) {
                    schoolName = educationData.school.name || "";
                  }
                } catch (error) {
                  console.warn("Error parsing school data:", error);
                }

                const degree = educationData.degree || "";
                const fieldOfStudy = educationData.field_of_study || "";

                let degreeText = "";
                if (degree && fieldOfStudy) {
                  const degreeAbbr = degree.toLowerCase().includes("bachelor")
                    ? "BSc"
                    : degree.toLowerCase().includes("master")
                    ? "MSc"
                    : degree.toLowerCase().includes("phd")
                    ? "PhD"
                    : degree.toLowerCase().includes("associate")
                    ? "AAS"
                    : degree.toLowerCase().includes("diploma")
                    ? "Dip"
                    : degree.toLowerCase().includes("certificate")
                    ? "Cert."
                    : degree;

                  degreeText = `${degreeAbbr} in ${fieldOfStudy}`;
                } else if (degree) {
                  degreeText = degree;
                } else if (fieldOfStudy) {
                  degreeText = fieldOfStudy;
                }

                return (
                  <Text
                    style={[styles.profileMetaText, { color: Colors.GRAY }]}
                  >
                    <Ionicons
                      name="school-outline"
                      size={16}
                      color={Colors.PRIMARY}
                    />{" "}
                    {degreeText}
                  </Text>
                );
              })()}

              {/* Location */}
              {(() => {
                // Properly handle null/undefined values for location
                const city = displayUserData?.city?.trim();
                const country = displayUserData?.country?.trim();
                const locationString =
                  city && country
                    ? `${city}, ${country}`
                    : city || country || undefined;

                const location = getPlaceholder(
                  locationString,
                  "Top Secret Academy 🕵️‍♂️"
                );
                return (
                  <Text
                    style={[styles.profileMetaText, { color: Colors.GRAY }]}
                  >
                    <Ionicons
                      name="location"
                      size={16}
                      color={Colors.PRIMARY}
                    />{" "}
                    {location.text}
                  </Text>
                );
              })()}

              {/* Joined App */}
              {(() => {
                const joined = getPlaceholder(
                  displayUserData?.joined_at
                    ? new Date(displayUserData.joined_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                        }
                      )
                    : undefined,
                  "Joined… who knows when? 🕰️"
                );
                return (
                  <Text
                    style={[styles.profileMetaText, { color: Colors.GRAY }]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={Colors.PRIMARY}
                    />{" "}
                    {`Joined ${joined.text}`}
                  </Text>
                );
              })()}
            </View>
            <View style={styles.profileStats}>
              <TouchableOpacity style={styles.statItem}>
                <Text
                  style={[styles.statNumber, { color: colors.onBackground }]}
                >
                  {displayUserPosts.length}
                </Text>
                <Text style={styles.statLabel}>Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text
                  style={[styles.statNumber, { color: colors.onBackground }]}
                >
                  {mediaCount}
                </Text>
                <Text style={styles.statLabel}>Media</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text
                  style={[styles.statNumber, { color: colors.onBackground }]}
                >
                  {displayUserData?.connections?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text
                  style={[styles.statNumber, { color: colors.onBackground }]}
                >
                  {displayUserData?.following?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
              {!user_id && (
                <TouchableOpacity style={[styles.statItem]}>
                  <Text
                    style={[styles.statNumber, { color: colors.onBackground }]}
                  >
                    {followedClubs?.length + userCreatedClubs?.length}
                  </Text>
                  <Text style={styles.statLabel}>Clubs</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* About Section     */}
          <View
            style={[
              styles.aboutSection,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={[styles.aboutHeader]}>
              <Text style={[styles.aboutTitle, { color: colors.onBackground }]}>
                About
              </Text>
              {!isViewingOtherUser && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("EditProfile", {
                      userEmail: displayUserData?.email,
                      sectionToEdit: "about",
                    })
                  }
                >
                  <Ionicons
                    name="pencil-outline"
                    size={RFValue(16)}
                    color={Colors.PRIMARY}
                  />
                </TouchableOpacity>
              )}
            </View>

            {(() => {
              const placeholderAbout = `Mysterious student wandering Campusly’s halls… 👀  
Rumor has it they code apps, chase deadlines, and survive on coffee.  
May or may not have a secret talent for finding the best study spots on campus. 🕵️‍♂️  
Friend requests welcome, but beware… they might already have 3 group projects pending. 😏`;

              const aboutData =
                displayUserData?.about?.trim() || placeholderAbout;
              const isPlaceholder = !displayUserData?.about?.trim();

              return (
                <>
                  <Text
                    style={[
                      styles.aboutText,
                      {
                        color: isPlaceholder
                          ? colors.onSurfaceVariant
                          : colors.onBackground,
                        fontStyle: isPlaceholder ? "italic" : "normal",
                      },
                    ]}
                    numberOfLines={aboutExpanded ? undefined : 3}
                    onTextLayout={(e) => {
                      const { lines } = e.nativeEvent;
                      if (lines.length > 3) {
                        setShowReadMore(true);
                      } else {
                        setShowReadMore(false);
                      }
                    }}
                  >
                    {aboutData}
                  </Text>

                  {/* Toggle button */}
                  {showReadMore && (
                    <TouchableOpacity
                      onPress={() => setAboutExpanded(!aboutExpanded)}
                    >
                      <Text style={styles.readMoreText}>
                        {aboutExpanded ? "Show less" : "Read more"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              );
            })()}
          </View>

          {/* {Activity Section} */}
          <View
            style={[
              styles.activitySection,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.activityHeader}>
              <Text
                style={[styles.activityTitle, { color: colors.onBackground }]}
              >
                Activity
              </Text>
              <View style={styles.activityHeaderRight}>
                {!isViewingOtherUser && (
                  <TouchableOpacity
                    style={styles.activityButton}
                    onPress={() => {
                      navigation.navigate("AddPost");
                    }}
                  >
                    <Text style={styles.activityButtonText}>Create a post</Text>
                  </TouchableOpacity>
                )}
                {!isViewingOtherUser && (
                  <TouchableOpacity>
                    <Ionicons
                      name="pencil-outline"
                      size={RFValue(16)}
                      color={Colors.PRIMARY}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <ActivitySectionMiniScreen user_id={user_id} />
          </View>

          {/* Education Section */}
          <View
            style={[
              styles.educationSection,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.educationHeader}>
              <Text
                style={[styles.sectionTitle, { color: colors.onBackground }]}
              >
                Education
              </Text>
              {!isViewingOtherUser && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("EditEducation", {
                      userEmail: displayUserData?.email,
                    })
                  }
                >
                  <Ionicons
                    name="pencil-outline"
                    size={RFValue(16)}
                    color={Colors.PRIMARY}
                  />
                </TouchableOpacity>
              )}
            </View>
            {Array.isArray(displayEducation) && displayEducation.length > 0 ? (
              displayEducation.map((edu: any, index: number) => (
                <EducationCard key={index} education={edu} />
              ))
            ) : (
              <Text
                style={[styles.eduItem, { color: colors.onSurfaceVariant }]}
              >
                No education details added. Click the pencil icon to add.
              </Text>
            )}
          </View>

          {/* Skills & Interests Section */}
          <View style={styles.skillsSection}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: RFValue(16),
              }}
            >
              <Text
                style={[styles.skillsTitle, { color: colors.onBackground }]}
              >
                Skills & Interests
              </Text>
              {!isViewingOtherUser && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("EditProfile", {
                      userEmail: displayUserData?.email,
                      sectionToEdit: "skills",
                    })
                  }
                >
                  <Ionicons
                    name="pencil-outline"
                    size={RFValue(16)}
                    color={Colors.PRIMARY}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Skills Subsection */}
            <View style={styles.subsection}>
              <Text
                style={[styles.subsectionTitle, { color: colors.onBackground }]}
              >
                Skills ({(skills || []).length}/5)
              </Text>
              <View style={styles.skillsWrapper}>
                {(skills || []).length <= 0 && (
                  <Text
                    style={[
                      styles.skillText,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    No skills added yet… what are you waiting for? 🚀
                  </Text>
                )}
                {(skills || []).map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>#{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Interests Subsection */}
            <View style={styles.subsection}>
              <Text
                style={[styles.subsectionTitle, { color: colors.onBackground }]}
              >
                Interests ({(interests || []).length}/5)
              </Text>
              <View style={styles.interestsWrapper}>
                {(interests || []).length <= 0 && (
                  <Text
                    style={[
                      styles.interestText,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    No interests added yet… are you secretly a robot? 🤖
                  </Text>
                )}
                {(interests || []).map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>#{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
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
  headerPostCount: {
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
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  verificationCheckmark: {
    marginLeft: RFValue(8),
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
  educationLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  aboutSection: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
  },
  aboutTitle: {
    color: "#fff",
    fontSize: RFValue(22),
    fontWeight: "bold",
    marginBottom: 24,
  },
  aboutText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  readMoreText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 14,
    marginTop: -8,
    marginBottom: 12,
  },
  skillsSection: {
    marginTop: 25,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  skillsTitle: {
    color: "#fff",
    fontSize: RFValue(22),
    fontWeight: "bold",
    marginBottom: 8,
  },
  skillsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillTag: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: "#fff",
    fontSize: 14,
  },
  interestsSection: {
    marginTop: 25,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  interestsTitle: {
    color: "#fff",
    fontSize: RFValue(22),
    fontWeight: "bold",
    marginBottom: 8,
  },
  interestsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: "#fff",
    fontSize: 14,
  },
  subsection: {
    marginBottom: RFValue(20),
  },
  subsectionTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    marginBottom: RFValue(8),
  },

  skillInput: {
    flex: 1,
    backgroundColor: "#1c1c1e",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  activitySection: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    marginTop: hp(3),
  },
  activityTitle: {
    color: "#fff",
    fontSize: RFValue(22),
    fontWeight: "bold",
    marginBottom: 24,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
  },
  activityButtonText: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: "#fff",
  },
  activityHeaderRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  educationSection: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    marginTop: hp(3),
  },

  educationHeader: { flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: {
    fontSize: RFValue(22),
    fontWeight: "bold",
    marginBottom: 12,
  },
  eduItem: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },

  aboutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
});

export default Profile;
