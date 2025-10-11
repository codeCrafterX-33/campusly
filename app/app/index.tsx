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
  const { userData, getUser, isAuthenticated, setIsAuthenticated } =
    useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsTryingLogin(false);
      if (user) {
        setIsAuthenticated(true);
        console.log("from index.tsx User authenticated");
      } else {
        setIsAuthenticated(false);
        console.log("from index.tsx User not authenticated");
      }
    });
    return unsubscribe;
  }, [setIsAuthenticated]);

  if (isTryingLogin) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <StackNavigator />;
  }

  console.log("from index.tsx isAuthenticated", isAuthenticated);
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
