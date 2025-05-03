import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { RootStackParamList, RootTabParamList } from "../../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

const categories = [
  {
    name: "Upcoming Events",
    banner: require("../../assets/images/event.png"),
    navigateTo: "Event" as keyof RootTabParamList,
  },
  {
    name: "Latest Post",
    banner: require("../../assets/images/news.png"),
    navigateTo: "Home" as keyof RootTabParamList,
  },
  {
    name: "Clubs",
    banner: require("../../assets/images/clubs.png"),
    navigateTo: "Clubs" as keyof RootTabParamList,
  },
  {
    name: "Add New Post",
    banner: require("../../assets/images/add-post.png"),
    navigateTo: "Add-Post",
  },
];

export default function CategoryDrawer() {
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<RootStackParamList>,
        BottomTabNavigationProp<RootTabParamList>
      >
    >();

  const handleNavigation = (screen: string) => {
    if (screen === "Add-Post") {
      navigation.navigate("Add-Post");
    }
    if (screen === "Event") {
      navigation.navigate("Event");
    }
    if (screen === "Clubs") {
      navigation.navigate("Clubs");
    }
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      {categories.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.item}
          onPress={() => handleNavigation(item.navigateTo)}
        >
          <Image source={item.banner} style={styles.icon} />
          <Text style={styles.label}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 15,
  },
});
