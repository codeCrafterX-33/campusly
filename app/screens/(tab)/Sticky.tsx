import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Vibration,
} from "react-native";
import { Tabs } from "react-native-collapsible-tab-view";
import ProfileCollapseHeader from "../(profile)/Profile";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 500;
const PULL_THRESHOLD = 80;
const DATA = new Array(100).fill(0);

const DummyContent = ({ label }: { label: string }) => {
  return (
    <View style={{ backgroundColor: "#fff", flex: 1 }}>
      {DATA.map((_, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.itemText}>
            {label} - Item {i}
          </Text>
        </View>
      ))}
    </View>
  );
};

const StickyTabView = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const pullProgress = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setHasTriggeredHaptic(false);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        const distance = Math.abs(Math.min(offsetY, 0));
        const progress = Math.min(distance / PULL_THRESHOLD, 1);
        pullProgress.setValue(progress);

        if (progress === 1 && !hasTriggeredHaptic) {
          Vibration.vibrate(50);
          setHasTriggeredHaptic(true);
        }
      },
    }
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 80],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const pullRotation = pullProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderPullIndicator = () => {
    return (
      <Animated.View
        style={[
          styles.pullIndicator,
          {
            transform: [{ rotate: pullRotation }],
            opacity: refreshing ? 0 : 1,
          },
        ]}
      >
        <Text style={{ fontSize: 18 }}>{refreshing ? "🔄" : "⬇️"}</Text>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
      <Text style={styles.headerText}>Welcome to the Sticky TabView</Text>
      {renderPullIndicator()}
    </Animated.View>
  );

  const renderTab = (label: string) => (
    <Tabs.ScrollView>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1DA1F2"
          />
        }
      >
        <DummyContent label={label} />
      </Animated.ScrollView>
    </Tabs.ScrollView>
  );

  return (
    <Tabs.Container headerHeight={HEADER_HEIGHT} allowHeaderOverscroll>
      <Tabs.Tab name="Tab 1">{renderTab("Tab 1")}</Tabs.Tab>
      <Tabs.Tab name="Tab 2">{renderTab("Tab 2")}</Tabs.Tab>
      <Tabs.Tab name="Tab 3">{renderTab("Tab 3")}</Tabs.Tab>
      <Tabs.Tab name="Tab 4">{renderTab("Tab 4")}</Tabs.Tab>
      <Tabs.Tab name="Tab 5">{renderTab("Tab 5")}</Tabs.Tab>
    </Tabs.Container>
  );
};

export default StickyTabView;

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: "#F4EEE0",
    justifyContent: "flex-end",
    padding: 20,
    position: "relative",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  item: {
    backgroundColor: "#4F4557",
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
  },
  itemText: {
    color: "#fff",
    textAlign: "center",
  },
  pullIndicator: {
    position: "absolute",
    top: 16,
    right: 20,
  },
});
