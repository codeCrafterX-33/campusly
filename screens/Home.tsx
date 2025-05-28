import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  BackHandler,
  SafeAreaView,
  ViewStyle,
} from "react-native";
import { useContext, useEffect, useState, useLayoutEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../configs/FireBaseConfigs";
import AppLoading from "expo-app-loading";
import Header from "../components/Home/Header";
import Category from "../components/Home/Category";
import LatestPost from "../components/Home/LatestPost";
import { FlatList } from "react-native-gesture-handler";
import { PostContext } from "../context/PostContext";
import { useAnimatedStyle } from "react-native-reanimated";
import { interpolate } from "react-native-reanimated";
import { useDrawerProgress } from "@react-navigation/drawer";
import AddPostBtn from "../components/Post/AddPostBtn";
import { useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
function Home() {
  const { user, setUser } = useContext(AuthContext);
  const { colors } = useTheme();

  const { refreshing, onRefresh, posts } = useContext(PostContext);

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: colors.background,
      },
    });
  }, []);

  useEffect(() => {
    if (user) {
      if (posts.length === 0) {
        onRefresh();
      }
      return;
    }
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      const userEmail = currentUser?.email;
      if (userEmail) {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${userEmail}`
        );
        setUser(response.data.data[0]);
      }
    });

    return unsubscribe;
  }, [user, posts]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp();
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  if (!user) {
    return <AppLoading />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Latest Post */}
      <LatestPost key={user?.id} />
      <AddPostBtn style={styles.addPostBtn} />
    </View>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 0,
  },
  addPostBtn: {
    position: "absolute",
    bottom: 90,
    right: 20,
    zIndex: 1000,
  },
});
