import React, { useEffect, useContext, useLayoutEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  ActivityIndicator,
  ImageBackground,
  Animated,
  StatusBar,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import Colors from "../../constants/Colors";
import { Icon, useTheme } from "react-native-paper";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { TransitionPresets } from "@react-navigation/stack";
import { PostContext } from "../../context/PostContext";
import PostCard from "../../components/Post/PostCard";
const windowWidth = Dimensions.get("window").width;

const HEADER_EXPANDED = 35;
const HEADER_COLLAPSED = 120;

export default function WrappedProfileScreen() {
  return (
    <SafeAreaProvider>
      <ProfileScreen />
    </SafeAreaProvider>
  );
}

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();

  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const { userPosts, getUserPosts } = useContext(PostContext);
  const navigation = useNavigation();

  useEffect(() => {
    getUserPosts(user?.email);
    if (userPosts.length > 0) {
      console.log(userPosts);
    }
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Back Button */}
      <View
        style={[
          styles.Button,
          {
            top: insets.top + 10,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Icon source="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Pull to refresh */}
      <Animated.View
        style={[
          styles.iconCenter,
          {
            top: insets.top + 13,
            opacity: scrollY.interpolate({
              inputRange: [-20, 0],
              outputRange: [1, 0],
            }),
            transform: [
              {
                rotate: scrollY.interpolate({
                  inputRange: [-45, -35],
                  outputRange: ["180deg", "0deg"],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        ]}
      >
        <Icon source="arrow-down" size={24} color="white" />
      </Animated.View>

      {/* Sticky Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            top: insets.top + 6,
            opacity: scrollY.interpolate({
              inputRange: [90, 110],
              outputRange: [0, 1],
            }),
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [90, 110],
                  outputRange: [30, 0],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.username}>{user?.name}</Text>
        <Text style={styles.tweetsCount}>20 Posts</Text>
      </Animated.View>

      {/* Cover Image */}
      <ImageBackground
        source={{ uri: user?.image }}
        style={styles.coverImage}
      ></ImageBackground>

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        style={styles.scrollView}
      >
        <View
          style={[
            styles.profileContent,
            { backgroundColor: colors.background },
          ]}
        >
          <Image source={{ uri: user?.image }} style={styles.profileImage} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.handle}>{user?.email}</Text>
          <Text style={styles.bio}>
            Passionate developer. Loves building cool shit
          </Text>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>
              120 {<Text style={styles.statLabel}>Following</Text>}
            </Text>

            <Text style={styles.stat}>
              1.2k {<Text style={styles.statLabel}>Followers</Text>}
            </Text>
          </View>
        </View>

        {/* Posts */}
        <View style={{ backgroundColor: "#0d0d0d" }}>
          {userPosts.length > 0 ? (
            userPosts.map((post: any, index: any) => (
              <PostCard post={post} key={index} />
            ))
          ) : (
            <View style={styles.noPosts}>
              <Text style={styles.noPostsText}>No posts yet</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  Button: {
    position: "absolute",
    left: 20,
    zIndex: 999,
    elevation: 10,
  },

  iconButton: {
    position: "absolute",
    zIndex: 2,
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  iconCenter: {
    position: "absolute",
    zIndex: 2,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "red",
  },
  stickyHeader: {
    position: "absolute",
    zIndex: 2,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  tweetsCount: {
    fontSize: 13,
    color: "white",
    marginTop: 5,
  },
  coverImage: {
    position: "absolute",
    left: 0,
    right: 0,
    height: HEADER_COLLAPSED + 60,
    backgroundColor: Colors.PRIMARY,
  },
  scrollView: {
    zIndex: 3,
    marginTop: HEADER_COLLAPSED,
    paddingTop: HEADER_EXPANDED,
  },
  profileContent: {
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#0d0d0d",
    marginTop: -30,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  handle: {
    fontSize: 15,
    color: Colors.GRAY,
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    color: Colors.GRAY,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: "row",
    marginVertical: 15,
  },
  stat: {
    color: "#fff",
    marginRight: 20,
    fontSize: 14,
    fontWeight: "bold",
  },
  statLabel: {
    color: Colors.GRAY,
    fontWeight: "normal",
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
});
