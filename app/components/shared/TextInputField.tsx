import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";
import Colors from "../../constants/Colors";

interface TextInputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
  isInvalid?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  inputStyle?: ViewStyle | TextStyle;
  placeholderTextColor?: string;
  labelStyle?: TextStyle;
}

const TextInputField = ({
  label,
  placeholder,
  placeholderTextColor,
  value,
  onChangeText,
  secure,
  isInvalid,
  keyboardType,
  inputStyle,
  labelStyle,
}: TextInputFieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, labelStyle, isInvalid && styles.labelInvalid]}>
        {label}
      </Text>
      <TextInput
        placeholder={placeholder ?? `Enter your ${label}`}
        placeholderTextColor={
          placeholderTextColor ? placeholderTextColor : Colors.GRAY
        }
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        style={[styles.textInput, inputStyle, isInvalid && styles.inputInvalid]}
      />
    </View>
  );
};

export default TextInputField;

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  textInput: {
    borderWidth: 0.5,
    borderColor: Colors.GRAY,
    borderRadius: 5,
    padding: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
    color: "black",
  },

  inputInvalid: {
    backgroundColor: Colors.ERROR100,
  },

  labelInvalid: {
    color: Colors.ERROR500,
  },
});
