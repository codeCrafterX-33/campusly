import { View, Text, StyleSheet, Image } from "react-native";
import Colors from "../../constants/Colors";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Header() {
  const { user } = useContext(AuthContext);
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Hey there! </Text>
        <Text style={styles.name}>{user?.name}</Text>
      </View>
      <Image source={{ uri: user?.image }} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  name: {
    fontSize: 18,
    color: Colors.GRAY,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
});
