import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import TextInputField from "../shared/TextInputField";
import Button from "../ui/Button";
import Colors from "../../constants/Colors";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

interface AuthFormprops {
  isSignIn?: boolean;
  onSubmit: (credentials: {
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    profileImage: string;
  }) => void;
  credentialIsInvalid: {
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
    fullName: boolean;
  };
  isLoading: boolean;
}

const AuthForm = ({
  isSignIn,
  onSubmit,
  credentialIsInvalid,
  isLoading,
}: AuthFormprops) => {
  const [profileImage, setProfileImage] = useState<string>("");
  const [enteredFullName, setEnteredFullName] = useState<string>("");
  const [enteredEmail, setEnteredEmail] = useState<string>("");
  const [enteredPassword, setEnteredPassword] = useState<string>("");
  const [enteredConfirmPassword, setEnteredConfirmPassword] =
    useState<string>("");

  const {
    email: emailIsInvalid,
    password: passwordIsInvalid,
    confirmPassword: passwordsDontMatch,
    fullName: fullNameIsInvalid,
  } = credentialIsInvalid;

  function updateInputValueHandler(inputType: string, enteredValue: string) {
    switch (inputType) {
      case "fullName":
        setEnteredFullName(enteredValue);
        break;

      case "email":
        setEnteredEmail(enteredValue);
        break;

      case "password":
        setEnteredPassword(enteredValue);
        break;

      case "confirmPassword":
        setEnteredConfirmPassword(enteredValue);
        break;
    }
  }

  function submitHandler() {
    onSubmit({
      email: enteredEmail,
      fullName: enteredFullName,
      password: enteredPassword,
      confirmPassword: enteredConfirmPassword,
      profileImage: profileImage,
    });
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View>
      {!isSignIn && (
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage}>
            <View>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.image} />
              ) : (
                <Image
                  source={require("../../assets/images/profile.png")}
                  style={styles.image}
                />
              )}
              <Ionicons
                style={styles.cameraIcon}
                name="camera"
                size={24}
                color={Colors.PRIMARY}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {!isSignIn && (
        <TextInputField
          label="Full Name"
          inputStyle={styles.inputStyle}
          value={enteredFullName}
          onChangeText={updateInputValueHandler.bind(this, "fullName")}
          isInvalid={fullNameIsInvalid}
        />
      )}

      <TextInputField
        keyboardType="email-address"
        label="College Email"
        inputStyle={styles.inputStyle}
        value={enteredEmail}
        onChangeText={updateInputValueHandler.bind(this, "email")}
        isInvalid={emailIsInvalid}
      />
      <TextInputField
        label="Password"
        secure
        inputStyle={styles.inputStyle}
        value={enteredPassword}
        onChangeText={updateInputValueHandler.bind(this, "password")}
        isInvalid={passwordIsInvalid}
      />

      {!isSignIn && (
        <TextInputField
          label="Confirm Password"
          placeholder={"Re-enter your password"}
          secure
          inputStyle={styles.inputStyle}
          value={enteredConfirmPassword}
          onChangeText={updateInputValueHandler.bind(this, "confirmPassword")}
          isInvalid={passwordsDontMatch}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          isLoading={isLoading}
          onPress={submitHandler}
          textStyle={{ textAlign: "center" }}
        >
          {isSignIn ? "Sign In" : "Create Account"}
        </Button>
      </View>
    </View>
  );
};

export default AuthForm;

const styles = StyleSheet.create({
  inputStyle: {
    color: Colors.PRIMARY,
  },
  buttonContainer: {
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 999,
    marginTop: 20,
  },
  imageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
