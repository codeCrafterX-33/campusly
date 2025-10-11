import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import ClubsHome from "@/screens/ClubsHome";

export default function ClubsTab() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ClubsHome />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
