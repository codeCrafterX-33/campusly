import React from "react";
import { Animated, Text, View, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";

interface Props {
  pullDistance: number;
  refreshing: boolean;
  pullProgress: Animated.Value;
  threshold: number;
}

const PullToRefreshIndicator = ({
  pullDistance,
  refreshing,
  pullProgress,
  threshold,
}: Props) => {
  if (pullDistance === 0 || refreshing) return null;
  const isReady = pullDistance >= threshold;

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

  return (
    <Animated.View
      style={[
        styles.pullIndicator,
        {
          opacity: pullTextOpacity,
          transform: [{ translateY: Math.min(pullDistance - 20, 60) }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.pullIcon,
          {
            backgroundColor: isReady ? "#1DA1F2" : "#8B98A5",
            transform: [
              { rotate: pullIndicatorRotation },
              { scale: pullIndicatorScale },
            ],
          },
        ]}
      >
        <Text
          style={[styles.pullIconText, { color: isReady ? "#fff" : "#000" }]}
        >
          {isReady ? "🎉" : "↓"}
        </Text>
      </Animated.View>
      <Text
        style={[styles.pullText, { color: isReady ? "#1DA1F2" : "#8B98A5" }]}
      >
        {isReady ? "Release to refresh!" : "Pull to refresh"}
      </Text>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: pullProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
});

export default PullToRefreshIndicator;
