import { createContext, useState, useContext } from "react";
import usePersistedState from "../util/PersistedState";
import axios, { AxiosError } from "axios";
import React from "react";
import Toast from "react-native-toast-message";
import { AuthContext } from "./AuthContext";

const ClubContext = createContext<any>({
  clubs: [],
  setClubs: () => {},
  getClubs: () => {},
  getFollowedClubs: () => {},
  followedClubs: [],
  setFollowedClubs: () => {},
  getUserCreatedClubs: () => {},
  userCreatedClubs: [],
  setUserCreatedClubs: () => {},
  updateClub: () => {},
  deleteClub: () => {},
  refreshing: false,
  onRefresh: () => {},
});

function ClubProvider({ children }: { children: React.ReactNode }) {
  const [clubs, setClubs] = usePersistedState("clubs", []);
  const [refreshing, setRefreshing] = useState(false);
  const [followedClubs, setFollowedClubs] = usePersistedState(
    "followedClubs",
    []
  );
  const [userCreatedClubs, setUserCreatedClubs] = usePersistedState(
    "userCreatedClubs",
    []
  );
  const { userData } = useContext(AuthContext);

  const getClubs = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/club`
      );

      if (userData?.email) {
        await getFollowedClubs();
        await getUserCreatedClubs();
      }

      if (response.status === 200) {
        setClubs(response.data.data);
        console.log("Clubs fetched successfully");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data);
        Toast.show({
          text1: "Couldn't load clubs",
          text2: "Please check your internet or try again later.",
          type: "error",
        });
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getClubs();
    setRefreshing(false);
  };

  const getFollowedClubs = async () => {
    try {
      if (!userData || !userData.id) {
        console.log(
          "Cannot fetch followed clubs: User not logged in or id missing"
        );
        Toast.show({
          text1: "Cannot load followed clubs",
          text2: "Please log in to view your followed clubs.",
          type: "error",
        });
        return;
      }
      if (userData.id) {
        const response = await axios.get(
          `${
            process.env.EXPO_PUBLIC_SERVER_URL
          }/club/followedclubs/${encodeURIComponent(userData.id)}`
        );
        if (response.status === 200) {
          setFollowedClubs(response.data.data);
          console.log("Club followers fetched successfully");
        }
      }
    } catch (error) {
      console.log("Error fetching followed clubs:", error);
      Toast.show({
        text1: "Couldn't load followed clubs",
        text2: "Please check your internet or try again later.",
        type: "error",
      });
    }
  };

  const getUserCreatedClubs = async () => {
    try {
      if (!userData || !userData.id) {
        console.log(
          "Cannot fetch user created clubs: User not logged in or id missing"
        );
        return;
      }

      const response = await axios.get(
        `${
          process.env.EXPO_PUBLIC_SERVER_URL
        }/club/userclubs/${encodeURIComponent(userData.id)}`
      );

      if (response.status === 200) {
        setUserCreatedClubs(response.data.data);
        console.log("User created clubs fetched successfully");
      }
    } catch (error) {
      console.log("Error fetching user created clubs:", error);
      Toast.show({
        text1: "Couldn't load your clubs",
        text2: "Please check your internet or try again later.",
        type: "error",
      });
    }
  };

  const updateClub = async (clubId: number, clubData: any) => {
    try {
      if (!userData || !userData.email) {
        Toast.show({
          text1: "Cannot update club",
          text2: "Please log in to update your clubs.",
          type: "error",
        });
        return;
      }

      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/club/${clubId}`,
        {
          ...clubData,
          user_email: userData.email,
        }
      );

      if (response.status === 200) {
        Toast.show({
          text1: "Club updated successfully",
          type: "success",
        });
        // Refresh the clubs data
        await getClubs();
        return response.data.data;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message || "Club update failed";
        Toast.show({
          text1: "Update failed",
          text2: errorMessage,
          type: "error",
        });
      }
      throw error;
    }
  };

  const deleteClub = async (clubId: number) => {
    try {
      if (!userData || !userData.email) {
        Toast.show({
          text1: "Cannot delete club",
          text2: "Please log in to delete your clubs.",
          type: "error",
        });
        return;
      }

      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/club/${clubId}`,
        {
          data: { user_id: userData.id },
        }
      );

      if (response.status === 200) {
        Toast.show({
          text1: "Club deleted successfully",
          type: "success",
        });
        // Refresh the clubs data
        await getClubs();
        return true;
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.message || "Club deletion failed";
        Toast.show({
          text1: "Delete failed",
          text2: errorMessage,
          type: "error",
        });
      }
      throw error;
    }
  };

  const value = {
    clubs: clubs,
    setClubs: setClubs,
    getClubs: getClubs,
    refreshing: refreshing,
    onRefresh: onRefresh,
    getFollowedClubs: getFollowedClubs,
    followedClubs: followedClubs,
    setFollowedClubs: setFollowedClubs,
    getUserCreatedClubs: getUserCreatedClubs,
    userCreatedClubs: userCreatedClubs,
    setUserCreatedClubs: setUserCreatedClubs,
    updateClub: updateClub,
    deleteClub: deleteClub,
  };

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}
export { ClubContext, ClubProvider };
export default ClubProvider;
