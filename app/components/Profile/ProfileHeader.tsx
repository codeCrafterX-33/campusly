import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
import { useNavigation } from "@react-navigation/native";

const COVER_HEIGHT = 200;
const PROFILE_IMAGE_SIZE = 80;

interface ProfileHeaderProps {
  scrollY: Animated.Value;
  user_id: string;
}

const ProfileHeader = ({ scrollY, user_id }: ProfileHeaderProps) => {
  const { userData } = useContext(AuthContext);
  const loggedInUser = user_id === userData?.email;

  const navigation = useNavigation<any>();

  const profileImageScale = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT / 2, COVER_HEIGHT],
    outputRange: [1, 0.6, 0.3],
    extrapolate: "clamp",
  });

  const profileImageTranslateY = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT / 2, COVER_HEIGHT],
    outputRange: [0, -10, -30],
    extrapolate: "clamp",
  });

  // Add opacity fade for more dramatic effect
  const profileImageOpacity = scrollY.interpolate({
    inputRange: [0, COVER_HEIGHT / 2, COVER_HEIGHT],
    outputRange: [1, 0.8, 0.4],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.profileHeader}>
      <Animated.View
        style={[
          styles.profileImageContainer,
          {
            transform: [
              { scale: profileImageScale },
              { translateY: profileImageTranslateY },
            ],
            opacity: profileImageOpacity,
          },
        ]}
      >
        <Image
          source={{
            uri: userData?.image,
          }}
          style={styles.profileImage}
        />
        <View style={styles.verificationBadge}>
          <Text style={styles.verificationText}>🎓</Text>
        </View>
      </Animated.View>

      {loggedInUser ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditProfile", {
              userEmail: userData?.email,
              sectionToShow: "Profileabout",
            })
          }
          style={{ marginLeft: 16 }}
        >
          <Ionicons
            name="create-outline"
            size={RFValue(24)}
            color={Colors.PRIMARY}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={loggedInUser ? styles.editProfileButton : styles.followButton}
        >
          <Text style={styles.editProfileButtonText}>"Follow"</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: -40,
    marginBottom: 12,
  },
  profileImageContainer: {
    borderWidth: 4,
    borderColor: "#000",
    borderRadius: PROFILE_IMAGE_SIZE / 2,
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
  },
  verificationBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
  },
  verificationText: {
    fontSize: 12,
  },
  followButton: {
    backgroundColor: "#1DA1F2",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  editProfileButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
});
