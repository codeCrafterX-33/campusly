import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Animated,
} from "react-native";
import { useTheme } from "react-native-paper";
import Button from "../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import axios from "axios";
import { useEffect, useState, useLayoutEffect, useContext } from "react";
import EventCard from "../../components/Events/EventCard";
import { EventContext } from "../../context/EventContext";
import Colors from "../../constants/Colors";
import { auth } from "../../configs/FireBaseConfigs";
import { RFValue } from "react-native-responsive-fontsize";


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
  const {
    getEvents,
    events,
    refreshing,
    onRefresh,
    setRefreshing,
    getRegisteredEvents,
    registeredEvents,
    eventIsRegistered,
  } = useContext(EventContext);

  useLayoutEffect(() => {
    getEvents();
  }, []);



  const isCreator = (createdBy: string) => {
    return createdBy === auth.currentUser?.email;
  };

  const { colors } = useTheme();

  const [filter, setFilter] = useState("upcoming");
  const [animatedValue] = useState(new Animated.Value(0));

  const animateFilterChange = (newFilter: string) => {
    if (filter !== newFilter) {
      setFilter(newFilter);
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };

  // Create animated style for scale and opacity effects
  const animatedScale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.95, 1],
  });

  // Create animated style properties with more dramatic transitions
  const upcomingFilterStyle = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        filter === "upcoming" ? Colors.PRIMARY : "white",
        filter === "upcoming" ? "#a0a0a0" : "#f0f0f0", // Intermediate color
        filter === "upcoming" ? Colors.PRIMARY : "white",
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
    transform: [{ scale: animatedScale }],
    opacity: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.9, 0.8, 1],
    }),
  };

  const registeredFilterStyle = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        filter === "registered" ? Colors.PRIMARY : "white",
        filter === "registered" ? "#a0a0a0" : "#f0f0f0", // Intermediate color
        filter === "registered" ? Colors.PRIMARY : "white",
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
    transform: [{ scale: animatedScale }],
    opacity: animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.9, 0.8, 1],
    }),
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.HeaderText, { color: colors.onBackground }]}>
          Events
        </Text>

        <Button
          onPress={() => {
            navigation.navigate("AddEvent");
          }}
        >
          <Ionicons name="add" size={24} color="white" />
        </Button>
      </View>

      <View style={styles.filterContainer}>
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
            Registered
          </Animated.Text>
        </Pressable>
      </View>

      {filter === "registered" && registeredEvents.length === 0 && (
        <View style={styles.noRegisteredEvents}>
          <Text
            style={[
              styles.noRegisteredEventsText,
              { color: colors.onBackground },
            ]}
          >
            Oops! You haven’t registered for any events yet. 🧐
          </Text>
          <Text
            style={[
              styles.noRegisteredEventsText,
              { color: colors.onBackground },
            ]}
          >
            Go explore and find something exciting! 🎉
          </Text>
        </View>
      )}

      {filter === "upcoming" && events.length === 0 && (
        <View style={styles.noRegisteredEvents}>
          <Text
            style={[
              styles.noRegisteredEventsText,
              { color: colors.onBackground },
            ]}
          >
            🚫 No upcoming events for now.
          </Text>
          <Text
            style={[
              styles.noRegisteredEventsText,
              { color: colors.onBackground },
            ]}
          >
            But hey, stay tuned — cool stuff is on the way! 🔔
          </Text>
        </View>
      )}

      <FlatList
        data={filter === "upcoming" ? events : registeredEvents}
        renderItem={({ item, index }) => (
          <EventCard
            {...item}
            key={index}
            filter={filter}
            isRegistered={
              filter === "upcoming"
                ? eventIsRegistered(item.id)
                : eventIsRegistered(item.event_id)
            }
            isCreator={isCreator(item.createdby)}
            refreshData={getEvents}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await getEvents();
          setRefreshing(false);
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  HeaderText: {
    fontSize: 30,
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  eventFilter: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    color: Colors.PRIMARY,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    backgroundColor: "white",
    textAlign: "center",
  },
  filter: {
    fontWeight: "bold",
    color: Colors.PRIMARY,
    padding: 10,
    borderRadius: 10,
    width: "40%",
  },
  activeEventFilter: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    backgroundColor: Colors.PRIMARY,
    color: "white",
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
  },
  noRegisteredEvents: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noRegisteredEventsText: {
    fontSize: RFValue(16),
    fontWeight: "bold",

    textAlign: "center",
  },
});
