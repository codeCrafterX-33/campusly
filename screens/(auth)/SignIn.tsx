import {
  View,
  Text,
  StyleSheet,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import AuthContent from "../../components/auth/AuthContent";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/FireBaseConfigs";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import Colors from "../../constants/Colors";
import { useContext, useState } from "react";
import { ActivityIndicator } from "react-native";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function SignIn({ navigation }: { navigation: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser, authenticate } = useContext(AuthContext);

  function signinHandler({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        if (userCredential.user) {
          const userEmail = userCredential.user?.email;
          const token = await userCredential.user.getIdToken();

          console.log(userEmail);
          Toast.show({
            type: "success",
            text1: "Success!🎉",
            text2: "You have successfully signed in to your account.",
          });

          if (userEmail) {
            const response = await axios.get(
              `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${userEmail}`
            );

            setUser(response.data.data[0]);

            setIsLoading(false);
            navigation.navigate("TabLayout");
          }
        }
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
        if (error.code === "auth/invalid-credential") {
          Toast.show({
            type: "error",
            text1: "You have entered an invalid email or password",
          });
        }
      });
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Sign In To My School Event</Text>
        </View>

        <AuthContent
          isLoading={isLoading}
          isSignIn
          onAuthenticate={signinHandler}
        />
        <Pressable
          onPress={() => {
            navigation.navigate("SignUp");
          }}
        >
          <Text style={styles.footerText}>
            New to My School Event? Sign up here
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
  logo: {
    width: 250,
    height: 250,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.GRAY,
    fontSize: 17,
  },
});
