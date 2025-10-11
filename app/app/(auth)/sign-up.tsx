import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
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
import { router } from "expo-router";
import SignUp from "../../screens/(auth)/SignUp";

export default function SignUpRoute({ navigation }: { navigation: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AuthContext);

  return <SignUp />;
}
