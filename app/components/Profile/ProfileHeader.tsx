import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../context/ThemeContext";
import ProfilePictureModal from "./ProfilePictureModal";
import * as ImagePicker from "expo-image-picker";
import ProfilePictureAlert from "./ProfilePictureAlert";

const COVER_HEIGHT = 200;
const PROFILE_IMAGE_SIZE = 80;

interface ProfileHeaderProps {
  scrollY: Animated.Value;
  user_id: string;
  userimage: string;
}

const ProfileHeader = ({ scrollY, user_id, userimage }: ProfileHeaderProps) => {
  console.log("user_id", user_id);
  const { userData } = useContext(AuthContext);
  const loggedInUser = user_id === userData?.email;
  const { isDarkMode } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profilePictureAlertVisible, setProfilePictureAlertVisible] =
    useState(false);

  const profileImageScale = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT / 2, COVER_HEIGHT],
    outputRange: [1, 0.6, 0.3],
    extrapolate: "clamp",
  });

  const profileImageTranslateY = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT / 2, COVER_HEIGHT],
    outputRange: [0, -10, -30],
    extrapolate: "clamp",
  });

  const profileImageOpacity = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT / 2, COVER_HEIGHT],
    outputRange: [1, 0.8, 0.4],
    extrapolate: "clamp",
  });

  const handleChangePicture = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library."
        );
        return;
      }

      // Show ProfilePictureAlert
      setProfilePictureAlertVisible(true);
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to request permissions.");
    }
  };

  const openImagePicker = async (source: "camera" | "library") => {
    try {
      setIsUploading(true);
      setIsModalVisible(false);

      let result;
      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Please grant permission to access your camera."
          );
          setIsUploading(false);
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        console.log("Selected image:", selectedImage.uri);

        // TODO: Upload image to server/cloud storage
        // For now, just show success message
        Alert.alert("Success", "Profile picture updated successfully!");

        // TODO: Update user profile with new image URL
        // This would typically involve:
        // 1. Upload image to cloud storage (Cloudinary, AWS S3, etc.)
        // 2. Get the uploaded image URL
        // 3. Update user profile in database
        // 4. Refresh the UI with new image
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.profileHeader}>
      <Animated.View
        style={[
          styles.profileImageContainer,
          {
            transform: [
              { scale: profileImageScale },
              { translateY: profileImageTranslateY },
            ],
            opacity: profileImageOpacity,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri: userimage,
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <View style={styles.verificationBadge}>
          <Text style={styles.verificationText}>🎓</Text>
        </View>
      </Animated.View>

      {loggedInUser ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditProfile", {
              userEmail: userData?.email,
              sectionToEdit: "intro",
            })
          }
          style={{ marginLeft: 16 }}
        >
          <Ionicons
            name="create-outline"
            size={RFValue(24)}
            color={Colors.PRIMARY}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.followButton,
            isDarkMode
              ? { backgroundColor: "white" }
              : { backgroundColor: "black" },
          ]}
        >
          <Text
            style={[
              styles.followButtonText,
              isDarkMode ? { color: "black" } : { color: "white" },
            ]}
          >
            Follow
          </Text>
        </TouchableOpacity>
      )}

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        visible={isModalVisible}
        imageUri={userimage}
        isOwnProfile={loggedInUser}
        onClose={() => setIsModalVisible(false)}
        onChangePicture={handleChangePicture}
      />

      {/* ProfilePictureAlert for camera/gallery selection */}
      <ProfilePictureAlert
        isVisible={profilePictureAlertVisible}
        onClose={() => setProfilePictureAlertVisible(false)}
        onCameraPress={() => openImagePicker("camera")}
        onGalleryPress={() => openImagePicker("library")}
      />
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: -40,
    marginBottom: 12,
  },
  profileImageContainer: {
    borderWidth: 4,
    borderColor: "#000",
    borderRadius: PROFILE_IMAGE_SIZE / 2,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
  },
  verificationBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  verificationText: {
    fontSize: 12,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  editProfileButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
});
