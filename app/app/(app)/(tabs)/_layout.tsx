import { Tabs } from "expo-router";
import React from "react";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Colors from "@/constants/Colors";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: colors.onSurface,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: RFValue(12),
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: "Clubs",
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size || 24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
