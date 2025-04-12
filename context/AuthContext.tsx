import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut, User } from "firebase/auth";
import { auth } from "../configs/FireBaseConfigs";
import axios from "axios";

const AuthContext = createContext<any>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

interface USER {
  id: number;
  name: string;
  email: string;
  image: string;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<USER>();

  const logout = async () => {
    await signOut(auth);
    setUserData(undefined);

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
