import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut, User } from "firebase/auth";
import { auth } from "../configs/FireBaseConfigs";
import axios from "axios";
import usePersistedState from "../util/PersistedState";

const AuthContext = createContext<any>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = usePersistedState("userData", null);

  const logout = async () => {
    await signOut(auth);
    try {
      // Remove specific item (e.g., user data)
      await AsyncStorage.removeItem("userData");

      // Optionally navigate the user to a login screen or perform other logout actions
      console.log("User logged out and AsyncStorage cleared!");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }

    console.log("logged out");
  };

  const value = {
    user: userData,
    setUser: setUserData,
    logout: logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
