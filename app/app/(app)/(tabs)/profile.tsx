import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Profile from "@/screens/(profile)/Profile";
import { AuthContext } from "@/context/AuthContext";

export default function ProfileTab() {
  const { colors } = useTheme();
  const { userData } = useContext(AuthContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Profile user_id={userData?.id?.toString()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
