import {
  RefreshControl,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import React, { useContext, useState, useEffect, useRef } from "react";
import { PostContext } from "../../context/PostContext";
import PostCard from "../../components/Post/PostCard";
import { useViewableItemsPreloader } from "../../hooks/useViewableItemsPreloader";
import { Tabs } from "react-native-collapsible-tab-view";
import { OnRefresh } from "../../util/OnRefresh";
import Colors from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/StackNavigator";

export default function CommentsTab({
  setShowCheckmark,
  user_id,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
  user_id?: string;
}) {
  const { comments, getComments, viewingUserComments } =
    useContext(PostContext);
  const [refreshing, setRefreshing] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { onViewableItemsChanged, viewabilityConfig } =
    useViewableItemsPreloader();

  // Use appropriate data source based on whether we're viewing a specific user
  const commentPosts = user_id ? viewingUserComments : comments;
  console.log(
    "CommentsTab - user_id:",
    user_id,
    "comments length:",
    comments.length,
    "commentPosts length:",
    commentPosts.length
  );

  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Fetch comments on component mount
  useEffect(() => {
    if (user_id) {
      getComments(user_id);
    } else {
      getComments();
    }
  }, [user_id]);

  // Function to fetch parent post for a comment
  const fetchParentPost = async (comment: any) => {
    try {
      console.log(
        "Fetching parent post for comment:",
        comment.id,
        "parent_post_id:",
        comment.parent_post_id
      );

      if (!comment.parent_post_id) {
        console.log("No parent_post_id found");
        return null;
      }

      const url = `${process.env.EXPO_PUBLIC_SERVER_URL}/post/post?postId=${comment.parent_post_id}`;
      console.log("Fetching parent post from URL:", url);

      const response = await axios.get(url);
      console.log("Parent post response:", response.status, response.data);

      if (response.status === 200 && response.data.data.length > 0) {
        console.log("Parent post found:", response.data.data[0]);
        return response.data.data[0];
      } else {
        console.log("No parent post found in response");
      }
    } catch (error) {
      console.error("Error fetching parent post:", error);
    }
    return null;
  };

  // Handle comment press with parent post fetching
  const handleCommentPress = async (comment: any) => {
    try {
      console.log(
        "Comment pressed:",
        comment.id,
        "parent_post_id:",
        comment.parent_post_id
      );
      const parentPost = await fetchParentPost(comment);

      if (parentPost) {
        console.log(
          "Navigating with parent post:",
          parentPost.id,
          "and comment in thread:",
          comment.id
        );
        // Navigate to PostScreen with the parent post as the main post
        // and the comment in thread history
        navigation.navigate("PostScreen", {
          post: parentPost,
          threadHistory: [comment],
        }); // Start with the clicked comment in thread
      } else {
        console.log("No parent post found, navigating with comment only");
        // Fallback: navigate with just the comment
        navigation.navigate("PostScreen", {
          post: comment,
          threadHistory: [],
        });
      }
    } catch (error) {
      console.error("Error handling comment press:", error);
      // Fallback: navigate with just the comment
      navigation.navigate("PostScreen", {
        post: comment,
        threadHistory: [],
      });
    }
  };
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {commentPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
            <Ionicons
              name="chatbubble-outline"
              size={42}
              color={Colors.PRIMARY}
            />
          </Animated.View>

          <Text style={[styles.title, { color: colors.onBackground }]}>
            {user_id ? "No comments yet 🤐" : "You haven't commented yet 🤐"}
          </Text>

          <Text style={[styles.subtitle, { color: Colors.GRAY }]}>
            {user_id
              ? "This user hasn't made any comments yet."
              : "Find a post that catches your eye and leave a comment. Share your thoughts, your vibes, or just drop an emoji 💬🔥"}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("DrawerNavigator")}
          >
            <Text style={styles.buttonText}>Explore Posts</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Tabs.FlatList
          data={commentPosts}
          renderItem={({ item, index }) => (
            <PostCard
              post={item}
              onPostPress={() => handleCommentPress(item)}
              onCommentPress={() => handleCommentPress(item)}
            />
          )}
          keyExtractor={(item: any) => item.id + Math.random() + item.createdon}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                OnRefresh({
                  setRefreshing,
                  setShowCheckmark,
                  getFunction: getComments,
                  route: "Comments",
                })
              }
            />
          }
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: RFValue(18),
    marginTop: 16,
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    fontSize: RFValue(12),
    marginTop: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: RFValue(12),
  },
});
