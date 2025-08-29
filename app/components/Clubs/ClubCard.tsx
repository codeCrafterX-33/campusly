import { useTheme } from "react-native-paper";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Colors from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import Button from "../ui/Button";
import { useState, useContext } from "react";
import axios, { AxiosError } from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ClubContext } from "../../context/ClubContext";
import Toast from "react-native-toast-message";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CampuslyAlert from "../CampuslyAlert";

export interface CLUB {
  id?: number;
  name?: string;
  club_logo?: string;
  about: string;
  createdon?: string;
  createdby?: string;
  isAdmin?: boolean;
  refreshData: () => void;
  isFollowed: boolean;
  showEditDelete?: boolean;
  user_id?: number;
  club_id?: number;
}

export default function ClubCard(club: CLUB) {
  const { colors } = useTheme();
  const { isDarkMode } = useThemeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { getFollowedClubs, updateClub, deleteClub, getUserCreatedClubs } =
    useContext(ClubContext);
  const { userData } = useContext(AuthContext);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const onFollowBtnClick = async () => {
    setIsLoading(true);
    if (club.isFollowed) {
      try {
        const response = await axios.delete(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/club/unfollowclub/${userData?.id}`,
          {
            data: { clubId: club.club_id || club.id },
          }
        );

        if (response.status === 200) {
          await getFollowedClubs();
          console.log("Club unfollowed");
        } else {
          console.log("Club unfollow failed");
        }
      } catch (error) {
        if (error instanceof AxiosError) {
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
          `${process.env.EXPO_PUBLIC_SERVER_URL}/club/followclub/${userData?.id}`,
          {
            clubId: club.id,
            user_email: userData?.email,
          }
        );

        if (response.status === 201) {
          await getFollowedClubs();
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

  const onCardPress = () => {
    // Only pass serializable club data, excluding functions
    const clubData = {
      id: club.id,
      name: club.name,
      about: club.about,
      club_logo: club.club_logo,
      createdby: club.createdby,
      createdon: club.createdon,
      isAdmin: club.isAdmin,
      isFollowed: club.isFollowed,
      user_id: club.user_id,
      club_id: club.club_id,
    };
    navigation.navigate("ClubScreen", { club: clubData });
  };

  const onEditClick = () => {
    // Only pass serializable club data, excluding functions
    const clubData = {
      id: club.id,
      name: club.name,
      about: club.about,
      club_logo: club.club_logo,
      createdby: club.createdby,
      createdon: club.createdon,
      isAdmin: club.isAdmin,
      isFollowed: club.isFollowed,
      user_id: club.user_id,
      club_id: club.club_id,
    };
    navigation.navigate("EditClub", { club: clubData });
  };

  const onDeleteClick = () => {
    setShowDeleteAlert(true);
  };

  const handleDeleteClub = async () => {
    setIsDeleting(true);
    try {
      await deleteClub(club.id);
      // Refresh both followed clubs and user created clubs
      await getFollowedClubs();
      await getUserCreatedClubs();
      setShowDeleteAlert(false);
    } catch (error) {
      console.log("Error deleting club:", error);
      setShowDeleteAlert(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isDarkMode ? styles.containerLight : styles.containerDark,
      ]}
      onPress={onCardPress}
      activeOpacity={0.8}
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

      {club.showEditDelete ? (
        // Edit and Delete buttons for user-created clubs
        <View style={styles.buttonContainer}>
          <Button
            onPress={onEditClick}
            outline={true}
            viewStyle={[styles.button, styles.editButton]}
            smallText={true}
          >
            Edit
          </Button>
          <Button
            onPress={onDeleteClick}
            outline={false}
            viewStyle={[styles.button, styles.deleteButton]}
            smallText={true}
          >
            Delete
          </Button>
        </View>
      ) : (
        // Follow/Unfollow button for joined clubs
        <Button
          onPress={onFollowBtnClick}
          isLoading={isLoading}
          outline={club.isFollowed}
          viewStyle={[styles.button, styles.joinButton]}
        >
          {club.isFollowed ? "Joined" : "Join"}
        </Button>
      )}

      {/* Delete Club Alert */}
      <CampuslyAlert
        isVisible={showDeleteAlert}
        type="error"
        onClose={() => setShowDeleteAlert(false)}
        messages={{
          success: {
            title: "Success! 🎉",
            message: "Operation completed successfully!",
            icon: "✅",
          },
          error: {
            title: "Wait! 🚨",
            message: `Are you sure you want to delete "${club.name}"? This action is like dropping your favorite class - there's no going back! 📚💔`,
            icon: "🗑️",
          },
        }}
        onPress={handleDeleteClub}
        onPress2={() => setShowDeleteAlert(false)}
        buttonText="Yes, Delete It"
        buttonText2="Nevermind"
        overrideDefault={true}
        isLoading={isDeleting}
        loadingText="Deleting club..."
      />
    </TouchableOpacity>
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
    flex: 1,
    minWidth: RFValue(60),
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  editButton: {
    flex: 1,
    height: RFValue(40),
    minWidth: RFValue(60),
  },
  deleteButton: {
    flex: 1,
    height: RFValue(40),
    minWidth: RFValue(60),
    backgroundColor: "#EF4444",
  },
  joinButton: {
    marginTop: 12,
  },
});
