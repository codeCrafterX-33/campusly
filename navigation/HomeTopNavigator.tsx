import React, { useCallback } from "react";
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
import { Colors } from "react-native/Libraries/NewAppScreen";
const TopTab = createMaterialTopTabNavigator();

export default function HomeTopNavigator() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  // Get the parent navigator (drawer)
  const parentDrawer = navigation.getParent();

  // Use focus effect to manage drawer gestures
  useFocusEffect(
    useCallback(() => {
      // When screen comes into focus, disable drawer gestures
      if (parentDrawer) {
        parentDrawer.setOptions({
          swipeEnabled: false,
        });
      }

      // When screen goes out of focus, re-enable drawer gestures
      return () => {
        if (parentDrawer) {
          parentDrawer.setOptions({
            swipeEnabled: true,
          });
        }
      };
    }, [parentDrawer])
  );

  return (
    <TopTab.Navigator
      screenOptions={{
        swipeEnabled: true,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        tabBarLabelStyle: {
          color: colors.onBackground,
          fontSize: 16,
          fontWeight: "bold",
                  
        },
        tabBarIndicatorStyle: {
          backgroundColor: Colors.primary,
        },
      }}
    >
      <TopTab.Screen name="for-you" component={ForYouScreen} options={{
        tabBarLabel: "For You",
      }}/>
      <TopTab.Screen name="following" component={FollowingScreen} options={{
        tabBarLabel: "Following",
      }}/>
    </TopTab.Navigator>
  );
}
