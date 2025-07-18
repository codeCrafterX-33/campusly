import { View, Text, StyleSheet, Image } from "react-native";
function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/my-splash.png")}
        style={styles.logo}
        resizeMode="cover"
      />
    </View>
  );
}

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  
});
