import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Event from "@/screens/(tab)/Event";

export default function EventsTab() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Event />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
