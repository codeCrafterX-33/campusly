import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";

interface EducationCardProps {
  education: {
    school:
      | string
      | {
          name: string;
          logo?: string;
        };
    degree?: string;
    field_of_study?: string;
  };
}

export default function EducationCard({ education }: EducationCardProps) {
  const { colors } = useTheme();

  // Parse school data safely
  let schoolName = "Unknown School";
  let schoolLogo = "";

  try {
    if (typeof education.school === "string") {
      const parsed = JSON.parse(education.school);
      schoolName = parsed.name || "Unknown School";
      schoolLogo = parsed.logo || "";
    } else if (education.school && typeof education.school === "object") {
      schoolName = education.school.name || "Unknown School";
      schoolLogo = education.school.logo || "";
    }
  } catch (error) {
    console.warn("Error parsing school data:", error);
  }

  const degree = education.degree || "";
  const fieldOfStudy = education.field_of_study || "";

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* School Logo */}
      {schoolLogo ? (
        <Image
          source={{ uri: schoolLogo }}
          style={styles.schoolLogo}
          defaultSource={require("../../assets/images/no-club.png")}
        />
      ) : (
        <View
          style={[
            styles.schoolLogoPlaceholder,
            { backgroundColor: colors.surfaceVariant },
          ]}
        >
          <Text style={styles.logoPlaceholderText}>🎓</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* School Name */}
        <Text style={[styles.schoolName, { color: colors.onSurface }]}>
          {schoolName}
        </Text>

        {/* Degree and Field of Study */}
        {(degree || fieldOfStudy) && (
          <Text
            style={[styles.degreeField, { color: colors.onSurfaceVariant }]}
          >
            {degree && fieldOfStudy
              ? `${degree} in ${fieldOfStudy}`
              : degree || fieldOfStudy}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: RFValue(16),
    borderRadius: RFValue(12),
    marginBottom: RFValue(12),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  schoolLogo: {
    width: RFValue(48),
    height: RFValue(48),
    borderRadius: RFValue(8),
    marginRight: RFValue(16),
  },
  schoolLogoPlaceholder: {
    width: RFValue(48),
    height: RFValue(48),
    borderRadius: RFValue(8),
    marginRight: RFValue(16),
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholderText: {
    fontSize: RFValue(24),
  },
  content: {
    flex: 1,
  },
  schoolName: {
    fontSize: RFValue(16),
    fontWeight: "600",
    marginBottom: RFValue(4),
    lineHeight: RFValue(20),
  },
  degreeField: {
    fontSize: RFValue(14),
    lineHeight: RFValue(18),
    opacity: 0.8,
  },
});
