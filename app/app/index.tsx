import React, { useEffect, useState, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { auth } from "@/configs/FireBaseConfigs";
import { User } from "firebase/auth";
import LoadingScreen from "@/screens/loadingScreen";
import LandingScreen from "@/screens/landing";
import Home from "@/screens/Home";
import { AuthContext } from "@/context/AuthContext";
import { router } from "expo-router";
import {
  AuthenticatedStack,
  StackNavigator,
} from "../navigation/StackNavigator";

export default function Index() {
  const { colors } = useTheme();
  const [isTryingLogin, setIsTryingLogin] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const { userData, getUser } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsTryingLogin(false);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  // Trigger navigation when userData changes
  useEffect(() => {
    if (userData && !isTryingLogin && authChecked) {
      console.log("UserData changed, navigating to app");
      router.replace("/(app)");
    }
  }, [userData, isTryingLogin, authChecked]);

  if (isTryingLogin || !authChecked) {
    return <LoadingScreen />;
  }

  if (!userData) {
    return <StackNavigator />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AuthenticatedStack />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
