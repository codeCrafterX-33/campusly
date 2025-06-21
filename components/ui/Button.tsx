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
  disabled?: boolean;
  fullWidth?: boolean;
};

export default function Button({
  children,
  onPress,
  textStyle,
  isLoading,
  outline,
  viewStyle,
  disabled,
  fullWidth,
}: ButtonProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        outline ? styles.outlineButton : styles.button,
        viewStyle,
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={outline ? Colors.PRIMARY : Colors.WHITE}
        />
      ) : (
        <Text
          style={[
            outline ? styles.outlineButtonText : styles.buttonText,
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {},
  button: {
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },

  disabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontWeight: "bold",
    color: Colors.WHITE,
    fontSize: 18,
    textAlign: "center",
  },
  outlineButtonText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  outlineButton: {
    padding: 10,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 10,
    marginTop: 20,
  },
  fullWidth: {
    flex: 1,
  },
});
