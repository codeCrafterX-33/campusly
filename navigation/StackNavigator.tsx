import { createStackNavigator } from "@react-navigation/stack";
import LandingScreen from "../screens/landing";
import Home from "../screens/Home";
// @ts-ignore
import { NavigationContainer } from "@react-navigation/native";
import SignIn from "../screens/(auth)/SignIn";
import SignUp from "../screens/(auth)/SignUp";
import TabLayout from "./TabLayout";
import AddPost from "../screens/AddPost";
import DrawerNavigator from "./DrawerNavigator";
import Event from "../screens/(tab)/Event";
import Profile from "../screens/(tab)/Profile";
import { TransitionPresets } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
export type RootStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  TabLayout: undefined;
  AddPost: undefined;
  Event: undefined;
  Profile: undefined;
  DrawerNavigator: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const StackNavigator = () => {
  return (
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
  );
};

export const AuthenticatedStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="DrawerNavigator"
      screenOptions={{
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="DrawerNavigator"
        component={DrawerNavigator}
        options={{
          headerShown: false,
          gestureEnabled: true,
          ...TransitionPresets.SlideFromLeftIOS,
        }}
      />
      <Stack.Screen
        name="AddPost"
        component={AddPost}
        options={{
          headerShown: true,
          headerTitle: "Add New Post",
          headerBackTitle: "Back",
          animation: "slide_from_bottom",
        }}
      />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Profile",
          gestureEnabled: false,
          ...TransitionPresets.SlideFromRightIOS,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.replace("DrawerNavigator");
              }}
            >
              <Icon name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
};
