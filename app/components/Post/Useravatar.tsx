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
  studentstatusverified?: boolean;
  fullname?: string;
  username?: string;
}

const UserAvatar = ({
  name,
  image,
  date,
  style,
  studentstatusverified,
  fullname,
  username,
}: UserAvatarProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <View style={styles.nameWithVerification}>
              <Text style={[styles.name, { color: colors.onBackground }]}>
                {fullname || name}
              </Text>
              {studentstatusverified && (
                <View style={styles.greenCheckBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                </View>
              )}
              {studentstatusverified && (
                <View style={styles.verificationBadge}>
                  <Text style={styles.verificationText}>🎓</Text>
                </View>
              )}
            </View>
            {username && (
              <Text style={styles.username}>
                @{username.replace(/\s+/g, "")}
              </Text>
            )}
          </View>
          {date && <Text style={styles.date}>{Moment(date || "")}</Text>}
        </View>
      </View>
    </View>
  );
};

export default UserAvatar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
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
  nameWithVerification: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  verificationBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    borderWidth: 1,
    borderColor: "#000",
  },
  verificationText: {
    fontSize: 10,
  },
  greenCheckBadge: {
    marginLeft: 4,
  },
  username: {
    fontSize: 12,
    color: "gray",
    marginLeft: 8,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: "gray",
  },
});
