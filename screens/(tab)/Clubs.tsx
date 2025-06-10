import { View } from "react-native";
import ClubTopNavigator from "../../navigation/ClubTopNavigator";
import { FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
export default function Clubs() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <View style={{ flex: 1 }}>
      <ClubTopNavigator />
      <FAB
        icon="plus"
        label="Create Club"
        color="white"
        onPress={() => navigation.navigate("CreateClub")}
        style={{
          position: "absolute",
          bottom: RFValue(60),
          right: 20,
          zIndex: 1000,
          backgroundColor: Colors.PRIMARY,
        }}
      />
    </View>
  );
}
// Placeholder component for Clubs screen
