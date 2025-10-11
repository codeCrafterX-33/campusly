import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.onBackground,
          fontSize: RFValue(18),
          fontWeight: "600",
        },
        headerTintColor: colors.onBackground,
        headerTransparent: true,
        headerShown: false,
      }}
    >
      <Stack.Screen name="sign-in" options={{ headerTitle: "Sign In" }} />
      <Stack.Screen name="sign-up" options={{ headerTitle: "Sign Up" }} />
    </Stack>
  );
}
