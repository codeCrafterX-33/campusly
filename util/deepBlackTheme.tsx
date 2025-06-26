// deepBlackTheme.js
import { MD3DarkTheme } from "react-native-paper";

export const DeepBlackTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#BB86FC",
    onPrimary: "#000000",
    background: "#000000",
    surface: "#000000",
    surfaceVariant: "#000000",
    onSurface: "#FFFFFF",
    text: "#FFFFFF",
    secondary: "#03DAC6",
    onSecondary: "#000000",
    outline: "#1A1A1A",
    elevation: {
      level0: "transparent",
      level1: "#000000",
      level2: "#000000",
      level3: "#000000",
      level4: "#000000",
      level5: "#000000",
    },
  },
};
