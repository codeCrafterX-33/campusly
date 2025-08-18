import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
// You can add image picker later

export default function ProfileSetupScreen() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleComplete = () => {
    // Save data and navigate to home
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" as never }], // or your main tab navigator
    });
  };

  return (
    <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
      <Text style={[styles.title, isDark ? styles.textLight : styles.textDark]}>
        Tell us about yourself
      </Text>

      <TextInput
        style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
        placeholder="Name"
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
        placeholder="Short bio"
        placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
        value={bio}
        onChangeText={setBio}
      />

      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  lightBg: {
    backgroundColor: "white",
  },
  darkBg: {
    backgroundColor: "black",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  textDark: {
    color: "black",
  },
  textLight: {
    color: "white",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputLight: {
    borderColor: "#d1d5db",
    backgroundColor: "#f3f4f6",
    color: "black",
  },
  inputDark: {
    borderColor: "#4b5563",
    backgroundColor: "#1f2937",
    color: "white",
  },
  button: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
