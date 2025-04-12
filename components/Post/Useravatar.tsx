import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface UserAvatarProps {
  name: string;
  image: string;
  date: string;
}

const UserAvatar = ({ name, image, date }: UserAvatarProps) => {
  return (
    <View>
      <View style={styles.container}>
        <Image source={{ uri: image }} style={styles.image} />
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.date}>{date}</Text>
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
    gap: 8,
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
