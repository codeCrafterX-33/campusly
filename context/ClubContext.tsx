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
  const { user } = useContext(AuthContext);

  const getClubs = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/clubs`
      );

      if (user?.email) {
        await getFollowedClubs();
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
      if (!user || !user.email) {
        console.log(
          "Cannot fetch followed clubs: User not logged in or email missing"
        );
        Toast.show({
          text1: "Cannot load followed clubs",
          text2: "Please log in to view your followed clubs.",
          type: "error",
        });
        return;
      }
      if (user.email) {
        const response = await axios.get(
          `${
            process.env.EXPO_PUBLIC_SERVER_URL
          }/followedclubs/${encodeURIComponent(user.email)}`
        );
        if (response.status === 200) {
          setFollowedClubs(response.data.data);
          console.log(
            "Club followers fetched successfully",
            response.data.data
          );
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
  const value = {
    clubs: clubs,
    setClubs: setClubs,
    getClubs: getClubs,
    refreshing: refreshing,
    onRefresh: onRefresh,
    getFollowedClubs: getFollowedClubs,
    followedClubs: followedClubs,
    setFollowedClubs: setFollowedClubs,
  };

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}
export { ClubContext, ClubProvider };
export default ClubProvider;
