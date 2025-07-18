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

const TopTab = createMaterialTopTabNavigator();

export default function HomeTopNavigator() {
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
        tabBarScrollEnabled: true,
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
          backgroundColor: Colors.PRIMARY,
        },
      }}
    >
      <TopTab.Screen
        name="for-you"
        children={() => <ForYouScreen />}
        options={{
          tabBarLabel: "For You",
          tabBarItemStyle: { flex: 1 },
        }}
      />
      <TopTab.Screen
        name="following"
        children={() => <FollowingScreen clubId={6} />}
      />

      {followedClubs &&
        followedClubs.map((club: any, index: number) => {
          const isLast = index === followedClubs.length - 1;
          return (
            <TopTab.Screen
              key={club.id}
              name={club.name + " " + club.id}
              children={() => (
                <CommunityScreen club_id={club.club_id.toString()} />
              )}
              options={{
                tabBarLabel: club.name,
              }}
            />
          );
        })}
    </TopTab.Navigator>
  );
}
