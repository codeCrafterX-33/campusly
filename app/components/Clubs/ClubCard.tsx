import { useTheme } from "react-native-paper";
import { View, Text, Image, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import Button from "../ui/Button";
import { useState, useContext } from "react";
import axios, { AxiosError } from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ClubContext } from "../../context/ClubContext";

import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";

export interface CLUB {
  id: number;
  name: string;
  club_logo: string;
  about: string;
  createdon: string;
  createdby: string;
  isAdmin: boolean;
  refreshData: () => void;
  isFollowed: boolean;
}

export default function ClubCard(club: CLUB) {
  const { colors } = useTheme();
  const { isDarkMode } = useThemeContext();
  const [isLoading, setIsLoading] = useState(false);
  const { getFollowedClubs } = useContext(ClubContext);
  const { user } = useContext(AuthContext);

  const onFollowBtnClick = async () => {
    setIsLoading(true);
    if (club.isFollowed) {
      try {
        const response = await axios.delete(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/club/unfollowclub/${user?.email}`,
          {
            data: { clubId: club?.id },
          }
        );
        await club.refreshData();

        if (response.status === 200) {
          console.log("Club unfollowed");
        } else {
          console.log("Club unfollow failed");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error.response?.data);
          Toast.show({
            text1: "Club unfollow failed",
            text2: "Please try again",
            type: "error",
          });
        }
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/club/followclub`,
          {
            clubId: club?.id,
            u_email: user?.email,
          }
        );

        await club.refreshData();

        if (response.status === 201) {
          console.log("Club followed");
        } else {
          console.log("Club unfollowed");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.log(error.response?.data);
          Toast.show({
            text1: "Club follow failed",
            text2: "Please try again",
            type: "error",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        !isDarkMode ? styles.containerLight : styles.containerDark,
      ]}
    >
      {club.isAdmin && <Text style={styles.adminText}>Admin</Text>}
      <Image
        source={{ uri: club.club_logo }}
        style={[
          styles.image,
          isDarkMode ? styles.imageDark : styles.imageLight,
        ]}
      />
      <Text
        style={[styles.name, !isDarkMode ? styles.nameLight : styles.nameDark]}
      >
        {club.name}
      </Text>
      <Text
        numberOfLines={2}
        style={[
          styles.about,
          !isDarkMode ? styles.aboutLight : styles.aboutDark,
        ]}
      >
        {club.about}
      </Text>

      <Button
        onPress={() => onFollowBtnClick()}
        isLoading={isLoading}
        outline={club.isFollowed}
        viewStyle={styles.button}
      >
        {club.isFollowed ? "Joined" : "Join"}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    padding: 15,
    borderRadius: 15,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  containerLight: {
    backgroundColor: "black",
  },

  containerDark: {
    backgroundColor: "white",
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
  },

  nameLight: {
    color: "white",
  },

  nameDark: {
    color: "black",
  },

  about: {
    fontSize: 14,
    textAlign: "center",
  },

  aboutLight: {
    color: Colors.GRAY,
  },

  aboutDark: {
    color: Colors.GRAY,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 99,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3.84,
    elevation: 7,
    marginBottom: 10,
  },
  imageLight: {
    shadowColor: "white",
    borderWidth: 1,
    borderColor: "white",
  },
  imageDark: {
    shadowColor: "black",
  },
  adminText: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#4B5563",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    margin: 5,
    padding: 5,
    borderRadius: 5,
  },
  button: {
    width: RFValue(70),
  },
});
