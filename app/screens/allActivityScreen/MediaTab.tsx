import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useContext, useEffect, useRef, useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PostContext } from "../../context/PostContext";
import { Tabs } from "react-native-collapsible-tab-view";
import { useViewableItemsPreloader } from "../../hooks/useViewableItemsPreloader";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { OnRefresh } from "../../util/OnRefresh";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MediaTab({
  setShowCheckmark,
  user_id,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
  user_id?: string;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { isDarkMode } = useContext(ThemeContext);
  const { colors } = useTheme();
  const { userPosts, getUserPosts, viewingUserPosts } = useContext(PostContext);
  const { onViewableItemsChanged, viewabilityConfig } =
    useViewableItemsPreloader();
  const [refreshing, setRefreshing] = useState(false);

  // Use appropriate data source based on whether we're viewing a specific user
  const posts = user_id ? viewingUserPosts : userPosts;
  console.log("MediaTab - user_id:", user_id, "posts length:", posts.length);

  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Extract media items from posts
  const mediaItems = useMemo(() => {
    const items: Array<{ post: any; media: any; key: string }> = [];
    posts.forEach((post: any) => {
      if (post?.media && Array.isArray(post.media.media)) {
        post.media.media.forEach((m: any, idx: number) => {
          items.push({ post, media: m, key: `${post.id}-${idx}` });
        });
      }
    });
    console.log("MediaTab - mediaItems length:", items.length);
    return items;
  }, [posts]);

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

  const renderMediaItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.mediaItem}
      onPress={() => navigation.navigate("PostScreen", { post: item.post })}
    >
      <Image
        source={{
          uri:
            item.media.type === "image"
              ? item.media.url
              : item.media.url.replace(
                  "/upload/",
                  "/upload/w_500,h_500,c_fill,q_auto,f_jpg/"
                ),
        }}
        style={styles.mediaThumbnail}
      />
      {item.media.type === "video" && (
        <View style={styles.videoOverlay}>
          <Icon name="play-circle-outline" size={32} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
        <Ionicons name="image-outline" size={44} color={Colors.PRIMARY} />
      </Animated.View>

      <Text style={[styles.title, { color: colors.onBackground }]}>
        Nothing to see yet 👀
      </Text>

      <Text style={[styles.subtitle, { color: Colors.GRAY }]}>
        {user_id
          ? "This user hasn't shared any media yet."
          : "You haven't shared any pics or videos yet. Campus life is waiting — let's make it pop! 📸🎥"}
      </Text>

      {!user_id && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("AddPost")}
        >
          <Text style={styles.buttonText}>Upload Media</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (mediaItems.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <Tabs.FlatList
        data={mediaItems}
        renderItem={renderMediaItem}
        keyExtractor={(item: any) => item.key}
        numColumns={3}
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
                route: "Media",
              })
            }
            tintColor={Colors.PRIMARY}
            colors={[Colors.PRIMARY]}
          />
        }
        contentContainerStyle={styles.mediaGrid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    fontSize: RFValue(14),
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  mediaItem: {
    width: (SCREEN_WIDTH - 20 * 2 - 6 * 2) / 3,
    height: (SCREEN_WIDTH - 20 * 2 - 6 * 2) / 3,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  mediaThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
