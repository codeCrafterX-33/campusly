import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useEffect, useRef } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Colors from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "react-native-paper";

export default function CommentsTab({
  setShowCheckmark,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
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
        <Ionicons name="chatbubble-outline" size={42} color={Colors.PRIMARY} />
      </Animated.View>

      <Text style={[styles.title, { color: colors.onBackground }]}>
        You haven’t commented yet 🤐
      </Text>

      <Text style={[styles.subtitle, { color: Colors.GRAY }]}>
        Find a post that catches your eye and leave a comment. Share your
        thoughts, your vibes, or just drop an emoji 💬🔥
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("DrawerNavigator")}
      >
        <Text style={styles.buttonText}>Explore Posts</Text>
      </TouchableOpacity>
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
    fontSize: RFValue(12),
  },
});
