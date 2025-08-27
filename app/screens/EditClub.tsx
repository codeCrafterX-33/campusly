import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClubContext } from "../context/ClubContext";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/Colors";
import Button from "../components/ui/Button";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import * as ImagePicker from "expo-image-picker";
import { clubOptions } from "../configs/CloudinaryConfig";
import CampuslyAlert from "../components/CampuslyAlert";

type RouteParams = {
  club: {
    id: number;
    name: string;
    about: string;
    club_logo: string;
    user_id: number;
  };
};

export default function EditClub() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { club } = route.params as RouteParams;

  const { updateClub } = useContext(ClubContext);
  const { userData } = useContext(AuthContext);

  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.about);
  const [imageUrl, setImageUrl] = useState(club.club_logo);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [showDiscardAlert, setShowDiscardAlert] = useState(false);

  // Check if user is authorized to edit this club
  useEffect(() => {
    if (userData?.id !== club.user_id) {
      setShowUnauthorizedAlert(true);
    }
  }, [userData, club, navigation]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      const fileInfo = await fetch(result.assets[0].uri).then((res) => {
        return {
          size: res.headers.get("Content-Length"),
          type: res.headers.get("Content-Type"),
        };
      });

      const fileSizeInMB = fileInfo.size
        ? parseInt(fileInfo.size) / (1024 * 1024)
        : 0;

      if (fileSizeInMB > 5) {
        setImageError("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(result.assets[0].uri);
      setImageError(null);
    }
  };

  const uploadImage = async (imageUri: string): Promise<string> => {
    // Create form data for image upload
    const formData = new FormData();
    const uri = imageUri;
    const filename = uri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename as string);
    const type = match ? `image/${match[1]}` : "image";

    formData.append("file", {
      uri,
      name: filename,
      type,
    } as any);

    formData.append("upload_preset", clubOptions.upload_preset);
    formData.append("folder", clubOptions.folder);

    // Upload to Cloudinary directly
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadResult = await uploadResponse.json();
    return uploadResult.secure_url;
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) {
      Toast.show({
        text1: "Validation Error",
        text2: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      let finalImageUrl = imageUrl;

      // If a new image was selected, upload it first
      if (selectedImage) {
        try {
          finalImageUrl = await uploadImage(selectedImage);
        } catch (error) {
          Toast.show({
            text1: "Image Upload Failed",
            text2: "Failed to upload the new image",
            type: "error",
          });
          setIsLoading(false);
          return;
        }
      }

      await updateClub(club.id, {
        name: name.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl,
      });

      Toast.show({
        text1: "Success",
        text2: "Club updated successfully",
        type: "success",
      });

      navigation.goBack();
    } catch (error) {
      console.log("Error updating club:", error);
      Toast.show({
        text1: "Update Failed",
        text2: "Failed to update club",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowDiscardAlert(true);
  };

  if (userData?.id !== club.user_id) {
    return null; // Don't render if unauthorized
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="never"
          keyboardDismissMode="none"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onBackground }]}>
              Edit Club
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              Update your club information
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            {/* Club Image Picker */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.onBackground }]}>
                Club Image
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.imageContainer}
              >
                {selectedImage || imageUrl ? (
                  <Image
                    source={{ uri: selectedImage || imageUrl }}
                    style={styles.image}
                  />
                ) : (
                  <Image
                    source={require("../assets/images/image.png")}
                    style={[
                      styles.image,
                      {
                        borderColor: imageError ? "red" : Colors.PRIMARY,
                        borderWidth: 2,
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
              {imageError && (
                <Text style={[styles.errorText, { color: "red" }]}>
                  {imageError}
                </Text>
              )}
              <Text
                style={[styles.helperText, { color: colors.onSurfaceVariant }]}
              >
                Recommended: Square image, max 5MB
              </Text>
            </View>

            {/* Club Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.onBackground }]}>
                Club Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.outline,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Enter club name"
                placeholderTextColor={colors.onSurfaceVariant}
                value={name}
                onChangeText={setName}
                maxLength={30}
              />
              <Text
                style={[
                  styles.characterCount,
                  {
                    color: name.length >= 24 ? "red" : colors.onSurfaceVariant,
                  },
                ]}
              >
                {name.length}/30
              </Text>
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.onBackground }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.multilineInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.outline,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Enter club description"
                placeholderTextColor={colors.onSurfaceVariant}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text
                style={[
                  styles.characterCount,
                  {
                    color:
                      description.length >= 400
                        ? "red"
                        : colors.onSurfaceVariant,
                  },
                ]}
              >
                {description.length}/500
              </Text>
            </View>

            {/* Spacer to push content above buttons */}
            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Button Container at Bottom */}
      <View
        style={[styles.buttonContainer, { backgroundColor: colors.background }]}
      >
        <Button
          onPress={handleCancel}
          outline={true}
          viewStyle={[styles.button, styles.cancelButton]}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onPress={handleSave}
          isLoading={isLoading}
          viewStyle={[styles.button, styles.saveButton]}
        >
          Save Changes
        </Button>
      </View>

      {/* Unauthorized Alert */}
      <CampuslyAlert
        isVisible={showUnauthorizedAlert}
        type="error"
        onClose={() => setShowUnauthorizedAlert(false)}
        messages={{
          success: {
            title: "Success! 🎉",
            message: "Operation completed successfully!",
            icon: "✅",
          },
          error: {
            title: "Oops! 🚫",
            message:
              "Looks like you're trying to edit someone else's club! Only the club creator can make changes. Time to create your own awesome club! 🎯",
            icon: "🤖",
          },
        }}
        onPress={() => {
          setShowUnauthorizedAlert(false);
          navigation.goBack();
        }}
        buttonText="Got It!"
      />

      {/* Discard Changes Alert */}
      <CampuslyAlert
        isVisible={showDiscardAlert}
        type="error"
        onClose={() => setShowDiscardAlert(false)}
        messages={{
          success: {
            title: "Success! 🎉",
            message: "Operation completed successfully!",
            icon: "✅",
          },
          error: {
            title: "Wait! 🤔",
            message:
              "Are you sure you want to throw away all your hard work? Those changes will be gone forever! 💔",
            icon: "⚠️",
          },
        }}
        onPress={() => {
          setShowDiscardAlert(false);
          navigation.goBack();
        }}
        onPress2={() => setShowDiscardAlert(false)}
        buttonText="Yes, Discard"
        buttonText2="Keep Editing"
        overrideDefault={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: RFValue(28),
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: RFValue(16),
    lineHeight: 22,
    textAlign: "center",
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: RFValue(16),
    fontWeight: "600",
    marginBottom: 4,
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  image: {
    width: RFValue(100),
    height: RFValue(100),
    borderRadius: RFValue(15),
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: RFValue(16),
    minHeight: RFValue(50),
  },
  multilineInput: {
    minHeight: RFValue(100),
    paddingTop: 16,
  },
  characterCount: {
    fontSize: RFValue(12),
    textAlign: "right",
    marginTop: 4,
  },
  errorText: {
    fontSize: RFValue(12),
    marginTop: 4,
    textAlign: "center",
  },
  helperText: {
    fontSize: RFValue(12),
    marginTop: 4,
    textAlign: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 16,
    padding: RFValue(16),
    paddingBottom: Platform.OS === "ios" ? RFValue(34) : RFValue(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    zIndex: 1000,
  },
  button: {
    flex: 1,
    height: RFValue(40),
  },
  cancelButton: {
    // Uses default outline button styling
  },
  saveButton: {
    // Uses default filled button styling
  },
  bottomSpacer: {
    height: RFValue(100),
  },
});
