import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "../screens/landing";
import Home from "../screens/Home";
// @ts-ignore
import { NavigationContainer } from "@react-navigation/native";
import SignIn from "../screens/(auth)/SignIn";
import SignUp from "../screens/(auth)/SignUp";
import TabLayout from "./TabLayout";
import AddPost from "../screens/AddPost";
export type RootStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  TabLayout: undefined;
  AddPost: undefined;
};

const Stack = createNativeStackNavigator();

export const StackNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false, headerTitle: "" }}
        />

        <Stack.Screen
          name="SignIn"
          component={SignIn}
          options={{ headerTitle: "", headerTransparent: true }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{ headerTitle: "", headerTransparent: true }}
        />

        <Stack.Screen
          name="TabLayout"
          component={TabLayout}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const AuthenticatedStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TabLayout">
        <Stack.Screen
          name="TabLayout"
          component={TabLayout}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddPost"
          component={AddPost}
          options={{
            headerShown: true,
            headerTitle: "Add Post",
            headerBackTitle: "Back",
            animation: "slide_from_bottom",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
