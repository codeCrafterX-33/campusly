import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { View, Dimensions } from "react-native";
import Colors from "../constants/Colors";
import ProfilePostsTab from "../components/Profile/ProfilePostsTab";
import ProfileEventTab from "../components/Profile/ProfileStudyTab";
import ProfileAboutTab from "../components/Profile/ProfileAboutTab";
import ProfileClubtab from "../components/Profile/ProfileClubtab";
import ProfileStudyTab from "../components/Profile/ProfileStudyTab";

const Tab = createMaterialTopTabNavigator();
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Placeholder tab components - replace with your actual components


export default function ProfileTopNavigator() {
  return (
    <View style={{ flex: 1 }}>
        
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: "#000" },
          tabBarLabelStyle: { color: "#fff", fontWeight: "bold" },
          tabBarIndicatorStyle: { backgroundColor: Colors.PRIMARY },
          lazy: false,
          swipeEnabled: true,
        }}
      >
        <Tab.Screen name="Posts" component={ProfilePostsTab} />
        <Tab.Screen name="Clubs" component={ProfileClubtab} />
        <Tab.Screen name="Study" component={ProfileStudyTab} />
        <Tab.Screen name="About" component={ProfileAboutTab} />
      </Tab.Navigator>
    </View>
  );
}
