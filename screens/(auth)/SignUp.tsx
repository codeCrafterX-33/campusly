import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from "react-native";
import AuthContent from "../../components/auth/AuthContent";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/FireBaseConfigs";
import { options } from "../../configs/CloudinaryConfig";
import { upload } from "cloudinary-react-native";
import { cld } from "../../configs/CloudinaryConfig";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import axios from "axios";
import Colors from "../../constants/Colors";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function SignUp({ navigation }: { navigation: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  function signupHandler({
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
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        Toast.show({
          type: "success",
          text1: "Success!",
          text2: "Your action was completed successfully.",
        });

        //  upload image
        const uploadResult = await upload(cld, {
          file: profileImage,
          options: options,
          callback: async (error: any, response: any) => {
            if (error) {
              console.log(error);
              if (!response?.url) {
                Toast.show({
                  type: "error",
                  text1: "Image upload failed",
                });
                return;
              }
            }

            // send data to backend
            const result = await axios.post(
              `${process.env.EXPO_PUBLIC_SERVER_URL}/user`,
              {
                name: fullName,
                email: email,
                image: response?.url,
              }
            );

            const userData = await axios.get(
              `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${email}`
            );

            setUser(userData.data.data[0]);

            setIsLoading(false);
            // navigate to home screen
            navigation.navigate("TabLayout");
          },
        });
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.code === "auth/email-already-in-use") {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Email already in use please sign in",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error?.message,
          });
        }
      });
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
