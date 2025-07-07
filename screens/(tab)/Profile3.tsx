import React, { useRef, useState, useCallback, useContext } from "react";
import {
  View,
  StyleSheet,
  ListRenderItem,
  RefreshControl,
  Animated,
  Vibration,
} from "react-native";
import { Tabs } from "react-native-collapsible-tab-view";
import ProfileCollapseHeader from "./Profile";
import { PostContext } from "../../context/PostContext";
import ProfilePostsTab from "../../components/Profile/ProfilePostsTab";
import ProfileClubtab from "../../components/Profile/ProfileClubtab";
import ProfileStudyTab from "../../components/Profile/ProfileStudyTab";
const HEADER_HEIGHT = 300;

const DATA = [0, 1, 2, 3, 4];
const identity = (v: unknown): string => v + "";

const Example: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const pullProgress = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);

  const { userPosts, getUserPosts } = useContext(PostContext);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasTriggeredHaptic(false);

    const status = await getUserPosts();

    if (status === 200) {
      // Trigger success vibration
      Vibration.vibrate(100);
      setTimeout(() => {
        setRefreshing(false);
        showSuccessCheckmark();
      }, 2000);
    } else {
      setRefreshing(false);
    }
  }, []);

  const showSuccessCheckmark = () => {
    setShowCheckmark(true);

    // Animate checkmark appearance
    Animated.parallel([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Hide checkmark after 2.5 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: 0,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(checkmarkOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowCheckmark(false);
      });
    }, 2500);
  };

  const renderItem: ListRenderItem<number> = React.useCallback(({ index }) => {
    return (
      <View style={[styles.box, index % 2 === 0 ? styles.boxB : styles.boxA]} />
    );
  }, []);

  return (
    <Tabs.Container
   
      headerHeight={HEADER_HEIGHT} // optional
    >
      <Tabs.Tab name="Posts">
        <ProfilePostsTab />
      </Tabs.Tab>
      <Tabs.Tab name="Clubs">
        <ProfileClubtab />
      </Tabs.Tab>
      <Tabs.Tab name="Study">
        <ProfileStudyTab />
      </Tabs.Tab>
    </Tabs.Container>
  );
};

const styles = StyleSheet.create({
  box: {
    height: 250,
    width: "100%",
  },
  boxA: {
    backgroundColor: "white",
  },
  boxB: {
    backgroundColor: "#D8D8D8",
  },
  header: {
    height: HEADER_HEIGHT,
    width: "100%",
    backgroundColor: "#2196f3",
  },
});

export default Example;
