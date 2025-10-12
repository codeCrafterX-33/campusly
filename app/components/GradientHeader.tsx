import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../constants/Colors";
import { useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface GradientHeaderProps {
  title: string;
}

const GradientHeader: React.FC<GradientHeaderProps> = ({ title }) => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation();

  // Dynamic middle color based on theme
  const middleColor = dark ? "#ffffff" : "#000000";

  // Text color should be opposite of the middle color
  const textColor = dark ? "#000000" : "#ffffff";

  return (
    <LinearGradient
      colors={[Colors.PRIMARY, middleColor, Colors.PRIMARY]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientHeader}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={RFValue(24)} color={textColor} />
        </TouchableOpacity>

        <View style={styles.placeholder} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientHeader: {
    height: 80,
    paddingTop: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: RFValue(16),
    height: "100%",
  },
  backButton: {
    padding: RFValue(8),
    marginLeft: RFValue(-8),
  },
});

export default GradientHeader;
