import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from "react-native";
import AuthContent from "../../components/auth/AuthContent";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/FireBaseConfigs";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import axios from "axios";
import Colors from "../../constants/Colors";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function SignUp({ navigation }: { navigation: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AuthContext);

  // Replace with your Cloudinary info
  const CLOUD_NAME = "YOUR_CLOUD_NAME";
  const UPLOAD_PRESET = "YOUR_UNSIGNED_UPLOAD_PRESET";

  async function uploadImageToCloudinary(imageUri: string) {
    const data = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg", // adjust type if needed
      name: "upload.jpg",
    } as any);
    data.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || "Cloudinary upload failed");
    }
    return json.secure_url;
  }

  async function signupHandler({
    email,
    password,
    fullName,
    profileImage,
  }: {
    email: string;
    password: string;
    fullName: string;
    profileImage: string;
  }) {
    setIsLoading(true);
    try {
      // Create user with Firebase Auth
      await createUserWithEmailAndPassword(auth, email, password);

      // Upload image and get URL
      const imageUrl = await uploadImageToCloudinary(profileImage);

      // Send user data to backend
      const result = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/user`,
        {
          name: fullName,
          email,
          image: imageUrl,
        }
      );

      if (result.status === 201) {
        const userData = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${email}`
        );
        setUser(userData.data.data[0]);
        navigation.navigate("DrawerNavigator");
      }

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Your account has been created.",
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Email already in use, please sign in",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Something went wrong",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Create New Account</Text>

        <AuthContent isLoading={isLoading} onAuthenticate={signupHandler} />

        <Pressable
          onPress={() => {
            navigation.navigate("SignIn");
          }}
        >
          <Text style={styles.footerText}>
            Already have an account? Sign in here
          </Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    fontSize: 25,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.GRAY,
    fontSize: 17,
  },
});
