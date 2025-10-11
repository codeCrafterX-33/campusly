import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";

export const DynamicHeader = ({ selectedSchool }: { selectedSchool: any }) => {
  const { colors } = useTheme();
  return (
    <>
      {!selectedSchool ? (
        <View style={styles.container}>
          <Text style={{ color: "white", fontSize: RFValue(20) }}>
            🎓 Let’s verify you’re a real student!
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={{ color: "white", fontSize: RFValue(20) }}>
            📧 Time to match your email with your campus!
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.PRIMARY,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
