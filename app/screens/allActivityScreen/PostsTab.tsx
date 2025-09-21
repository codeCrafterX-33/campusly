import React, {
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import PostCard from "../../components/Post/PostCard";
import { PostContext } from "../../context/PostContext";
import { useViewableItemsPreloader } from "../../hooks/useViewableItemsPreloader";
import Colors from "../../constants/Colors";
import Toast from "react-native-toast-message";
import { Tabs } from "react-native-collapsible-tab-view";
import { OnRefresh } from "../../util/OnRefresh";
import Checkmark from "../../components/checkmark";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PostsTab({
  setShowCheckmark,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
}) {
  const { userPosts, getUserPosts, posts } = useContext(PostContext);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const { onViewableItemsChanged, viewabilityConfig } =
    useViewableItemsPreloader();

  const publicPosts = userPosts.filter((post: any) => post.club === 0);

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
      {publicPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
            <Ionicons
              name="chatbubble-outline"
              size={50}
              color={Colors.PRIMARY}
            />
          </Animated.View>
          <Text style={[styles.title, { color: colors.onBackground }]}>
            No posts yet 🎈
          </Text>
          <Text style={[styles.subtitle, { color: Colors.GRAY }]}>
            You haven't shared anything publicly yet. Start posting and let your
            campus know what's on your mind! 🎉
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("DrawerNavigator", {
                screen: "TabLayout",
                params: {
                  screen: "Home",
                },
              })
            }
          >
            <Text style={styles.buttonText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Tabs.FlatList
          data={publicPosts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item: any) =>
            (item.id?.toString() || "") + (item.createdon || "")
          }
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
                  route: "Posts",
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
    width: SCREEN_WIDTH,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100, // Add extra padding at bottom
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    color: Colors.GRAY,
    fontSize: 16,
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
