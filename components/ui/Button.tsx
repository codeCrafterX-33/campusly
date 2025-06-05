import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import Colors from "../../constants/Colors";

type ButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  viewStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isLoading?: boolean;
  outline?: boolean;
};

export default function Button({
  children,
  onPress,
  textStyle,
  isLoading,
  outline,
  viewStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[outline ? styles.outlineButton : styles.button, viewStyle]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={outline ? Colors.PRIMARY : Colors.WHITE}
        />
      ) : (
        <Text style={[outline ? styles.outlineButtonText : styles.buttonText, textStyle]}>
          {children}
        </Text>
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
    fontWeight: "bold",
    color: Colors.WHITE,
    fontSize: 18,
  },
  outlineButtonText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 18,
  },
  outlineButton: {
    padding: 15,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 10,
    marginTop: 20,
  },
});
