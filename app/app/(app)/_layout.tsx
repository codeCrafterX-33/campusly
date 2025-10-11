import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import { Platform } from "react-native";

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          ...(Platform.OS === "android" && { elevation: 0 }),
          ...(Platform.OS === "ios" && { shadowOpacity: 0 }),
        },
        headerTitleStyle: {
          color: colors.onBackground,
          fontSize: RFValue(18),
          fontWeight: "600",
        },
        headerTintColor: colors.onBackground,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile/[id]"
        options={{
          headerTitle: "Profile",
          headerTransparent: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{
          headerTitle: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="profile/setup"
        options={{
          headerTitle: "Profile Setup",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="clubs/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="clubs/create"
        options={{
          headerTitle: "Create Club",
        }}
      />
      <Stack.Screen
        name="clubs/edit"
        options={{
          headerTitle: "Edit Club",
        }}
      />
      <Stack.Screen
        name="clubs/explore"
        options={{
          headerTitle: "Explore Clubs",
        }}
      />
      <Stack.Screen
        name="clubs/members"
        options={{
          headerTitle: "Club Members",
        }}
      />
      <Stack.Screen
        name="clubs/rules"
        options={{
          headerTitle: "Club Rules",
        }}
      />
      <Stack.Screen
        name="posts/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="posts/add"
        options={{
          headerTitle: "Add New Post",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="events/add"
        options={{
          headerTitle: "Add Event",
        }}
      />
      <Stack.Screen
        name="events/[id]"
        options={{
          headerTitle: "Event Details",
        }}
      />
      <Stack.Screen
        name="comments/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="activity/[type]"
        options={{
          headerTitle: "All Activity",
        }}
      />
    </Stack>
  );
}
