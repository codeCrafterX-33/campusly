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
import ExploreClubs from "../screens/ExploreClubs";
import { useTheme } from "react-native-paper";
import CreateClub from "../screens/CreateClub";
import AddEvent from "../screens/AddEvent";
import Profile2 from "../screens/(tab)/profile2";
import Profile3 from "../screens/(tab)/Profile3";
import Sticky from "../screens/(tab)/Sticky";
export type RootStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  TabLayout: undefined;
  AddPost: undefined;
  Event: undefined;
  Profile: undefined;
  DrawerNavigator: undefined;
  ExploreClubs: undefined;
  CreateClub: undefined;
  AddEvent: undefined;
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
    </Stack.Navigator>
  );
};

export const AuthenticatedStack = () => {
  const { colors } = useTheme();
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
          headerTransparent: true,
          headerTintColor: colors.onBackground,
          headerShown: false,
          headerTitle: "Profile",
          gestureEnabled: false,
          ...TransitionPresets.SlideFromRightIOS,
        })}
      />

      <Stack.Screen
        name="CreateClub"
        component={CreateClub}
        options={({ navigation }) => ({
          headerShown: true,
          ...TransitionPresets.SlideFromRightIOS,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={colors.onBackground} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="AddEvent"
        component={AddEvent}
        options={{
          headerShown: true,
          headerTitle: "Add Event",
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </Stack.Navigator>
  );
};
