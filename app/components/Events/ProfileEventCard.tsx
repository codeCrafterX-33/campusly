import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Share,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useContext, useState } from "react";
import { EventContext } from "../../context/EventContext";
import { showEventToast } from "../ToastMessages";
import Colors from "../../constants/Colors";
import Button from "../ui/Button";
import { LinearGradient } from "expo-linear-gradient";


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
  filter?: string;
  event_id?: number;
};

export default function EventCard(event: EVENT) {
  const { colors } = useTheme();
  const { registerEvent, unregisterEvent } = useContext(EventContext);
  const [isLoading, setIsLoading] = useState(false);

  const onRegisterBtnClick = async () => {
    if (event.isRegistered) {
      Alert.alert(
        "Wait up! 🛑",
        "Are you sure you want to bail on this event? 😢 We'll miss you!",
        [
          {
            text: "Yeah, gotta go",
            onPress: async () => {
              setIsLoading(true);
              try {
                const res = await unregisterEvent(
                  event.filter === "upcoming" ? event.id : event.event_id
                );
                if (res?.status === 200) {
                  showEventToast("unregister");
                  event.refreshData?.();
                } else {
                  showEventToast("unregisterError");
                }
              } catch (err) {
                showEventToast("unregisterError");
              } finally {
                setIsLoading(false);
              }
            },
          },
          {
            text: "Nah, I'm staying",
            style: "cancel",
          },
        ]
      );
    } else {
      try {
        setIsLoading(true);
        const res = await registerEvent(event.id);
        if (res.status === 201) {
          showEventToast("register");
          event.refreshData?.();
        }
      } catch (err) {
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
https://campusly.vercel.app/events/${event.id}`;

    await Share.share({ message });
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: event.bannerurl }} style={styles.image} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.gradientOverlay}
        />
        <View style={styles.imageTextOverlay}>
          <Text style={styles.title}>{event.name}</Text>
          <Text style={styles.meta}>
            <Ionicons name="calendar-outline" size={14} color="#fff" />{" "}
            {event.event_date} at {event.event_time}
          </Text>
          <Text style={styles.meta}>
            <Ionicons name="location-outline" size={14} color="#fff" />{" "}
            {event.location}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.organizer}>Hosted by {event.username}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={shareEvent} style={styles.iconButton}>
            <Ionicons
              name="share-social-outline"
              size={22}
              color={Colors.PRIMARY}
            />
          </TouchableOpacity>
          <Button
            fullWidth
            isLoading={isLoading}
            onPress={onRegisterBtnClick}
            dim={event.isRegistered}
          >
            {event.isRegistered ? "Registered" : "Register"}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.WHITE,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  imageWrapper: {
    position: "relative",
    height: 200,
  },
  image: {
    height: "100%",
    width: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  imageTextOverlay: {
    position: "absolute",
    bottom: 10,
    left: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  title: {
    color: "#fff",
    fontSize: RFValue(18),
    fontWeight: "bold",
  },
  meta: {
    color: "#eee",
    fontSize: RFValue(12),
    marginTop: 2,
  },
  details: {
    padding: 15,
  },
  organizer: {
    fontSize: RFValue(12),
    color: Colors.PRIMARY,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
  },
});
