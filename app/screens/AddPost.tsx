import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
} from "react-native";
import UserAvatar from "../components/Post/Useravatar";
import { AuthContext } from "../context/AuthContext";
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import WritePost from "../components/Post/WritePost";
import { useTheme, IconButton } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
export default function AddPost() {
  const { userData } = useContext(AuthContext);
  const { colors } = useTheme();

  const navigation = useNavigation();

  useEffect(() => {
    const handleBackPress = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <UserAvatar
        name={userData?.name}
        image={userData?.image}
        date={new Date().toISOString()}
        style={{ backgroundColor: colors.background }}
      />
      <WritePost />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
});
