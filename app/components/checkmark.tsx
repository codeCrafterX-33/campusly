// Checkmark.tsx
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import Colors from "../constants/Colors";

interface CheckmarkProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export default function Checkmark({
  visible,
  setVisible,
  style,
}: CheckmarkProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        setVisible(false);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={styles.circle}>
        <Text style={styles.check}>✓</Text>
      </View>
      <Text style={styles.label}>Updated!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -62,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1001,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  check: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  label: {
    marginTop: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: "600",
  },
});
