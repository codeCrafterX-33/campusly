import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Animated,
  BackHandler,
  Dimensions,
} from "react-native";
import { useTheme } from "react-native-paper";
import Button from "../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState, useLayoutEffect, useContext } from "react";
import EventCard from "../../components/Events/EventCard";
import { EventContext } from "../../context/EventContext";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import Colors from "../../constants/Colors";
import { auth } from "../../configs/FireBaseConfigs";
import { RFValue } from "react-native-responsive-fontsize";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

type EventViewProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type Event = {
  id: number;
  name: string;
  bannerurl: string;
  location: string;
  link: string;
  event_date: string;
  event_time: string;
  createdBy: string;
  username: string;
};

export default function EventView({ navigation }: EventViewProps) {
  const { userData } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const {
    getEvents,
    events,
    refreshing,
    onRefresh,
    setRefreshing,
    getRegisteredEvents,
    registeredEvents,
    eventIsRegistered,
    getUserCreatedEvents,
    userCreatedEvents,
  } = useContext(EventContext);

  // Get the root navigation for complex navigation
  const rootNavigation = useNavigation();

  useEffect(() => {
    const handleBackPress = () => {
      // Check if there's a previous screen in the navigation stack
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true; // Prevent default back behavior
      }

      // If we can't go back, try to navigate to a specific screen
      // This handles the case when Event is accessed from AllActivityScreen
      try {
        // Try to navigate to the main screen (Home tab)
        (rootNavigation as any).navigate("DrawerNavigator", {
          screen: "TabLayout",
          params: {
            screen: "Home",
          },
        });
        return true; // Prevent default back behavior
      } catch (error) {
        // If navigation fails, allow default back behavior (exit app)
        return false;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [navigation, rootNavigation]);

  useLayoutEffect(() => {
    getEvents();
  }, []);

  const isCreator = (createdBy: string) => {
    return createdBy === auth.currentUser?.email;
  };

  const { colors } = useTheme();

  const [filter, setFilter] = useState("upcoming");
  const [animatedValue] = useState(new Animated.Value(0));
  const [animatedScale] = useState(new Animated.Value(1));

  const animateFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(animatedScale, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Create animated style properties with more dramatic transitions
  const upcomingFilterStyle = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        filter === "upcoming" ? Colors.PRIMARY : "transparent",
        filter === "upcoming" ? "#a0a0a0" : "#f0f0f0",
        filter === "upcoming" ? Colors.PRIMARY : "transparent",
      ],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        filter === "upcoming" ? "white" : Colors.PRIMARY,
        "#707070", // Intermediate color
        filter === "upcoming" ? "white" : Colors.PRIMARY,
      ],
    }),
    transform: [
      {
        scale: animatedScale.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.95, 1],
        }),
      },
    ],
    opacity: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.9, 0.8, 1],
    }),
  };

  const registeredFilterStyle = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        filter === "registered" ? Colors.PRIMARY : "transparent",
        filter === "registered" ? "#a0a0a0" : "#f0f0f0", // Intermediate color
        filter === "registered" ? Colors.PRIMARY : "transparent",
      ],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        filter === "registered" ? "white" : Colors.PRIMARY,
        "#707070", // Intermediate color
        filter === "registered" ? "white" : Colors.PRIMARY,
      ],
    }),
    transform: [
      {
        scale: animatedScale.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.95, 1],
        }),
      },
    ],
    opacity: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.9, 0.8, 1],
    }),
  };

  const myEventsFilterStyle = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        filter === "myEvents" ? Colors.PRIMARY : "transparent",
        filter === "myEvents" ? "#a0a0a0" : "#f0f0f0",
        filter === "myEvents" ? Colors.PRIMARY : "transparent",
      ],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        filter === "myEvents" ? "white" : Colors.PRIMARY,
        "#707070",
        filter === "myEvents" ? "white" : Colors.PRIMARY,
      ],
    }),
    transform: [
      {
        scale: animatedScale.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 0.95, 1],
        }),
      },
    ],
    opacity: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.9, 0.8, 1],
    }),
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[Colors.PRIMARY, Colors.GRAY]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Events</Text>
            <Text style={styles.headerSubtitle}>Discover & Connect</Text>
          </View>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              navigation.navigate("AddEvent");
            }}
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Modern Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterBackground}>
          <Pressable
            style={styles.filter}
            onPress={() => {
              animateFilterChange("upcoming");
              getEvents();
            }}
          >
            <Animated.Text
              style={[
                styles.eventFilter,
                filter === "upcoming" ? styles.activeEventFilter : {},
                {
                  backgroundColor: upcomingFilterStyle.backgroundColor,
                  color: upcomingFilterStyle.color,
                  opacity: upcomingFilterStyle.opacity,
                  transform: upcomingFilterStyle.transform,
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={filter === "upcoming" ? "white" : Colors.PRIMARY}
                style={{ marginRight: 6 }}
              />
              Upcoming
            </Animated.Text>
          </Pressable>
          <Pressable
            style={styles.filter}
            onPress={() => {
              animateFilterChange("registered");
              getRegisteredEvents();
            }}
          >
            <Animated.Text
              style={[
                styles.eventFilter,
                filter === "registered" ? styles.activeEventFilter : {},
                {
                  backgroundColor: registeredFilterStyle.backgroundColor,
                  color: registeredFilterStyle.color,
                  opacity: registeredFilterStyle.opacity,
                  transform: registeredFilterStyle.transform,
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={filter === "registered" ? "white" : Colors.PRIMARY}
                style={{ marginRight: 6 }}
              />
              Registered
            </Animated.Text>
          </Pressable>
          <Pressable
            style={styles.filter}
            onPress={() => {
              animateFilterChange("myEvents");
              getUserCreatedEvents();
            }}
          >
            <Animated.Text
              style={[
                styles.eventFilter,
                filter === "myEvents" ? styles.activeEventFilter : {},
                {
                  backgroundColor: myEventsFilterStyle.backgroundColor,
                  color: myEventsFilterStyle.color,
                  opacity: myEventsFilterStyle.opacity,
                  transform: myEventsFilterStyle.transform,
                },
              ]}
            >
              <Ionicons
                name="star-outline"
                size={16}
                color={filter === "myEvents" ? "white" : Colors.PRIMARY}
                style={{ marginRight: 6 }}
              />
              My Events
            </Animated.Text>
          </Pressable>
        </View>
      </View>

      {/* Empty States with Modern Design */}
      {filter === "registered" && registeredEvents.length <= 0 && (
        <View style={styles.emptyStateContainer}>
          <View
            style={[
              styles.emptyStateCard,
              {
                backgroundColor: isDarkMode ? "#ffffff" : "#000000",
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={64}
              color={isDarkMode ? Colors.GRAY : "#ffffff"}
            />
            <Text
              style={[
                styles.emptyStateTitle,
                {
                  color: isDarkMode ? "#000000" : "#ffffff",
                },
              ]}
            >
              No Events Yet
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                {
                  color: isDarkMode ? "#000000" : "#ffffff",
                },
              ]}
            >
              You haven't registered for any events yet. 🧐
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                {
                  color: isDarkMode ? "#000000" : "#ffffff",
                },
              ]}
            >
              Go explore and find something exciting! 🎉
            </Text>
          </View>
        </View>
      )}

      {filter === "myEvents" && userCreatedEvents.length <= 0 && (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateCard}>
            <Ionicons name="star-outline" size={64} color={Colors.GRAY} />
            <Text
              style={[styles.emptyStateTitle, { color: colors.onBackground }]}
            >
              Create Your First Event
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.onBackground },
              ]}
            >
              You haven't created any events yet! 🎭
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.onBackground },
              ]}
            >
              Tap the + button to create your first event! ✨
            </Text>
          </View>
        </View>
      )}

      {filter === "upcoming" && events.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateCard}>
            <Ionicons name="time-outline" size={64} color={Colors.GRAY} />
            <Text
              style={[styles.emptyStateTitle, { color: colors.onBackground }]}
            >
              No Upcoming Events
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.onBackground },
              ]}
            >
              🚫 No upcoming events for now.
            </Text>
            <Text
              style={[
                styles.emptyStateSubtitle,
                { color: colors.onBackground },
              ]}
            >
              But hey, stay tuned — cool stuff is on the way! 🔔
            </Text>
          </View>
        </View>
      )}
      
      {/* Events List */}
      <FlatList
        data={
          filter === "upcoming"
            ? events.filter((event: any) => event.user_id !== userData?.id) // Filter out user's own events from upcoming
            : filter === "registered"
            ? registeredEvents
            : userCreatedEvents
        }
        renderItem={({ item, index }) => {
          // Determine if this event is created by the current user
          const isCreatedByUser =
            parseInt(item.user_id) === parseInt(userData?.id);
          console.log(
            "isCreatedByUser",
            isCreatedByUser,
            "item.name",
            item.name,
            "item.user_id",
            item.user_id,
            "userData?.id",
            userData?.id
          );

          return (
            <EventCard
              {...item}
              filter={filter}
              isRegistered={eventIsRegistered(item.id)}
              isCreatedByUser={isCreatedByUser}
              refreshData={
                filter === "upcoming"
                  ? getEvents
                  : filter === "registered"
                  ? getRegisteredEvents
                  : getUserCreatedEvents
              }
            />
          );
        }}
        keyExtractor={(item: any) => item.id + Math.random() + item.event_date}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              filter === "upcoming"
                ? onRefresh
                : filter === "registered"
                ? getRegisteredEvents
                : getUserCreatedEvents
            }
            tintColor={Colors.PRIMARY}
            colors={[Colors.PRIMARY]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: RFValue(32),
    fontWeight: "800",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: RFValue(14),
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  filterBackground: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filter: {
    flex: 1,
    marginHorizontal: 2,
  },
  eventFilter: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    textAlign: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  activeEventFilter: {
    fontSize: RFValue(14),
    fontWeight: "700",
    backgroundColor: Colors.PRIMARY,
    color: "white",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    textAlign: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: "100%",
  },
  emptyStateTitle: {
    fontSize: RFValue(20),
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: RFValue(14),
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});
