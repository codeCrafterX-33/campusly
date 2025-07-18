import React, { useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { CustomDrawerContent } from "../components/Navigator/CustomDrawerContent";
import TabLayout from "./TabLayout";
import { Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import { DrawerNavigationOptions } from "@react-navigation/drawer";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const authCtx = useContext(AuthContext);
  const { colors, dark } = useTheme();

  return (
    <Drawer.Navigator
      key={dark ? "dark" : "light"}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        swipeEnabled: true,
        swipeEdgeWidth: Dimensions.get("window").width * 1,
        drawerType: "front",
        headerStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Drawer.Screen
        name="TabLayout"
        component={TabLayout}
        options={{
          title: "",
          headerShown: false,
          drawerItemStyle: {
            display: "none",
          },
        }}
      />
    </Drawer.Navigator>
  );
}
