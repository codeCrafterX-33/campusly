import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";

import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "../constants/Colors";
import Button from "../components/ui/Button";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../configs/FireBaseConfigs";
import { AuthContext } from "../context/AuthContext";
import * as SplashScreen from "expo-splash-screen";

export default function LandingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/login.png")}
        style={styles.loginImage}
      />

      <View style={styles.welcomeContainer}>
        <Animated.Text
          style={styles.welcomeTextHeader}
          entering={FadeIn.duration(1000)}
        >
          Welcome to Campusly! 🎉
        </Animated.Text>

        <Animated.Text
          style={styles.welcomeText}
          entering={FadeIn.delay(500).duration(1000)}
        >
          Stay updated with the latest campus events and never miss out on the
          fun.
        </Animated.Text>

        <Button
          onPress={() => {
            navigation.navigate("SignUp");
          }}
          textStyle={{ textAlign: "center" }}
        >
          Get started
        </Button>

        <Pressable
          onPress={() => {
            navigation.navigate("SignIn");
          }}
        >
          <Text style={styles.footerText}>
            Already have an account? Sign in here
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginImage: {
    height: 480,
    width: "100%",
  },
  welcomeContainer: {
    padding: 30,
    marginTop: 15,
  },
  welcomeTextHeader: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 17,
    textAlign: "center",
    color: Colors.GRAY,
    marginTop: 10,
  },

  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.GRAY,
    fontSize: 17,
  },
});
