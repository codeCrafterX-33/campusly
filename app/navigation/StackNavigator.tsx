import { createStackNavigator } from "@react-navigation/stack";
import LandingScreen from "../screens/landing";
import Home from "../screens/Home";
// @ts-ignore
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import SignIn from "../screens/(auth)/SignIn";
import SignUp from "../screens/(auth)/SignUp";
import TabLayout from "./TabLayout";
import AddPost from "../screens/AddPost";
import DrawerNavigator from "./DrawerNavigator";
import Event from "../screens/(tab)/Event";
import Profile from "../screens/(profile)/Profile";
import {
  TransitionPresets,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { TouchableOpacity, Easing } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ExploreClubs from "../screens/ExploreClubs";
import { useTheme } from "react-native-paper";
import CreateClub from "../screens/CreateClub";
import AddEvent from "../screens/AddEvent";
import AllActivityScreen from "../screens/allActivityScreen/AllActivityScreen";
import Colors from "../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import VerificationScreen from "../screens/(verificationScreen)/VerificationScreen";
import EmailVerificationScreen from "../screens/(verificationScreen)/EmailVerificationScreen";
import EditProfile from "../screens/(profile)/EditProfile";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import OTPVerificationScreen from "../screens/(verificationScreen)/OtpVerificationScreen";
import ProfileSetupScreen from "../screens/(profile)/ProfileSetupScreen";
import EditEducation from "../screens/(profile)/EditEducation";
import EditClub from "../screens/EditClub";
import ClubScreen from "../screens/ClubScreen";
import PostScreen from "../screens/PostScreen";
import CommentScreen from "../screens/CommentScreen";
import ClubMembers from "../screens/ClubMembers";
import ClubRules from "../screens/ClubRules";
import GradientHeader from "../components/GradientHeader";

export type RootStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  TabLayout: undefined;
  AddPost: undefined;
  Event: undefined;
  Profile: {
    user_id?: string;
    firstname?: string;
    lastname?: string;
    username?: string;
    image?: string;
    studentstatusverified?: boolean;
    headline?: string;
    about?: string;
    school?: string;
    city?: string;
    country?: string;
    joined_at?: string;
    skills?: string[];
    interests?: string[];
  };
  DrawerNavigator: undefined;
  ExploreClubs: undefined;
  CreateClub: undefined;
  AddEvent: undefined;
  AllActivityScreen: {
    activeTab?: string;
    user_id?: string;
  };
  VerificationScreen: undefined;
  EmailVerificationScreen: { selectedSchool: any };
  ProfileSetupScreen: undefined;
  OTPVerificationScreen: { email: string };
  EditProfile: {
    userEmail?: string;
    sectionToEdit?: string;
  };
  EditEducation: {
    userEmail?: string;
    sectionToEdit?: string;
  };
  EditClub: { club: any };
  ClubScreen: { club: any };
  PostScreen: {
    post: any;
    threadHistory?: any[];
  };
  CommentScreen: {
    post: any;
    parentComment?: any;
    onCommentPosted?: (updatedComment: any) => void;
  };
  "Add-Post": undefined;
  ClubMembers: { club: any };
  ClubRules: { club: any };
};

const Stack = createStackNavigator<RootStackParamList>();

// Custom transition configurations
const customTransition = {
  gestureDirection: "horizontal" as const,
  transitionSpec: {
    open: {
      animation: "timing" as const,
      config: {
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      },
    },
    close: {
      animation: "timing" as const,
      config: {
        duration: 300,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      },
    },
  },
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

const fadeTransition = {
  gestureDirection: "vertical" as const,
  transitionSpec: {
    open: {
      animation: "timing" as const,
      config: {
        duration: 400,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      },
    },
    close: {
      animation: "timing" as const,
      config: {
        duration: 400,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      },
    },
  },
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
};

export const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        gestureEnabled: true,
        ...customTransition,
      }}
    >
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{
          headerShown: false,
          headerTitle: "",
          ...fadeTransition,
        }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{
          headerTitle: "",
          headerTransparent: true,
          ...fadeTransition,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{
          headerTitle: "",
          headerTransparent: true,
          ...fadeTransition,
        }}
      />
    </Stack.Navigator>
  );
};

export const AuthenticatedStack = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { userData, getUser } = useContext(AuthContext);

  useEffect(() => {
    getUser();
    console.log("User Data fetched successsfully");
  }, [getUser, navigation]);

  return (
    <Stack.Navigator
      initialRouteName="DrawerNavigator"
      screenOptions={{
        gestureEnabled: true,
        ...customTransition,
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: colors.onBackground,
          fontSize: RFValue(18),
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="DrawerNavigator"
        component={DrawerNavigator}
        options={{
          headerShown: false,
          gestureEnabled: true,
          ...TransitionPresets.SlideFromLeftIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="AddPost"
        component={AddPost}
        options={{
          headerShown: true,
          headerTitle: "Add New Post",
          headerBackTitle: "Back",
          ...TransitionPresets.ModalSlideFromBottomIOS,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
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
          gestureEnabled: true,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        })}
      />

      <Stack.Screen
        name="CreateClub"
        component={CreateClub}
        options={({ navigation }) => ({
          headerShown: true,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
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
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />

      <Stack.Screen
        name="AllActivityScreen"
        component={AllActivityScreen}
        options={({ navigation }) => ({
          headerTitle: "All Activity",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.onBackground,
            fontSize: RFValue(16),
            marginLeft: RFValue(10),
          },

          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          headerLeft: () => (
            <TouchableOpacity
              style={{ paddingHorizontal: RFValue(7) }}
              onPress={() => navigation.goBack()}
            >
              <Icon
                name="arrow-left"
                size={RFValue(24)}
                color={Colors.PRIMARY}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="VerificationScreen"
        component={VerificationScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EmailVerificationScreen"
        component={EmailVerificationScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.PRIMARY,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: "white",
          headerTitle: "✨ Prove you're campus royalty!",
          headerTitleStyle: {
            color: "white",
            fontSize: RFValue(16),
            fontWeight: "600",
          },
        }}
      />

      <Stack.Screen
        name="ProfileSetupScreen"
        component={ProfileSetupScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          headerShown: true,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="OTPVerificationScreen"
        component={OTPVerificationScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.ModalSlideFromBottomIOS,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        }}
      />
      <Stack.Screen
        name="EditEducation"
        component={EditEducation}
        options={{
          headerShown: true,
          header: () => <GradientHeader title="Education" />,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="EditClub"
        component={EditClub}
        options={{
          headerShown: true,
          headerTitle: "Edit Club",
          headerLeft: () => null,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="ClubScreen"
        component={ClubScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="PostScreen"
        component={PostScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="CommentScreen"
        component={CommentScreen}
        options={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="ClubMembers"
        component={ClubMembers}
        options={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
      <Stack.Screen
        name="ClubRules"
        component={ClubRules}
        options={{
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      />
    </Stack.Navigator>
  );
};
