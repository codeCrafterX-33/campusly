import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Clubs from "../screens/(tab)/Clubs";
import Event from "../screens/(tab)/Event";
import Home from "../screens/Home";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Colors from "../constants/Colors";
import Message from "../screens/(tab)/Message";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { TouchableOpacity, View } from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useContext, useMemo } from "react";
import { PostContext } from "../context/PostContext";

const Tab = createBottomTabNavigator();

interface TabLayoutProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function TabLayout({ navigation }: TabLayoutProps) {
  const authCtx = useContext(AuthContext);
  const { colors } = useTheme();
  const { getPosts } = useContext(PostContext);


  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: colors.background,
          opacity: 0.8,
          height: 70,
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
        tabBarIconStyle: {
          marginBottom: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerLeft: () => {
            const navigation = useNavigation<DrawerNavigationProp<any>>();
            return (
              <TouchableOpacity
                onPress={() => navigation.openDrawer()}
                style={{ marginLeft: 10 }}
              >
                <Avatar.Image size={34} source={{ uri: authCtx.user?.image }} />
              </TouchableOpacity>
            );
          },
          headerTitle: "",

        }}
        listeners={{
          tabPress: () => {
            getPosts();
          },
        }}
      />
      <Tab.Screen
        name="Event"
        component={Event}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Clubs"
        component={Clubs}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="message"
        component={Message}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox-ellipses" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
