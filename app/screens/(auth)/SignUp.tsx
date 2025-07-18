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
import { options } from "../../configs/CloudinaryConfig";
import uploadImageToCloudinary from "../../util/uploadToCloudinary";
export default function SignUp({ navigation }: { navigation: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AuthContext);

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
      const imageUrl = await uploadImageToCloudinary(
        profileImage,
        options.folder,
        options.upload_preset
      );

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
