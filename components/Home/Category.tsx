import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

const categories = [
  {
    name: "Upcoming Events",
    banner: require("../../assets/images/event.png"),
    navigateTo: "Event",
  },
  {
    name: "latest Post",
    banner: require("../../assets/images/news.png"),
    navigateTo: "Home",
  },
  {
    name: "Clubs",
    banner: require("../../assets/images/clubs.png"),
    navigateTo: "Clubs",
  },
  {
    name: "Add New Post",
    banner: require("../../assets/images/add-post.png"),
    navigateTo: "AddPost",
  },

  
];

export default function Category() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={() =>
              navigation.navigate(item.navigateTo as never)
            }
          >
            <Image source={item.banner} style={styles.banner} />
            <Text style={styles.cardText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  cardContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  banner: {
    height: 80,
    objectFit: "cover",
    width: Dimensions.get("window").width * 0.45,
  },
  cardText: {
    position: "absolute",
    fontSize: 17,
    fontWeight: 400,
    color: "white",
    padding: 10,
  },
});
