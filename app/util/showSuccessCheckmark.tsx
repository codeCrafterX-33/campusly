import { useRef } from "react";
import { Animated, View, StyleSheet, Text } from "react-native";
import Colors from "../constants/Colors";

export function useCheckAnimation() {
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;

  const showSuccessCheckmark = (setShowCheckmark: (show: boolean) => void) => {
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

  const checkmark = () => {
    return (
      <Animated.View
        style={[
          styles.checkmarkContainer,
          {
            opacity: checkmarkOpacity,
            transform: [{ scale: checkmarkScale }],
          },
        ]}
      >
        <View style={styles.checkmarkCircle}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
        <Text style={styles.checkmarkLabel}>Updated!</Text>
      </Animated.View>
    );
  };
  return { showSuccessCheckmark, checkmark };
}

const styles = StyleSheet.create({
  checkmarkContainer: {
    position: "absolute",
    top: 130,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1001,
  },
  checkmarkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  checkmarkLabel: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
