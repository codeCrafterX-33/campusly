import {
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useContext, useEffect, useRef } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function LikesTab({
  setShowCheckmark,
  user_id,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
  user_id?: string;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { isDarkMode } = useContext(ThemeContext);
  const { colors } = useTheme();

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
        <Ionicons name="heart-outline" size={44} color={Colors.PRIMARY} />
      </Animated.View>

      <Text style={[styles.title, { color: colors.onBackground }]}>
        {user_id ? "No likes yet 💔" : "A little empty here 💔"}
      </Text>

      <Text style={[styles.subtitle, { color: Colors.GRAY }]}>
        {user_id
          ? "This user hasn't liked any posts yet."
          : "Show some love! Posts you like will land here "}
        {!user_id && (
          <Ionicons name="heart" size={RFValue(16)} color={Colors.PRIMARY} />
        )}
      </Text>

      {!user_id && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("DrawerNavigator")}
        >
          <Text style={styles.buttonText}>Explore Campus Feed</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: RFValue(18),
    marginTop: 16,
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    fontSize: RFValue(12),
    marginTop: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: RFValue(14),
  },
});
