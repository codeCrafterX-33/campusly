import { View, Text, StyleSheet, Image } from "react-native";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../configs/FireBaseConfigs";
import AppLoading from "expo-app-loading";
import Header from "../components/Home/Header";
import Category from "../components/Home/Category";
function Home() {
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
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
  }, []);

  if (!user) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container}>
      <Header />
      {/* {Category} */}
      <Category />
    </View>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
});
