import { View, Alert } from "react-native";
import AuthForm from "./AuthForm";
import { useState, useEffect } from "react";
import { ToastAndroid } from "react-native";
import Toast from "react-native-toast-message";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/FireBaseConfigs";
import { upload } from "cloudinary-react-native";
import { cld, options } from "../../configs/CloudinaryConfig";
import axios from "axios";
// @ts-ignore
import { useNavigation } from "@react-navigation/native";

interface AuthCredentials {
  email: string;
  password: string;
  fullName: string;
  profileImage: string;
}

interface AuthContentProps {
  isSignIn?: boolean;
  onAuthenticate: (credentials: AuthCredentials) => void;
  isLoading: boolean;
}

function AuthContent({
  isSignIn,
  onAuthenticate,
  isLoading,
}: AuthContentProps) {
  const [credentialIsInvalid, setCredentialIsInvalid] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    fullName: false,
  });

  const submitHandler = (credentials: {
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    profileImage: string;
  }) => {
    let { email, fullName, password, confirmPassword, profileImage } =
      credentials;

    email = email.trim();
    password = password.trim();

    const fullNameIsValid = fullName.length > 2;
    const emailIsValid = email.includes("@");
    const passwordIsValid = password.length > 6;
    const passwordsAreEqual =
      confirmPassword.length > 6 && password === confirmPassword;

    if (
      !emailIsValid ||
      !passwordIsValid ||
      (!isSignIn && !passwordsAreEqual) ||
      (!isSignIn && !profileImage)
    ) {
      Toast.show({
        type: "error",
        text1: "Invalid Input",
        text2: !isSignIn
          ? "Please enter all details"
          : "Please enter a valid email and password",
      });
      // ToastAndroid.show("Please enter all details", ToastAndroid.SHORT);

      setCredentialIsInvalid({
        email: !emailIsValid,
        password: !passwordIsValid,
        confirmPassword: !passwordsAreEqual,
        fullName: !fullNameIsValid,
      });

      return;
    }

    email = email.toLowerCase();

    onAuthenticate({ email, password, fullName, profileImage });
  };

  return (
    <View>
      <AuthForm
        isSignIn={isSignIn}
        onSubmit={submitHandler}
        credentialIsInvalid={credentialIsInvalid}
        isLoading={isLoading}
      />
    </View>
  );
}

export default AuthContent;
