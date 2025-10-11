import React from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { useBackgroundPost } from "../context/BackgroundPostContext";
import { useTheme } from "react-native-paper";
import Colors from "../constants/Colors";

const { width } = Dimensions.get("window");

const BackgroundPostIndicator: React.FC = () => {
  const { postState } = useBackgroundPost();
  const { colors } = useTheme();

  if (!postState.isPosting) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.message, { color: colors.onBackground }]}>
            {postState.message}
          </Text>
          <Text style={[styles.progressText, { color: colors.onBackground }]}>
            {postState.completedFiles}/{postState.totalFiles} files
          </Text>
        </View>

        {postState.message.includes("video") && (
          <Text style={[styles.warningText, { color: Colors.PRIMARY }]}>
            Large videos may take several minutes to upload
          </Text>
        )}

        <View
          style={[
            styles.progressBarContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: `${postState.progress}%`,
                backgroundColor: Colors.PRIMARY,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  progressText: {
    fontSize: 12,
    color: Colors.GRAY,
  },
  warningText: {
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 4,
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
});

export default BackgroundPostIndicator;
