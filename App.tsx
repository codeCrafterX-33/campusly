// App.tsx
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import Toast, { ToastConfigParams } from "react-native-toast-message";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { auth } from "./configs/FireBaseConfigs";
import axios from "axios";
import * as SplashScreen from "expo-splash-screen";
import LoadingScreen from "./screens/loadingScreen";
import {
  StackNavigator,
  AuthenticatedStack,
} from "./navigation/StackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "firebase/auth";

// Define navigation types
export type RootStackParamList = {
  Landing: undefined;
  TabLayout: undefined;
  SignIn: undefined;
  Event: undefined;
  Clubs: undefined;
  "Add-Post": undefined;
  // Add other screens as needed
};

export default function App() {
  const [isTryingLogin, setIsTryingLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        setIsTryingLogin(false);
      } else {
        setUser(null);
        setIsTryingLogin(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AuthProvider>
        {isTryingLogin ? (
          <LoadingScreen />
        ) : user ? (
          <AuthenticatedStack />
        ) : (
          <StackNavigator />
        )}
      </AuthProvider>
      <Toast config={toastConfig} />
    </>
  );
}

const toastConfig = {
  success: (params: ToastConfigParams<{ text1: string; text2: string }>) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <Text style={styles.toastText}>{params.text1}</Text>
      <Text style={styles.toastSubText}>{params.text2}</Text>
    </View>
  ),
  error: (params: ToastConfigParams<{ text1: string; text2: string }>) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <Text style={styles.toastText}>{params.text1}</Text>
      <Text style={styles.toastSubText}>{params.text2}</Text>
    </View>
  ),
  info: (params: ToastConfigParams<{ text1: string; text2: string }>) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <Text style={styles.toastText}>{params.text1}</Text>
      <Text style={styles.toastSubText}>{params.text2}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toastContainer: {
    padding: 15,
    borderRadius: 10,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
  },
  toastText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  toastSubText: {
    fontSize: 12,
    color: "white",
  },
  successToast: {
    backgroundColor: "#4BB543",
  },
  errorToast: {
    backgroundColor: "#D9534F",
  },
  infoToast: {
    backgroundColor: "#5BC0DE",
  },
});
