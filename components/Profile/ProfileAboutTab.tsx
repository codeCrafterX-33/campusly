import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ProfileAboutTab = () => {
  return (
    <View style={styles.aboutContainer}>
      <Text style={styles.sectionTitle}>Academic Information</Text>
      <View style={styles.academicInfo}>
        <Text style={styles.academicLabel}>
          GPA: <Text style={styles.academicValue}>3.8/4.0</Text>
        </Text>
        <Text style={styles.academicLabel}>
          Credits: <Text style={styles.academicValue}>45/120</Text>
        </Text>
        <Text style={styles.academicLabel}>
          Dean's List: <Text style={styles.academicValue}>Fall 2024</Text>
        </Text>
      </View>
      <Text style={styles.sectionTitle}>Current Courses</Text>
      <View style={styles.coursesContainer}>
        {[
          "CS 101 - Intro to Programming",
          "Math 201 - Calculus II",
          "ENG 102 - Composition",
          "HIST 150 - World History",
        ].map((course, index) => (
          <View key={index} style={styles.courseItem}>
            <Text style={styles.courseText}>{course}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProfileAboutTab;

const styles = StyleSheet.create({
  aboutContainer: {
    flex: 1,
    padding: 16,
  },
  academicInfo: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  academicLabel: {
    color: "#8B98A5",
    marginBottom: 8,
  },
  academicValue: {
    color: "#fff",
    fontWeight: "bold",
  },
  courseItem: {
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  courseText: {
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  coursesContainer: {
    marginTop: 16,
  },
});
