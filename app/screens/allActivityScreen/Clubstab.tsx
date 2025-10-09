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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ProfileClubtab({
  setShowCheckmark,
  user_id,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
  user_id?: string;
}) {
  const { userPosts, getUserPosts, viewingUserPosts } = useContext(PostContext);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const { onViewableItemsChanged, viewabilityConfig } =
    useViewableItemsPreloader();

  // Use appropriate data source based on whether we're viewing a specific user
  const posts = user_id ? viewingUserPosts : userPosts;
  const clubPosts = posts.filter(
    (post: any) => post.club !== 0 && post.club !== null
  );
  console.log(
    "Clubstab - user_id:",
    user_id,
    "posts length:",
    posts.length,
    "clubPosts length:",
    clubPosts.length
  );

  const bounceAnim = useRef(new Animated.Value(0)).current;

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
    <View style={styles.container}>
      {clubPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
            <Ionicons name="people-outline" size={50} color={Colors.PRIMARY} />
          </Animated.View>
          <Text style={[styles.title, { color: colors.onBackground }]}>
            No club posts yet 🎈
          </Text>
          <Text style={[styles.subtitle, { color: Colors.GRAY }]}>
            {user_id
              ? "This user hasn't shared any club posts yet."
              : "You haven't shared anything in your clubs yet. Start the conversation and connect with your club members! 🎉"}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("DrawerNavigator", {
                screen: "TabLayout",
                params: {
                  screen: "Clubs",
                },
              })
            }
          >
            <Text style={styles.buttonText}>Join Clubs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Tabs.FlatList
          data={clubPosts}
          renderItem={({ item, index }) => <PostCard post={item} />}
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
                  getFunction: getUserPosts,
                  route: "Clubs",
                })
              }
              tintColor={Colors.PRIMARY}
              colors={[Colors.PRIMARY]}
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
    fontSize: RFValue(13),
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: RFValue(14),
  },
});
