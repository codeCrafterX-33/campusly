import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  BackHandler,
  SafeAreaView,
  ViewStyle,
  Pressable,
} from "react-native";
import HomeTopNavigator from "../navigation/HomeTopNavigator";
import AddPostBtn from "../components/Post/AddPostBtn";
import BackgroundPostIndicator from "../components/BackgroundPostIndicator";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { useLayoutEffect } from "react";

function Home() {
  const navigation = useNavigation<any>();

  useLayoutEffect(() => {
    // Disable drawer gesture while on this screen
    navigation.setOptions({ gestureEnabled: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <BackgroundPostIndicator />
      <HomeTopNavigator />
      <AddPostBtn style={styles.addPostBtn} />
    </View>
  );
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: 0,
  },
  addPostBtn: {
    position: "absolute",
    bottom: 90,
    right: 20,
    zIndex: 1000,
  },
});
