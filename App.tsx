import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import {
  StackNavigator,
  AuthenticatedStack,
} from "./navigation/StackNavigator";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./context/AuthContext";
import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { auth } from "./configs/FireBaseConfigs";
import axios from "axios";
import * as SplashScreen from "expo-splash-screen";
// @ts-ignore
import { NavigationContainer } from "@react-navigation/native";
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isTryingLogin, setIsTryingLogin] = useState(true);
  const onLayoutRootView = useCallback(async () => {
    if (!isTryingLogin) {
      console.log("hiding splash screen");
      await SplashScreen.hideAsync();
    }
  }, [isTryingLogin]);
  // Toast config with custom styling
  const toastConfig = {
    success: ({ text1, text2 }: { text1: string; text2: string }) => (
      <View style={[styles.toastContainer, styles.successToast]}>
        <Text style={styles.toastText}>{text1}</Text>
        <Text style={styles.toastSubText}>{text2}</Text>
      </View>
    ),
    error: ({ text1, text2 }: { text1: string; text2: string }) => (
      <View style={[styles.toastContainer, styles.errorToast]}>
        <Text style={styles.toastText}>{text1}</Text>
        <Text style={styles.toastSubText}>{text2}</Text>
      </View>
    ),
    info: ({ text1, text2 }: { text1: string; text2: string }) => (
      <View style={[styles.toastContainer, styles.infoToast]}>
        <Text style={styles.toastText}>{text1}</Text>
        <Text style={styles.toastSubText}>{text2}</Text>
      </View>
    ),
  };

  function Navigation() {
    const { user } = useContext(AuthContext);
    if (user) {
      return <AuthenticatedStack />;
    } else {
      return <StackNavigator />;
    }
  }

  function Root() {
    const { setUser } = useContext(AuthContext);
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user?.email) {
          const response = await axios.get(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${user.email}`
          );
          console.log(response.data.data[0]);
          setUser(response.data.data[0]);
          setIsTryingLogin(false);
        } else {
          setIsTryingLogin(false);
        }
      });
      return unsubscribe;
    }, []);

    

    if (isTryingLogin) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    }

    return <Navigation />;
  }
  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <NavigationContainer onReady={onLayoutRootView}>
          <Root />
        </NavigationContainer>
        {/* Initialize Toast with ref and custom config */}
        {/* @ts-ignore */}
        <Toast config={toastConfig} />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "#4BB543", // Green for success
  },
  errorToast: {
    backgroundColor: "#D9534F", // Red for error
  },
  infoToast: {
    backgroundColor: "#5BC0DE", // Blue for info
  },
});
