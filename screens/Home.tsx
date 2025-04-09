import { View, Text, StyleSheet, Image } from "react-native";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const { user } = useContext(AuthContext);

  if (user) {
    return (
      <View style={styles.container}>
        <Text>{user.name}</Text>
        <Image
          source={{ uri: user.image }}
          style={{ width: 100, height: 100 }}
        />
      </View>
    );
  }
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
