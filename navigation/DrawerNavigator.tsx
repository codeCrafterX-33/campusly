import React, { useContext } from "react";
import {
  createDrawerNavigator,
  DrawerNavigationProp,
} from "@react-navigation/drawer";
import { CustomDrawerContent } from "../components/Navigator/CustomDrawerContent";
import TabLayout from "./TabLayout";
import AddPost from "../screens/AddPost";
import Profile from "../screens/(tab)/Profile";
import { Dimensions, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TransitionPresets } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { Avatar } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import Colors from "../constants/Colors";
import { useTheme } from "react-native-paper";
const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const authCtx = useContext(AuthContext);
  const { colors, dark } = useTheme();
  return (
    <Drawer.Navigator
      key={dark ? "dark" : "light"}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        swipeEdgeWidth: Dimensions.get("window").width,

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
