import { createContext, useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut, User } from "firebase/auth";
import { auth } from "../configs/FireBaseConfigs";
import axios from "axios";
import usePersistedState from "../util/PersistedState";

const AuthContext = createContext<any>({
  userData: null,
  setUserData: () => {},
  logout: () => {},
  getUser: () => {},
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = usePersistedState("userData", null);

  const logout = async () => {
    await auth.signOut();
    try {
      // Remove specific item (e.g., user data)
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("posts");

      // Optionally navigate the user to a login screen or perform other logout actions
      console.log("User logged out and AsyncStorage cleared!");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }

    console.log("logged out");
  };

  const getUser = useCallback(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser?.email) {
        try {
          const response = await axios.get(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${currentUser.email}`
          );
          setUserData(response.data.data[0]);
          console.log("User data:", response.data.data[0]);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    userData: userData,
    setUserData: setUserData,
    logout: logout,
    getUser: getUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
