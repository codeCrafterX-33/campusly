import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface AddPostBtnProps {
  style?: ViewStyle;
}

const AddPostBtn: React.FC<AddPostBtnProps> = ({ style }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleAddPost = () => {
    navigation.navigate("AddPost");
  };

  return (
    <View style={style}>
      <Pressable style={styles.btn} onPress={handleAddPost}>
        <Ionicons name="add" size={24} color={Colors.WHITE} />
      </Pressable>
    </View>
  );
};

export default AddPostBtn;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.PRIMARY,
    padding: 10,
    borderRadius: 10,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 50,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
