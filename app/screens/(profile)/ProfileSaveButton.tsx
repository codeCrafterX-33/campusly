import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Colors from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileSaveButton({
  sectionToSave,
  dataToSave,
  handleSave,
  isFormValid,
  isLoading = false,
}: {
  sectionToSave: string;
  dataToSave: any;
  handleSave: () => void;
  isFormValid?: () => boolean;
  isLoading?: boolean;
}) {
  const { colors } = useTheme();
  const { userData, setUserData } = useContext(AuthContext);

  // Safely check if dataToSave has valid content
  const hasValidData = (() => {
    // If form validation function is provided, use it
    if (isFormValid && sectionToSave === "intro") {
      return isFormValid();
    }

    if (typeof dataToSave === "string") {
      return dataToSave.trim().length > 0;
    }
    if (Array.isArray(dataToSave)) {
      // Check if array has any non-empty string elements
      return dataToSave.some(
        (item) => typeof item === "string" && item.trim().length > 0
      );
    }
    if (typeof dataToSave === "object" && dataToSave !== null) {
      // Check if any value in the object is a non-empty string or non-empty array
      return Object.values(dataToSave).some((value) => {
        if (typeof value === "string") {
          return value.trim().length > 0;
        }
        if (Array.isArray(value)) {
          return value.some(
            (item) => typeof item === "string" && item.trim().length > 0
          );
        }
        return false;
      });
    }
    return false;
  })();

  return (
    <TouchableOpacity
      style={[
        styles.saveButton,
        {
          backgroundColor:
            hasValidData && !isLoading
              ? Colors.PRIMARY
              : colors.onSurfaceVariant,
        },
      ]}
      onPress={handleSave}
      disabled={!hasValidData || isLoading}
    >
      <Text style={styles.saveButtonText}>
        {isLoading ? "Saving..." : "Save"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  saveButtonText: {
    color: "#fff",
    fontSize: RFValue(18),
    fontWeight: "bold",
  },
  saveButton: {
    paddingVertical: RFValue(12),
    paddingHorizontal: RFValue(20),
    borderRadius: RFValue(8),
    alignItems: "center",
    justifyContent: "center",
  },
});
