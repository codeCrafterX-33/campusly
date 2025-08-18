import { View, Text } from "react-native";
import React from "react";

export default function EditProfile({ route }: { route: any }) {
  const { userEmail, profileToShow } = route.params;
  return (
    <View>
      <Text>EditProfile</Text>
    </View>
  );
}
