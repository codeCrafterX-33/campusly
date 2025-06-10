import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Colors from "../../constants/Colors";
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
import ModalDropdown from "./ModalDropdown";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PostContext } from "../../context/PostContext";
import { ClubContext } from "../../context/ClubContext";
interface UploadResponse {
  url: string;
  secure_url: string;
}

export default function WritePost() {
  const { colors } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useContext(AuthContext);
  const { getFollowedClubs, followedClubs } = useContext(ClubContext);
  const { getPosts } = useContext(PostContext);
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<RootStackParamList>,
        BottomTabNavigationProp<RootTabParamList>
      >
    >();
  const [item, setItems] = useState<
    { club_id: number; club_name: string; club_logo: string }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState({ club_name: "Public", club_id: 0 });
  const [content, setContent] = useState("");
  const inputRef = useRef<TextInput>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFollowedClubs();
    if (followedClubs) {
      setItems(
        followedClubs.map((club: any) => ({
          club_id: club.club_id,
          club_logo: club.club_logo,
          club_name: club.name,
        }))
      );
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.onBackground} />
        </TouchableOpacity>
      ),

      headerStyle: {
        backgroundColor: colors.background,
      },
      headerRight: () => (
        <TouchableOpacity onPress={() => onPostBtnClick()}>
          <Text style={[styles.postBtn, { color: "white" }]}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.PRIMARY} />
            ) : (
              "Post"
            )}
          </Text>
        </TouchableOpacity>
      ),
      headerTitle: "",
    });
  }, [content, value, colors, loading]);

  useEffect(() => {
    if (!modalVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [modalVisible]);

  const onPostBtnClick = async () => {
    if (!content) {
      Toast.show({
        text1: "Please enter some content",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image if one is selected
      if (selectedImage) {
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
        imageUrl = uploadImage.url;
      }

      // Post data to backend
      const result = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/post`,
        {
          content: content,
          imageUrl: imageUrl, // Will be null if no image
          visibleIn: value.club_id,
          email: user?.email,
        }
      );

      if (result.status === 201) {
        Toast.show({
          text1: "Your post was sent",
          type: "success",
        });

        navigation.navigate("DrawerNavigator");
      }
    } catch (error) {
      console.error("Post submission error:", error);
      Toast.show({
        text1: "Error creating post",
        type: "error",
      });
    } finally {
      setLoading(false);
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        ref={inputRef}
        placeholder="What's on your mind?"
        placeholderTextColor={Colors.GRAY}
        style={[
          styles.input,
          { backgroundColor: colors.background, color: colors.onBackground },
        ]}
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
            style={[
              styles.image,
              { borderColor: Colors.PRIMARY, borderWidth: 2 },
            ]}
          />
        )}
      </TouchableOpacity>

      <View style={styles.dropdownContainer}>
        <ModalDropdown
          modalVisible={modalVisible}
          value={value}
          items={item}
          setModalVisible={setModalVisible}
          setValue={setValue}
          setItems={setItems}
          header="Choose audience"
        />
      </View>
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

  dropdownContainer: {
    marginTop: 15,
  },
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
  },
  postBtn: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 99,
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: Colors.PRIMARY,
  },
  postBtnContainer: {
    marginTop: 15,
  },
});
