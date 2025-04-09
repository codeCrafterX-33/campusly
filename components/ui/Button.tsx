import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import Colors from "../../constants/Colors";

type ButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
};

export default function Button({
  children,
  onPress,
  style,
  isLoading,
}: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.WHITE} />
      ) : (
        <Text style={styles.buttonText}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {},
  button: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: Colors.WHITE,
    fontSize: 18,
  },
});
