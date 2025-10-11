import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import Colors from "../../constants/Colors";
import Button from "../ui/Button";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";

export default function EmptyState() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  return (
    <View style={[styles.container]}>
      <Image
        source={require("../../assets/images/no-club.png")}
        style={{ width: 170, height: 170 }}
      />
      <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.onBackground }}>
        No clubs found
      </Text>
      <Text style={{ fontSize: 16, color: Colors.GRAY, textAlign: "center" }}>
        Start following clubs to see them here
      </Text>
      <Button onPress={() => navigation.navigate("ExploreClubs")}>
        Explore Clubs
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    marginTop: 80,
    
  },
});
