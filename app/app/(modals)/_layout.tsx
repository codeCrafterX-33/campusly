import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";

export default function ModalLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          color: colors.onBackground,
        },
        headerTintColor: colors.onBackground,
      }}
    >
      <Stack.Screen
        name="verification"
        options={{
          headerTitle: "Verification",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="otp-verification"
        options={{
          headerTitle: "OTP Verification",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
