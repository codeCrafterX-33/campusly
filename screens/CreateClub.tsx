import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "../constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { RFValue } from "react-native-responsive-fontsize";
import Toast from "react-native-toast-message";
import { cld } from "../configs/CloudinaryConfig";
import { upload } from "cloudinary-react-native";
import { clubOptions } from "../configs/CloudinaryConfig";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
interface UploadResponse {
  url: string;
  secure_url: string;
}

export default function CreateClub() {
  const { user } = useContext(AuthContext);
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        StackNavigationProp<RootStackParamList>,
        DrawerNavigationProp<any>
      >
    >();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [clubName, setClubName] = useState<string>("");
  const [clubDescription, setClubDescription] = useState<string>("");
  const [clubImage, setClubImage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const validateInputs = (
    name: string,
    description: string,
    image: string | null
  ) => {
    let isValid = true;

    if (!name) {
      setNameError("Please enter a club name");
      isValid = false;
    } else if (name.length < 3) {
      setNameError("Club name must be at least 3 characters");
      isValid = false;
    } else {
      setNameError(null);
    }

    if (!description) {
      setDescriptionError("Please enter a club description");
      isValid = false;
    } else if (description.length < 10) {
      setDescriptionError("Description must be at least 10 characters");
      isValid = false;
    } else {
      setDescriptionError(null);
    }

    if (!image) {
      setImageError("Please select a club image");
      isValid = false;
    } else {
      setImageError(null);
    }

    console.log("Validation Result:", { name, description, image, isValid });
    return isValid;
  };

  const uploadData = async (
    name: string,
    description: string,
    image: string | null
  ) => {
    setLoading(true);
    try {
      let imageUrl = null;

      if (image) {
        const uploadImage = await new Promise<UploadResponse>(
          (resolve, reject) => {
            upload(cld, {
              file: image,
              options: clubOptions,
              callback: (error: any, response: any) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(response);
                }
              },
            });
          }
        );
        imageUrl = uploadImage.url;
      }

      const result = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/club`,
        {
          name: name,
          description: description,
          imageUrl: imageUrl,
          u_email: user?.email,
        }
      );

      if (result.status === 201) {
        Toast.show({
          text1: "Your club has been created",
          type: "success",
        });

        navigation.navigate("DrawerNavigator", {
          screen: "TabLayout",
          params: {
            screen: "Clubs",
            params: {
              screen: "ExploreClubs",
            },
          },
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        text1: "Failed to create club",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onPostBtnClick = () => {
    setTimeout(() => {
      const name = clubName.trim();
      const description = clubDescription.trim();
      const image = clubImage;

      const isValid = validateInputs(name, description, image);

      if (isValid) {
        uploadData(name, description, image);
      }
    }, 100);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
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

      setClubImage(result.assets[0].uri);
      setImageError(null);
    }
  };

  const handleNameChange = (text: string) => {
    setClubName(text);
    if (text.trim().length < 3 && text.trim().length > 0) {
      setNameError("Club name must be at least 3 characters");
    } else {
      setNameError(null);
    }
  };

  const handleDescriptionChange = (text: string) => {
    setClubDescription(text);
    if (text.trim().length < 10 && text.trim().length > 0) {
      setDescriptionError("Description must be at least 10 characters");
    } else {
      setDescriptionError(null);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10, marginRight: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
      ),

      headerStyle: {
        backgroundColor: colors.background,
      },
      headerRight: () => (
        <TouchableOpacity onPress={onPostBtnClick} disabled={loading}>
          <Text style={[styles.postBtn, { color: "white" }]}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              "Create"
            )}
          </Text>
        </TouchableOpacity>
      ),
      headerTitle: "Add New Club",
      headerTitleStyle: {
        fontSize: RFValue(16),
        fontWeight: "bold",
        color: colors.onBackground,
      },
    });
  }, [navigation, colors, onPostBtnClick, loading]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={pickImage}>
        {clubImage ? (
          <Image source={{ uri: clubImage }} style={styles.image} />
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
      {imageError && <Text style={styles.errorText}>{imageError}</Text>}
      <Text style={styles.helperText}>Recommended: Square image, max 5MB</Text>

      <TextInput
        placeholder="Club Name"
        placeholderTextColor={Colors.GRAY}
        style={[
          styles.clubNameInput,
          {
            backgroundColor: colors.background,
            color: colors.onBackground,
            borderColor: nameError ? "red" : "transparent",
            borderWidth: nameError ? 1 : 0,
          },
        ]}
        value={clubName}
        onChangeText={handleNameChange}
        maxLength={30}
        autoCapitalize="words"
        autoFocus={true}
      />
      {nameError && <Text style={styles.errorText}>{nameError}</Text>}

      <TextInput
        placeholder="Club Description"
        placeholderTextColor={Colors.GRAY}
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            color: colors.onBackground,
            borderColor: descriptionError ? "red" : "transparent",
            borderWidth: descriptionError ? 1 : 0,
          },
        ]}
        value={clubDescription}
        onChangeText={handleDescriptionChange}
        multiline={true}
        numberOfLines={4}
        maxLength={1000}
      />
      {descriptionError && (
        <Text style={styles.errorText}>{descriptionError}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: RFValue(10),
  },
  postBtn: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    textAlign: "center",
    marginRight: RFValue(10),
    paddingHorizontal: RFValue(15),
    paddingVertical: RFValue(5),
    borderRadius: 99,
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: Colors.PRIMARY,
  },
  postBtnContainer: {
    marginTop: 15,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 15,
    borderRadius: 15,
  },
  clubNameInput: {
    backgroundColor: Colors.WHITE,
    borderRadius: RFValue(15),
    padding: RFValue(10),
    marginTop: RFValue(10),
    height: RFValue(50),
    fontSize: RFValue(14),
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderRadius: RFValue(15),
    padding: RFValue(10),
    marginTop: RFValue(10),
    height: RFValue(150),
    textAlignVertical: "top",
    fontSize: RFValue(14),
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorText: {
    color: "red",
    fontSize: RFValue(12),
    marginTop: 5,
    marginLeft: 5,
  },
  helperText: {
    color: Colors.GRAY,
    fontSize: RFValue(12),
    marginTop: 5,
    marginLeft: 5,
  },
});
