import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import EmptyState from "../../components/Clubs/EmptyState";
import { useTheme } from "react-native-paper";
import { useContext } from "react";
import { ClubContext } from "../../context/ClubContext";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
export default function Clubs() {
  const { colors } = useTheme();
  // Importing the ClubContext to access followed clubs and the function to get them
  const { followedClubs, getFollowedClubs, getClubs } = useContext(ClubContext);
  const { user } = useContext(AuthContext);

 

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 35,
            fontWeight: "bold",
            color: colors.onBackground,
          }}
        >
          Clubs
        </Text>
        {/* {followedClubs.length === 0 && <EmptyState />} */}
       <EmptyState />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
