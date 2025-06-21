import { View, Text, StyleSheet, Image } from "react-native";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../ui/Button";
import { useContext } from "react";
import { EventContext } from "../../context/EventContext";

type EVENT = {
  id: number;
  name: string;
  bannerurl: string;
  location: string;
  link: string;
  event_date: string;
  event_time: string;
  createdBy: string;
  username: string;
  isRegistered?: boolean;
  isCreator?: boolean;
  refreshData?: () => void;
};

export default function EventCard({ event }: { event: EVENT }) {
  const { registerEvent, unregisterEvent } = useContext(EventContext);
  const { colors } = useTheme();

  return (
    <View style={styles.eventCard}>
      <Image
        style={event.bannerurl ? styles.bannerUrl : { display: "none" }}
        source={{ uri: event.bannerurl }}
      />

      <Text style={[styles.name, { color: colors.onBackground }]}>
        {event.name}
      </Text>
      <Text style={[styles.eventBy]}>Event by {event.username}</Text>

      <View style={styles.subContainer}>
        <Ionicons name="location-outline" size={20} color={Colors.GRAY} />
        <Text style={[styles.location]}>{event.location}</Text>
      </View>
      <View style={styles.subContainer}>
        <Ionicons name="calendar-outline" size={20} color={Colors.GRAY} />
        <Text style={[styles.location]}>
          {event.event_date} at {event.event_time}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button fullWidth outline onPress={() => {}}>
          Share
        </Button>
        <Button fullWidth onPress={() => {}}>
          Register
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: RFValue(18),
    fontWeight: "bold",
    marginTop: 10,
  },
  location: {
    fontSize: RFValue(12),
    color: Colors.GRAY,
  },
  eventDate: {
    fontSize: RFValue(16),
  },
  eventTime: {
    fontSize: RFValue(16),
  },
  createdBy: {
    fontSize: RFValue(16),
  },
  bannerUrl: {
    height: 260,
    objectFit: "cover",
    borderRadius: 10,
  },
  eventCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 5,
    borderBottomWidth: 0.2,
    borderBottomColor: Colors.GRAY,
  },
  eventBy: {
    fontSize: RFValue(12),
    color: Colors.GRAY,
  },
  subContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 5,
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
