// ThemeContext.js
import React, { createContext, useState, useContext } from "react";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import usePersistedState from "../util/PersistedState";
import { DeepBlackTheme } from "../util/deepBlackTheme";

export const ThemeContext = createContext({
  isDarkMode: false,
  setIsDarkMode: (isDarkMode: boolean) => {},
  theme: MD3LightTheme,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = usePersistedState("isDarkMode", null);

  const theme = isDarkMode ? DeepBlackTheme : MD3LightTheme;

  

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  return useContext(ThemeContext);
};
