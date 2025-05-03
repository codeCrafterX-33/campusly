import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useState } from "react";
import Colors from "../../constants/Colors";
import DropDownPicker from "react-native-dropdown-picker";
import Button from "../ui/Button";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { upload } from "cloudinary-react-native";
import { cld, postOptions } from "../../configs/CloudinaryConfig";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootStackParamList, RootTabParamList } from "../../App";

interface UploadResponse {
  url: string;
  secure_url: string;
}

export default function WritePost() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<RootStackParamList>,
        BottomTabNavigationProp<RootTabParamList>
      >
    >();
  const [item, setItems] = useState<{ label: string; value: string }[]>([
    { label: "Public", value: "public" },
    { label: "Code Crafter Club", value: "codeCrafterClub" },
  ]);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onPostBtnClick = async () => {
    if (!content) {
      Toast.show({
        text1: "Please enter some content",

        type: "error",
      });
      return;
    }
    setLoading(true);

    if (selectedImage) {
      try {
        const uploadImage = await new Promise<UploadResponse>(
          (resolve, reject) => {
            upload(cld, {
              file: selectedImage,
              options: postOptions,
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

        // send data to backend

        try {
          const result = await axios.post(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/post`,
            {
              content: content,
              imageUrl: uploadImage.url,
              visibleIn: value,
              email: user?.email,
            }
          );
          console.log(result.data);
          navigation.navigate("TabLayout", { screen: "Home" });
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.error("Error uploading image", error);
        setLoading(false);
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="What's on your mind?"
        style={styles.input}
        multiline={true}
        numberOfLines={4}
        maxLength={1000}
        onChangeText={(text) => setContent(text)}
      />

      <TouchableOpacity onPress={pickImage}>
        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        )}
        {!selectedImage && (
          <Image
            source={require("../../assets/images/image.png")}
            style={styles.image}
          />
        )}
      </TouchableOpacity>

      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={open}
          value={value}
          items={item}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          placeholder="Select an item"
          style={styles.dropdown}
        />
      </View>

      <Button isLoading={loading} onPress={() => onPostBtnClick()}>
        Post
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 10,
    marginTop: 10,
    height: 150,
    textAlignVertical: "top",
    fontSize: 16,
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 15,
    borderRadius: 15,
  },
  dropdown: {
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 10,
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 0,
  },
  dropdownContainer: {
    marginTop: 15,
  },
});
