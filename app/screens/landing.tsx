import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import Colors from "../constants/Colors";
import Button from "../components/ui/Button";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../configs/FireBaseConfigs";
import { AuthContext } from "../context/AuthContext";
import * as SplashScreen from "expo-splash-screen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/StackNavigator";

const { width, height } = Dimensions.get("window");

export default function LandingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const floatingAnimation = useSharedValue(0);

  React.useEffect(() => {
    floatingAnimation.value = withRepeat(
      withTiming(1, { duration: 4000 }),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => {
    const translateY = interpolate(floatingAnimation.value, [0, 1], [0, -15]);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Modern Gradient Background */}
      <LinearGradient
        colors={["#2A9D8F", "#FFFFFF", "#2A9D8F"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Geometric Elements */}
      <Animated.View style={[styles.floatingShape1, floatingStyle]} />
      <Animated.View style={[styles.floatingShape2, floatingStyle]} />
      <Animated.View style={[styles.floatingShape3, floatingStyle]} />

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Hero Image Section */}
        <Animated.View
          style={styles.imageContainer}
          entering={FadeInUp.duration(1000).delay(200)}
        >
          <Animated.View style={[styles.imageWrapper, floatingStyle]}>
            <Image
              source={require("../assets/images/login.png")}
              style={styles.loginImage}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={styles.welcomeContainer}
          entering={FadeInDown.duration(800).delay(600)}
        >
          <Text style={styles.welcomeTextHeader}>Welcome to Campusly! 🎉</Text>

          <Text style={styles.welcomeText}>
            Stay updated with the latest campus events and never miss out on the
            fun.
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={styles.buttonContainer}
          entering={FadeInUp.duration(800).delay(800)}
        >
          <View style={styles.primaryButtonWrapper}>
            <Button
              onPress={() => {
                navigation.navigate("SignUp");
              }}
              textStyle={styles.primaryButtonText}
              viewStyle={styles.primaryButton}
            >
              Get started
            </Button>
          </View>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              navigation.navigate("SignIn");
            }}
          >
            <Text style={styles.footerText}>
              Already have an account? Sign in here
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  floatingShape1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(42, 157, 143, 0.08)",
    top: height * 0.08,
    right: -60,
    transform: [{ rotate: "45deg" }],
  },
  floatingShape2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(42, 157, 143, 0.06)",
    top: height * 0.25,
    left: -40,
    transform: [{ rotate: "-30deg" }],
  },
  floatingShape3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(42, 157, 143, 0.05)",
    bottom: height * 0.15,
    right: 30,
    transform: [{ rotate: "15deg" }],
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageWrapper: {
    shadowColor: "#2A9D8F",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
  },
  loginImage: {
    height: 300,
    width: width * 0.7,
    borderRadius: 15,
  },
  welcomeContainer: {
    alignItems: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  welcomeTextHeader: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    color: "#2A9D8F",
    marginBottom: 16,
    letterSpacing: -0.5,
    textShadowColor: "rgba(42, 157, 143, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeText: {
    fontSize: 18,
    textAlign: "center",
    color: "#4A5568",
    lineHeight: 26,
    fontWeight: "400",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  primaryButtonWrapper: {
    marginBottom: 20,
    shadowColor: "#2A9D8F",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryButton: {
    backgroundColor: "#2A9D8F",
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    minHeight: 60,
    borderWidth: 0,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
    color: "#2A9D8F",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
    letterSpacing: 0.3,
  },
});
