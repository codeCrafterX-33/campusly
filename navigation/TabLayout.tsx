import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Clubs from "../screens/(tab)/Clubs";
import Profile from "../screens/(tab)/Profile";
import Event from "../screens/(tab)/Event";
import Home from "../screens/Home";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "../constants/Colors";
const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const { user } = useContext(AuthContext);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          marginBottom: 20,
          height: 70,
          borderRadius: 20,
          marginHorizontal: 10,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
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
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={{ uri: user?.image }}
              style={{ width: 24, height: size, borderRadius: 99 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
