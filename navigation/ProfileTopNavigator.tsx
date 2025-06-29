import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { View, Text } from "react-native";
import Colors from "../constants/Colors";
import ProfilePostTab from "../components/Profile/profilePostTab";
import ProfileEventTab from "../components/Profile/ProfileStudyTab";
import ProfileAboutTab from "../components/Profile/ProfileAboutTab";
import ProfileClubtab from "../components/Profile/ProfileClubtab";
const Tab = createMaterialTopTabNavigator();

// Placeholder tab components - replace with your actual components


export default function ProfileTopNavigator() {
  return (
    <View style={{ flex: 1, height: 500 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: "#000" },
          tabBarLabelStyle: { color: "#fff", fontWeight: "bold" },
          tabBarIndicatorStyle: { backgroundColor: Colors.PRIMARY },
        }}
      >
        <Tab.Screen name="Posts" component={ProfilePostTab} />
        <Tab.Screen name="Clubs" component={ProfileClubtab} />
        <Tab.Screen name="About" component={ProfileAboutTab} />
      </Tab.Navigator>
    </View>
  );
}
