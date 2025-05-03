// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "../components/Navigator/CustomDrawerContent";
import TabLayout from "./TabLayout";
import AddPost from "../screens/AddPost";
import Profile from "../screens/(tab)/Profile";
const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route, navigation }) => ({})}
    >
      <Drawer.Screen
        name="TabLayout"
        component={TabLayout}
        options={{
          title: "",
          headerShown: true,
          drawerItemStyle: {
            display: "none",

          },
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: true,
        }}
      />
    </Drawer.Navigator>
  );
}
