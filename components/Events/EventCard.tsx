import { View, Text, StyleSheet, Image, Alert, Share } from "react-native";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../ui/Button";
import { useContext, useState } from "react";
import { EventContext } from "../../context/EventContext";
import { showEventToast } from "../ToastMessages";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

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

export default function EventCard(event: EVENT) {
  const { registerEvent, unregisterEvent } = useContext(EventContext);
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const onRegisterBtnClick = async () => {
    if (event.isRegistered) {
      // If the user is already registered, unregister them

      try {
        Alert.alert(
          "Wait up! 🛑",
          "Are you sure you want to bail on this event? 😢 We'll miss you!",
          [
            {
              text: "Yeah, gotta go",
              onPress: async () => {
                setIsLoading(true); // Set loading state to true while unregistering
                try {
                  const unregister = await unregisterEvent(event.id);
                  if (unregister?.status === 200) {
                    showEventToast("unregister"); // random fun unregister toast
                    event.refreshData?.();
                  } else {
                    showEventToast("unregisterError");
                  }
                } catch (error) {
                  console.log("Error unregistering from event:", error);
                  showEventToast("unregisterError");
                } finally {
                  setIsLoading(false);
                }
              },
            },
            {
              text: "Nah, I'm staying",
              onPress: () => {
                setIsLoading(false); // Reset loading state if user cancels
              },
              style: "cancel",
            },
          ],
          { cancelable: true }
        );
      } catch (error) {
        console.log("Error unregistering from event:", error);
        showEventToast("unregisterError");
      }
    } else {
      try {
        setIsLoading(true); // Set loading state to true while registering
        const register = await registerEvent(event.id);
        if (register.status === 201) {
          showEventToast("register");
          event.refreshData?.();
        }
      } catch (error) {
        console.log("Error registering for event:", error);
        showEventToast("registerError");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const shareEvent = async () => {
    const message = `🎉 ${event.name}
📍 ${event.location}
📅 ${event.event_date} at ${event.event_time}

Join me on Campusly:
https://campusly.vercel.app/events/${event.id}

`;

    await Share.share({ message });
  };

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
        <Button
          fullWidth
          outline
          onPress={() => {
            shareEvent();
          }}
        >
          <Ionicons name="share-outline" size={30} color={Colors.PRIMARY} />
        </Button>
        <Button
          fullWidth
          isLoading={isLoading}
          onPress={() => onRegisterBtnClick()}
          dim={event.isRegistered}
        >
          {event.isRegistered ? "Registered" : "Register"}
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
