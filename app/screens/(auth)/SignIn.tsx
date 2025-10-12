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
import Colors from "../../constants/Colors";
import { useContext, useState } from "react";
import { ActivityIndicator } from "react-native";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/StackNavigator";

export default function SignIn() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  function signinHandler({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    setIsLoading(true);
    signIn(email, password)
      .then(() => {
        setIsLoading(false);
        // Navigation will be handled by app/index.tsx based on auth state
        navigation.navigate("Landing");
      })
      .catch((error: any) => {
        setIsLoading(false);
        console.log(error);
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
