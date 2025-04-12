import { View, StyleSheet } from "react-native";
import UserAvatar from "../components/Post/Useravatar";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export default function AddPost() {
  const { user } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <UserAvatar name={user?.name} image={user?.image} date="Now" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
