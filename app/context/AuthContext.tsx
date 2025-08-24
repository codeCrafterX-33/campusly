import { createContext, useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut, User } from "firebase/auth";
import { auth } from "../configs/FireBaseConfigs";
import axios from "axios";
import usePersistedState from "../util/PersistedState";

const AuthContext = createContext<any>({
  userData: null,
  setUserData: () => {},
  education: [],
  setEducation: () => {},
  logout: () => {},
  getUser: () => {},
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = usePersistedState("userData", null);
  const [education, setEducation] = usePersistedState("education", []);

  const logout = async () => {
    await auth.signOut();
    try {
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("education");
      await AsyncStorage.removeItem("posts");

      console.log("User logged out and AsyncStorage cleared!");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const getUser = useCallback(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser?.email) {
        try {
          // Fetch user data
          const userResponse = await axios.get(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${currentUser.email}`
          );
          setUserData(userResponse.data.data[0]);
          console.log("User data:", userResponse.data.data[0]);

          // Fetch education data
          try {
            const educationResponse = await axios.get(
              `${process.env.EXPO_PUBLIC_SERVER_URL}/education/${currentUser.email}`
            );
            setEducation(educationResponse.data.data || []);
            console.log("Education data:", educationResponse.data.data);
          } catch (educationError) {
            console.error("Failed to fetch education data:", educationError);
            setEducation([]); // Set empty array if education fetch fails
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setEducation([]); // Set empty array if user fetch fails
        }
      } else {
        // No user logged in, clear education state
        setEducation([]);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    userData: userData,
    setUserData: setUserData,
    education: education,
    setEducation: setEducation,
    logout: logout,
    getUser: getUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
