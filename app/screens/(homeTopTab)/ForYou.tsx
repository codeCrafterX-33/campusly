import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  BackHandler,
  SafeAreaView,
  ViewStyle,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {
  useContext,
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { auth } from "../../configs/FireBaseConfigs";
import LatestPost from "../../components/Home/LatestPost";
import {
  FlatList,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import { PostContext } from "../../context/PostContext";
import { useAnimatedStyle } from "react-native-reanimated";
import { interpolate } from "react-native-reanimated";
import { useDrawerProgress } from "@react-navigation/drawer";
import AddPostBtn from "../../components/Post/AddPostBtn";
import { useTheme } from "react-native-paper";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import Colors from "../../constants/Colors";
import { CardStyleInterpolators } from "@react-navigation/stack";

function Home() {
  const [gestureEnabled, setGestureEnabled] = useState(true);
  const { userData, getUser } = useContext(AuthContext);
  const { colors } = useTheme();
  const { posts, getPosts, onRefresh } = useContext(PostContext);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [hasSilentRefreshed, setHasSilentRefreshed] = useState(false);
  const { visibleIn, setVisibleIn } = useContext(PostContext);

  const flatListRef = useRef(null);
  const parentDrawer = navigation.getParent();

  useFocusEffect(
    useCallback(() => {
      // Background refresh only on initial focus after first load
      if (hasInitialLoad && userData && !hasSilentRefreshed) {
        // Silently refresh posts in background without showing loading
        onRefresh([0]);
        setHasSilentRefreshed(true);
      }

      const onSwipeRight = (event: any) => {
        if (
          event.nativeEvent.translationX > 100 &&
          event.nativeEvent.state === State.END
        ) {
          navigation.openDrawer();
        } else if (
          event.nativeEvent.translationX < -100 &&
          event.nativeEvent.state === State.END
        ) {
          navigation.navigate("following");
        }
      };
    }, [hasInitialLoad, userData, onRefresh, hasSilentRefreshed])
  );

  useEffect(() => {
    // Fetch posts when the component mounts or user changes
    const fetchPosts = async () => {
      // Only show loading on initial load
      if (!hasInitialLoad) {
        setIsLoading(true);
      }
      try {
        await getPosts();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
        setHasInitialLoad(true);
      }
    };

    fetchPosts();
  }, [userData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.background,
      },
    });
  }, []);

  useEffect(() => {
    if (userData) {
      if (posts.length === 0 && !hasInitialLoad) {
        getPosts(0);
      }
      return;
    }
    getUser();
  }, [userData, hasInitialLoad]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  if (isLoading) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <PanGestureHandler
      enabled={gestureEnabled}
      onGestureEvent={() => {}} // Can be omitted if not using animated gestures
      onHandlerStateChange={(event) => {
        const { translationX, state, x } = event.nativeEvent;

        if (x < 30) {
          setGestureEnabled(false); // prevent conflict with drawer swipe
          return;
        }

        if (state === State.END) {
          if (translationX > 100) {
            navigation.openDrawer();
          } else if (translationX < -100) {
            navigation.navigate("following");
          }
        }
      }}
      simultaneousHandlers={flatListRef}
      activeOffsetX={[-30, 30]} // 👈 allows horizontal swipe detection
      failOffsetY={[-5, 5]}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Latest Post */}
        <LatestPost key={userData?.id} flatListRef={flatListRef} />
      </View>
    </PanGestureHandler>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 0,
  },

  tabText: {
    fontSize: 20,
    padding: 4,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
  },

  activeTabText: {
    color: "white",
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
  },

  tabContainer: {
    flexDirection: "row",
    gap: 10,
    padding: 10,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
