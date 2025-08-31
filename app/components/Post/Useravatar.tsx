import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "react-native-paper";

import { Moment } from "../../util/Moment";
interface UserAvatarProps {
  name: string;
  image: string;
  date?: string;
  style?: StyleProp<ViewStyle>;
}

const UserAvatar = ({ name, image, date, style }: UserAvatarProps) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, style]}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.onBackground }]}>
            {name}
          </Text>
          {date && <Text style={styles.date}>{Moment(date || "")}</Text>}
        </View>
      </View>
      <Ionicons name="ellipsis-vertical" size={24} color="gray" />
    </View>
  );
};

export default UserAvatar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  textContainer: {
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 99,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    color: "gray",
  },
});
