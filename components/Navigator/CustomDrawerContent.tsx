// components/CustomDrawerContent.tsx or .js
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import CategoryDrawer from "./CategoryDrawer"; // vertical version of Category

const CustomDrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView contentContainerStyle={styles.scroll}>
      {/* User Profile Section */}
      <View style={styles.profile}>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>John Doe</Text>
      </View>

      {/* Drawer screen links */}
      <DrawerItemList {...props} /> 

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logout}
        onPress={() => console.log("Logout")}
      >
        <Text style={{ color: "red" }}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  profile: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  username: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,
  },
  logout: {
    marginTop: 30,
    marginLeft: 20,
  },
});
