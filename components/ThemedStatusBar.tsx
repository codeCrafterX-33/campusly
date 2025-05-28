import { StatusBar } from "react-native";
import { useThemeContext } from "../context/ThemeContext";

function ThemedStatusBar() {
  const { isDarkMode } = useThemeContext();

  return (
    <StatusBar
      barStyle={isDarkMode ? "light-content" : "dark-content"}
      backgroundColor={isDarkMode ? "#121212" : "#ffffff"}
      translucent={true}
    />
  );
}

export default ThemedStatusBar;
