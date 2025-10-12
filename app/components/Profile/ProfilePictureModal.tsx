import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ProfilePictureModalProps {
  visible: boolean;
  imageUri: string;
  isOwnProfile: boolean;
  onClose: () => void;
  onChangePicture?: () => void;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  visible,
  imageUri,
  isOwnProfile,
  onClose,
  onChangePicture,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons
                name="close"
                size={RFValue(24)}
                color={colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>

          {/* Bottom Action Button */}
          {isOwnProfile && (
            <View
              style={[
                styles.bottomActionContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.changeButton,
                  { backgroundColor: Colors.PRIMARY },
                ]}
                onPress={onChangePicture}
              >
                <Ionicons name="camera" size={RFValue(20)} color="white" />
                <Text style={styles.changeButtonText}>Change Picture</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(12),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  closeButton: {
    padding: RFValue(8),
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: RFValue(20),
  },
  fullscreenImage: {
    width: screenWidth - RFValue(40),
    height: screenHeight * 0.7,
    borderRadius: RFValue(12),
  },
  bottomActionContainer: {
    paddingHorizontal: RFValue(20),
    paddingVertical: RFValue(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: RFValue(24),
    paddingVertical: RFValue(12),
    borderRadius: RFValue(25),
    gap: RFValue(8),
  },
  changeButtonText: {
    color: "white",
    fontSize: RFValue(16),
    fontWeight: "600",
  },
});

export default ProfilePictureModal;
