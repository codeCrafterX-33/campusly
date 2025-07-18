import React, { useState, useRef } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 56;
const COVER_HEIGHT = 200;
const PROFILE_IMAGE_SIZE = 80;

interface Post {
  id: string;
  type: "post" | "event" | "study" | "achievement";
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  eventDate?: string;
  location?: string;
  course?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: "academic" | "social" | "sports" | "club";
}

const StudentProfile = () => {
  const [showRefreshControl, setShowRefreshControl] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleScrollBeginDrag = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y <= 0) {
      setShowRefreshControl(true);
    }
  };

  const handleScrollEndDrag = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y > 0) {
      setShowRefreshControl(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setShowRefreshControl(false);
    }, 2000);
  };

  const posts: Post[] = [
    {
      id: "1",
      type: "event",
      content:
        "Hosting a study group for CS 101 midterm prep! Join us in the library. Bring your notes and questions! 📚",
      timestamp: "2h",
      likes: 24,
      comments: 8,
      shares: 3,
      eventDate: "Tomorrow 3:00 PM",
      location: "Main Library - Room 204",
      course: "CS 101",
    },
    {
      id: "2",
      type: "achievement",
      content:
        "Just got accepted into the Dean's List for Fall 2024! Hard work pays off! 🎉",
      timestamp: "4h",
      likes: 156,
      comments: 32,
      shares: 12,
    },
    {
      id: "3",
      type: "study",
      content:
        "Anyone else struggling with calculus derivatives? Looking for a study buddy for Math 201 📐",
      timestamp: "1d",
      likes: 89,
      comments: 15,
      shares: 7,
      course: "Math 201",
    },
    {
      id: "4",
      type: "post",
      content:
        "Campus food truck festival was amazing today! The Korean BBQ truck was 🔥 Definitely coming back tomorrow!",
      timestamp: "2d",
      likes: 203,
      comments: 45,
      shares: 18,
      location: "Student Union Plaza",
    },
  ];

  const upcomingEvents: Event[] = [
    {
      id: "1",
      title: "CS 101 Study Group",
      date: "Tomorrow",
      time: "3:00 PM",
      location: "Library Room 204",
      attendees: 12,
      category: "academic",
    },
    {
      id: "2",
      title: "Campus Movie Night",
      date: "Friday",
      time: "7:00 PM",
      location: "Student Center",
      attendees: 45,
      category: "social",
    },
    {
      id: "3",
      title: "Basketball Game",
      date: "Saturday",
      time: "2:00 PM",
      location: "Sports Complex",
      attendees: 234,
      category: "sports",
    },
  ];

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT - HEADER_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const profileImageScale = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const profileImageTranslateY = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT],
    outputRange: [0, -20],
    extrapolate: "clamp",
  });

  const getPostIcon = (type: string) => {
    switch (type) {
      case "event":
        return "📅";
      case "study":
        return "📚";
      case "achievement":
        return "🏆";
      default:
        return "💭";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "#4F46E5";
      case "social":
        return "#EC4899";
      case "sports":
        return "#10B981";
      case "club":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postContainer}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        }}
        style={styles.postAvatar}
      />
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <Text style={styles.postName}>Alex Johnson</Text>
          <Text style={styles.postHandle}>@alexj_cs</Text>
          <Text style={styles.postTime}>·</Text>
          <Text style={styles.postTime}>{post.timestamp}</Text>
          <Text style={styles.postTypeIcon}>{getPostIcon(post.type)}</Text>
        </View>

        {post.course && (
          <View style={styles.courseTag}>
            <Text style={styles.courseTagText}>{post.course}</Text>
          </View>
        )}

        <Text style={styles.postText}>{post.content}</Text>

        {post.eventDate && (
          <View style={styles.eventInfo}>
            <Text style={styles.eventDate}>📅 {post.eventDate}</Text>
            {post.location && (
              <Text style={styles.eventLocation}>📍 {post.location}</Text>
            )}
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{post.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionCount}>{post.shares}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>❤️</Text>
            <Text style={styles.actionCount}>{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEvent = (event: Event) => (
    <View key={event.id} style={styles.eventCard}>
      <View
        style={[
          styles.eventCategory,
          { backgroundColor: getCategoryColor(event.category) },
        ]}
      >
        <Text style={styles.eventCategoryText}>
          {event.category.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.eventDateTime}>
        {event.date} at {event.time}
      </Text>
      <Text style={styles.eventLocation}>📍 {event.location}</Text>
      <Text style={styles.eventAttendees}>👥 {event.attendees} attending</Text>
      <TouchableOpacity style={styles.joinEventButton}>
        <Text style={styles.joinEventButtonText}>Join Event</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Posts":
        return (
          <View style={styles.postsContainer}>{posts.map(renderPost)}</View>
        );
      case "Events":
        return (
          <View style={styles.eventsContainer}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {upcomingEvents.map(renderEvent)}
          </View>
        );
      case "Study":
        return (
          <View style={styles.studyContainer}>
            <Text style={styles.sectionTitle}>
              Study Groups & Academic Posts
            </Text>
            {posts
              .filter((p) => p.type === "study" || p.type === "achievement")
              .map(renderPost)}
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

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {["Posts", "Events", "Study", "About"].map((tab) => (
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerName}>Alex Johnson</Text>
          <Text style={styles.headerSubtitle}>Computer Science • Junior</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>⋯</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        refreshControl={
          showRefreshControl ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4F46E5"
              colors={["#4F46E5"]}
            />
          ) : undefined
        }
      >
        {/* Cover Photo - Campus themed */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=200&fit=crop",
            }}
            style={styles.coverPhoto}
          />
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Animated.View
              style={[
                styles.profileImageContainer,
                {
                  transform: [
                    { scale: profileImageScale },
                    { translateY: profileImageTranslateY },
                  ],
                },
              ]}
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                }}
                style={styles.profileImage}
              />
              <View style={styles.verificationBadge}>
                <Text style={styles.verificationText}>🎓</Text>
              </View>
            </Animated.View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Connect</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex Johnson</Text>
            <Text style={styles.profileHandle}>@alexj_cs</Text>
            <View style={styles.academicBadge}>
              <Text style={styles.academicBadgeText}>
                Junior • Computer Science
              </Text>
            </View>
            <Text style={styles.profileBio}>
              CS Junior at State University 🎓 | Full-stack developer | Study
              group organizer | Coffee enthusiast ☕ | Always down to help with
              coding!
            </Text>
            <View style={styles.profileMeta}>
              <Text style={styles.profileMetaText}>🏫 State University</Text>
              <Text style={styles.profileMetaText}>📍 Campus Dorm B</Text>
              <Text style={styles.profileMetaText}>📅 Class of 2025</Text>
            </View>
            <View style={styles.profileStats}>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>234</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>567</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Study Groups</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        {renderTabBar()}

        {/* Tab Content */}
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
    backgroundColor: "#4F46E5",
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
  headerSubtitle: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
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
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: -40,
    marginBottom: 12,
  },
  profileImageContainer: {
    borderWidth: 4,
    borderColor: "#000",
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    position: "relative",
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
  },
  verificationBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  verificationText: {
    fontSize: 12,
  },
  followButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
    marginBottom: 8,
  },
  academicBadge: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  academicBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
    color: "#8B98A5",
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
    borderBottomColor: "#4F46E5",
  },
  tabText: {
    color: "#8B98A5",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  postsContainer: {
    backgroundColor: "#000",
  },
  postContainer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2F3336",
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postContent: {
    flex: 1,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  postName: {
    color: "#fff",
    fontWeight: "bold",
    marginRight: 4,
  },
  postHandle: {
    color: "#8B98A5",
    marginRight: 4,
  },
  postTime: {
    color: "#8B98A5",
    marginRight: 4,
  },
  postTypeIcon: {
    marginLeft: "auto",
  },
  courseTag: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  courseTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  postText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  eventInfo: {
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventDate: {
    color: "#4F46E5",
    fontWeight: "600",
    marginBottom: 4,
  },
  eventLocation: {
    color: "#8B98A5",
  },
  postActions: {
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
  eventCard: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventCategory: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  eventCategoryText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  eventTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  eventDateTime: {
    color: "#4F46E5",
    fontWeight: "600",
    marginBottom: 4,
  },

  eventAttendees: {
    color: "#8B98A5",
    marginBottom: 12,
  },
  joinEventButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  joinEventButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  studyContainer: {
    backgroundColor: "#000",
    padding: 16,
  },
  aboutContainer: {
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

export default StudentProfile;
