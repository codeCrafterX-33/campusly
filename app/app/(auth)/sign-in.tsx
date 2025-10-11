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
import { router } from "expo-router";
import SignIn from "../../screens/(auth)/SignIn";

export default function SignInRoute() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser, authenticate } = useContext(AuthContext);

  return <SignIn />;
}
