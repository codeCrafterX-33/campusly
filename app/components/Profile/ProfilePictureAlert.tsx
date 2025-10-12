import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";

interface ProfilePictureAlertProps {
  isVisible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
}

const ProfilePictureAlert: React.FC<ProfilePictureAlertProps> = ({
  isVisible,
  onClose,
  onCameraPress,
  onGalleryPress,
}) => {
  const { colors } = useTheme();

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={styles.icon}>📸</Text>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            Change Profile Picture
          </Text>
          <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
            Choose how you'd like to update your profile picture
          </Text>

          <View style={styles.buttonContainer}>
            {/* Camera Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.background },
              ]}
              onPress={() => {
                onClose();
                onCameraPress();
              }}
            >
              <Ionicons
                name="camera"
                size={RFValue(24)}
                color={Colors.PRIMARY}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: colors.onBackground },
                ]}
              >
                Camera
              </Text>
            </TouchableOpacity>

            {/* Gallery Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.background },
              ]}
              onPress={() => {
                onClose();
                onGalleryPress();
              }}
            >
              <Ionicons
                name="images"
                size={RFValue(24)}
                color={Colors.PRIMARY}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: colors.onBackground },
                ]}
              >
                Gallery
              </Text>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.surfaceVariant },
              ]}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={RFValue(20)}
                color={colors.onSurfaceVariant}
              />
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderLeftWidth: 6,
    borderLeftColor: Colors.PRIMARY,
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: RFValue(12),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: RFValue(12),
    paddingHorizontal: RFValue(20),
    borderRadius: RFValue(12),
    gap: RFValue(8),
  },
  actionButtonText: {
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: RFValue(10),
    paddingHorizontal: RFValue(20),
    borderRadius: RFValue(12),
    gap: RFValue(6),
    marginTop: RFValue(8),
  },
  cancelButtonText: {
    fontSize: RFValue(14),
    fontWeight: "500",
  },
});

export default ProfilePictureAlert;
