import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClubContext } from "../context/ClubContext";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/Colors";
import TextInputField from "../components/shared/TextInputField";
import Button from "../components/ui/Button";
import Toast from "react-native-toast-message";

type RouteParams = {
  club: {
    id: number;
    name: string;
    about: string;
    club_logo: string;
    createdby: string;
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
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authorized to edit this club
  useEffect(() => {
    if (userData?.email !== club.createdby) {
      Alert.alert("Unauthorized", "You can only edit clubs you created.", [
        {
          text: "Go Back",
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  }, [userData, club, navigation]);

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !imageUrl.trim()) {
      Toast.show({
        text1: "Validation Error",
        text2: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateClub(club.id, {
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
      });

      Toast.show({
        text1: "Success",
        text2: "Club updated successfully",
        type: "success",
      });

      navigation.goBack();
    } catch (error) {
      console.log("Error updating club:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Discard Changes",
      "Are you sure you want to discard your changes?",
      [
        {
          text: "Keep Editing",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  if (userData?.email !== club.createdby) {
    return null; // Don't render if unauthorized
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onBackground }]}>
          Edit Club
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Update your club information
        </Text>
      </View>

      <View style={styles.form}>
        <TextInputField
          label="Club Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter club name"
          maxLength={50}
        />

        <TextInputField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter club description"
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <TextInputField
          label="Image URL"
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="Enter image URL"
        />

        <View style={styles.buttonContainer}>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    // Uses default outline button styling
  },
  saveButton: {
    // Uses default filled button styling
  },
});
