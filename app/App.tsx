import * as React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import Toast, { ToastConfigParams } from "react-native-toast-message";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { useEffect, useState, useContext } from "react";
import { auth } from "./configs/FireBaseConfigs";
import LoadingScreen from "./screens/loadingScreen";
import {
  StackNavigator,
  AuthenticatedStack,
} from "./navigation/StackNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PostProvider } from "./context/PostContext";
import { CommentProvider } from "./context/CommentContext";
import { PostHistoryProvider } from "./context/PostHistoryContext";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";
import { BackgroundPostProvider } from "./context/BackgroundPostContext";
import { User } from "firebase/auth";
import { Provider as PaperProvider } from "react-native-paper";
import ThemedStatusBar from "./components/ThemedStatusBar";
import ClubProvider from "./context/ClubContext";
import EventProvider from "./context/EventContext";
import { PreloaderProvider } from "./context/PreloaderContext";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

// Customize logging behavior—this suppresses warnings:
configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

// Define navigation types
export type RootStackParamList = {
  Landing: undefined;
  TabLayout: {
    screen?: keyof RootTabParamList;
  };
  SignIn: undefined;
  SignUp: undefined;
  Event: undefined;
  Clubs: undefined;
  "Add-Post": undefined;
  DrawerNavigator: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Clubs: undefined;
  Event: undefined;
  Profile: undefined;
};

export default function App() {
  const [isTryingLogin, setIsTryingLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setIsTryingLogin(false);
      if (user) {
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeContext.Consumer>
            {({ theme }) => (
              <PaperProvider theme={theme}>
                <ThemedStatusBar />

                <NavigationContainer theme={DefaultTheme}>
                  <PreloaderProvider>
                    <BackgroundPostProvider>
                      <ClubProvider>
                        <EventProvider>
                          <PostProvider>
                            <CommentProvider>
                              <PostHistoryProvider>
                                {isTryingLogin ? (
                                  <LoadingScreen />
                                ) : user ? (
                                  <AuthenticatedStack />
                                ) : (
                                  <StackNavigator />
                                )}
                              </PostHistoryProvider>
                            </CommentProvider>
                          </PostProvider>
                        </EventProvider>
                      </ClubProvider>
                    </BackgroundPostProvider>
                  </PreloaderProvider>
                </NavigationContainer>
              </PaperProvider>
            )}
          </ThemeContext.Consumer>

          <Toast config={toastConfig} />
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthProvider>
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
