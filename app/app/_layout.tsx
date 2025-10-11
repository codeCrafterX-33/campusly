import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { auth } from "@/configs/FireBaseConfigs";
import { User } from "firebase/auth";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PostProvider } from "@/context/PostContext";
import { CommentProvider } from "@/context/CommentContext";
import { PostHistoryProvider } from "@/context/PostHistoryContext";
import { BackgroundPostProvider } from "@/context/BackgroundPostContext";
import ClubProvider from "@/context/ClubContext";
import EventProvider from "@/context/EventContext";
import { PreloaderProvider } from "@/context/PreloaderContext";
import { Provider as PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import ThemedStatusBar from "@/components/ThemedStatusBar";
import LoadingScreen from "@/screens/loadingScreen";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <PaperProvider>
              <ThemedStatusBar />
              <PreloaderProvider>
                <BackgroundPostProvider>
                  <ClubProvider>
                    <EventProvider>
                      <PostProvider>
                        <CommentProvider>
                          <PostHistoryProvider>
                            <Stack screenOptions={{ headerShown: false }}>
                              <Stack.Screen name="index" />
                              <Stack.Screen name="(auth)" />
                              <Stack.Screen name="(app)" />
                              <Stack.Screen
                                name="(modals)"
                                options={{ presentation: "modal" }}
                              />
                            </Stack>
                          </PostHistoryProvider>
                        </CommentProvider>
                      </PostProvider>
                    </EventProvider>
                  </ClubProvider>
                </BackgroundPostProvider>
              </PreloaderProvider>
              <Toast />
            </PaperProvider>
          </NavigationThemeProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthProvider>
  );
}
