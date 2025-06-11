import React, { useCallback, useContext } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ForYouScreen from "../screens/(homeTopTab)/ForYou";
import FollowingScreen from "../screens/(homeTopTab)/Following";
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./StackNavigator";
import { useTheme } from "react-native-paper";
import Colors from "../constants/Colors";
import { FlatList, Text } from "react-native";
import { ClubContext } from "../context/ClubContext";
import CommunityScreen from "../screens/(homeTopTab)/CommunityScreen";
import Clubs from "../screens/ClubsHome";
import ExploreClubs from "../screens/ExploreClubs";
import { RFValue } from "react-native-responsive-fontsize";
const TopTab = createMaterialTopTabNavigator();

export default function ClubTopNavigator() {
  const { colors } = useTheme();
  const { followedClubs } = useContext(ClubContext);
  const navigation = useNavigation();
  // Get the parent navigator (drawer)
  const parentDrawer = navigation.getParent();

  // Use focus effect to manage drawer gestures
  useFocusEffect(
    useCallback(() => {
      // When screen comes into focus, disable drawer gestures
      if (parentDrawer) {
        parentDrawer.setOptions({
          swipeEnabled: true,
        });
      }
    }, [parentDrawer])
  );

  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarScrollEnabled: false,
        swipeEnabled: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 0.2,
          borderBottomColor: colors.onBackground,
        },
        tabBarLabelStyle: {
          color: colors.onBackground,
          fontSize: RFValue(16),
          fontWeight: "bold",
        },
        tabBarIndicatorStyle: {
          backgroundColor: Colors.PRIMARY,
        },
      }}
    >
      <TopTab.Screen
        name="Home"
        children={() => <Clubs />}
        options={{
          tabBarLabel: "Home",
          tabBarItemStyle: { flex: 1 },
        }}
      />
      <TopTab.Screen
        name="ExploreClubs"
        children={() => <ExploreClubs />}
        options={{
          tabBarLabel: "Explore Clubs",
        }}
      />
    </TopTab.Navigator>
  );
}
