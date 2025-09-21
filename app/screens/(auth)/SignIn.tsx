import {
  View,
  Text,
  StyleSheet,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
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

          Toast.show({
            type: "success",
            text1: "Login Successfull🎉",
            text2: "Welcome back to Campusly!",
          });

          if (userEmail) {
            const response = await axios.get(
              `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${userEmail}`
            );

            setUser(response.data.data[0]);

            setIsLoading(false);
            navigation.navigate("DrawerNavigator");
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
              />
              <Text style={styles.title}>Sign In To Campusly</Text>
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
                New to Campusly? Sign up here
              </Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 90,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 100,
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
