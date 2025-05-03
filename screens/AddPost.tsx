import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import UserAvatar from "../components/Post/Useravatar";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import WritePost from "../components/Post/WritePost";

export default function AddPost() {
  const { user } = useContext(AuthContext);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <UserAvatar name={user?.name} image={user?.image} date="Now" />
        <WritePost />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
