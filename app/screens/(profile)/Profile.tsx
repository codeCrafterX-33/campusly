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
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
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
import { RFValue } from "react-native-responsive-fontsize";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { ActivitySectionMiniScreen } from "../ActivitySectionScreen";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HEADER_HEIGHT = 56;
const COVER_HEIGHT = 200;

const PULL_THRESHOLD = 80;

const Profile = ({ navigation }: { navigation: any }) => {
  const { userData } = useContext(AuthContext);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userPosts, getUserPosts } = useContext(PostContext);
  const { colors } = useTheme();
  const { showSuccessCheckmark, checkmark } = useCheckAnimation();
  const [skills, setSkills] = useState<string[]>([
    "React Native",
    "Photography",
    "Web Development",
    "UI/UX Design",
    "Node.js",
    "Express",
    "MongoDB",
    "React",
  ]);
  const [newSkill, setNewSkill] = useState("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);

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
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  // if (isLoading) {
  //   return (
  //     <View style={styles.container}>
  //       <ProfileSkeleton />
  //     </View>
  //   );
  // }

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
          <Text style={styles.headerName}>{userData?.name}</Text>
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
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View
          style={[
            styles.profileSection,
            { backgroundColor: colors.background },
          ]}
        >
          <ProfileHeader user_id={userData?.email} scrollY={scrollY} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.onBackground }]}>
              {userData?.name}
            </Text>
            <Text style={[styles.profileHandle]}>{userData?.email}</Text>

            {/* {bio} */}
            {(() => {
              const bio = getPlaceholder(
                userData?.bio,
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
                  userData?.school,
                  "A mystery school… yet to be revealed 🕵️‍♂️"
                );
                return (
                  <Text style={[styles.profileMetaText, school.style]}>
                    <Ionicons name="school" size={16} color={Colors.PRIMARY} />
                    {school.text}
                  </Text>
                );
              })()}

              {/* Location */}
              {(() => {
                const location = getPlaceholder(
                  userData?.location,
                  "Top Secret Academy 🕵️‍♂️"
                );
                return (
                  <Text style={[styles.profileMetaText, location.style]}>
                    <Ionicons
                      name="location"
                      size={16}
                      color={Colors.PRIMARY}
                    />
                    {location.text}
                  </Text>
                );
              })()}

              {/* Admission Year */}
              {(() => {
                const admission = getPlaceholder(
                  userData?.admissionyear,
                  "Class of ??? 🤷‍♂️"
                );
                return (
                  <Text style={[styles.profileMetaText, admission.style]}>
                    <Ionicons
                      name="calendar"
                      size={16}
                      color={Colors.PRIMARY}
                    />
                    {admission.text}
                  </Text>
                );
              })()}

              {/* Joined App */}
              {(() => {
                const joined = getPlaceholder(
                  userData?.joined_at
                    ? new Date(userData.joined_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })
                    : undefined,
                  "Joined… who knows when? 🕰️"
                );
                return (
                  <Text style={[styles.profileMetaText, joined.style]}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={Colors.PRIMARY}
                    />
                    {joined.text}
                  </Text>
                );
              })()}
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
              <TouchableOpacity
                onPress={() => navigation.navigate("EditProfile")}
              >
                <Ionicons
                  name="pencil-outline"
                  size={RFValue(16)}
                  color={Colors.PRIMARY}
                />
              </TouchableOpacity>
            </View>

            {(() => {
              const placeholderAbout = `Mysterious student wandering Campusly’s halls… 👀  
Rumor has it they code apps, chase deadlines, and survive on coffee.  
May or may not have a secret talent for finding the best study spots on campus. 🕵️‍♂️  
Friend requests welcome, but beware… they might already have 3 group projects pending. 😏`;

              const aboutData = userData?.about?.trim() || placeholderAbout;
              const isPlaceholder = !userData?.about?.trim();

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
                      if (lines.length > 3 && !showReadMore) {
                        setShowReadMore(true);
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
                <TouchableOpacity
                  style={styles.activityButton}
                  onPress={() => {
                    navigation.navigate("AddPost");
                  }}
                >
                  <Text style={styles.activityButtonText}>Create a post</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons
                    name="pencil-outline"
                    size={RFValue(16)}
                    color={Colors.PRIMARY}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <ActivitySectionMiniScreen />
          </View>

          {/* Education Section */}
          <View
            style={[
              styles.educationSection,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
              Education
            </Text>
            <Text style={[styles.eduItem, { color: colors.onBackground }]}>
              B.Sc Accounting — Afe Babalola University, 2020
            </Text>
            {/* Add more schools or courses */}
          </View>

          {/* Skills & Interests Section */}
          <View style={styles.skillsSection}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={[styles.skillsTitle, { color: colors.onBackground }]}
              >
                Skills & Interests
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditingSkills(!isEditingSkills)}
              >
                <Text style={{ color: Colors.PRIMARY }}>
                  {isEditingSkills ? (
                    "Done"
                  ) : (
                    <Ionicons
                      name="pencil-outline"
                      size={24}
                      color={Colors.PRIMARY}
                    />
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.skillsWrapper}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>#{skill}</Text>
                  {isEditingSkills && (
                    <TouchableOpacity
                      onPress={() =>
                        setSkills((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color="#fff"
                        style={{ marginLeft: 6 }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>

          {isEditingSkills && (
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              <TextInput
                placeholder="Add a skill..."
                value={newSkill}
                onChangeText={(text) => setNewSkill(text)}
                placeholderTextColor="#aaa"
                style={styles.skillInput}
                onSubmitEditing={() => {}}
              />
              <TouchableOpacity
                onPress={() => {
                  if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                    setSkills([...skills, newSkill.trim()]);
                    setNewSkill("");
                  }
                }}
              >
                <Ionicons name="add-circle" size={28} color={Colors.PRIMARY} />
              </TouchableOpacity>
            </View>
          )}
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
  aboutSection: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
  },
  aboutTitle: {
    color: "#fff",
    fontSize: 22,
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
    fontSize: 22,
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
  },
  activityButtonText: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.PRIMARY,
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
  sectionTitle: {
    fontSize: 22,
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
