import { View, Text, StyleSheet, Image, Share } from "react-native";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import Button from "../ui/Button";
import { useContext, useState } from "react";
import { EventContext } from "../../context/EventContext";
import { AuthContext } from "../../context/AuthContext";
import { showEventToast } from "../ToastMessages";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import CampuslyAlert from "../CampuslyAlert";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
  user_id?: number;
};

export default function EventCard(event: EVENT) {
  const { registerEvent, unregisterEvent, deleteEvent } =
    useContext(EventContext);
  const { userData } = useContext(AuthContext);
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [isLoading, setIsLoading] = useState(false);
  const [showUnregisterAlert, setShowUnregisterAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Check if current user is the creator of this event
  const isEventCreator = userData?.id === event.user_id;

  // Determine if we should show creator actions based on the filter and creator status
  const shouldShowCreatorActions =
    isEventCreator && event.filter !== "registered";

  const onRegisterBtnClick = async () => {
    if (event.isRegistered) {
      // If the user is already registered, show unregister confirmation
      setShowUnregisterAlert(true);
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

  const handleUnregister = async () => {
    setIsLoading(true);
    try {
      // Use event_id for registered events, id for upcoming events
      const eventIdToUnregister =
        event.filter === "registered" ? event.event_id : event.id;
      const unregister = await unregisterEvent(eventIdToUnregister);
      if (unregister?.status === 200) {
        showEventToast("unregister");
        event.refreshData?.();
      } else {
        showEventToast("unregisterError");
      }
    } catch (error) {
      console.log("Error unregistering from event:", error);
      showEventToast("unregisterError");
    } finally {
      setIsLoading(false);
      setShowUnregisterAlert(false);
    }
  };

  const handleDeleteEvent = async () => {
    setIsLoading(true);
    try {
      const deleteResult = await deleteEvent(event.id?.toString() || "");
      if (deleteResult?.status === 200) {
        showEventToast("deleteSuccess");
        event.refreshData?.();
      } else {
        showEventToast("deleteError");
      }
    } catch (error) {
      console.log("Error deleting event:", error);
      showEventToast("deleteError");
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleEditEvent = () => {
    navigation.navigate("AddEvent", {
      isEditing: true,
      eventData: {
        id: event.id,
        name: event.name,
        bannerurl: event.bannerurl,
        location: event.location,
        link: event.link,
        event_date: event.event_date,
        event_time: event.event_time,
      },
    });
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

      {/* Creator Actions */}
      {shouldShowCreatorActions && (
        <View style={styles.creatorActions}>
          <View style={styles.creatorButton}>
            <Button outline onPress={handleEditEvent}>
              <Ionicons
                name="create-outline"
                size={20}
                color={Colors.PRIMARY}
              />
              <Text
                style={[styles.creatorButtonText, { color: Colors.PRIMARY }]}
              >
                Edit
              </Text>
            </Button>
          </View>
          <View style={styles.creatorButton}>
            <Button outline onPress={() => setShowDeleteAlert(true)}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.creatorButtonText, { color: "#EF4444" }]}>
                Delete
              </Text>
            </Button>
          </View>
        </View>
      )}

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
        {(!isEventCreator || event.filter === "registered") && (
          <Button
            fullWidth
            isLoading={isLoading}
            onPress={() => onRegisterBtnClick()}
            dim={event.isRegistered}
          >
            {event.isRegistered ? "Registered" : "Register"}
          </Button>
        )}
      </View>

      {/* Unregister Alert */}
      <CampuslyAlert
        isVisible={showUnregisterAlert}
        type="error"
        onClose={() => setShowUnregisterAlert(false)}
        messages={{
          success: {
            title: "Wait up! 🛑",
            message:
              "Are you sure you want to bail on this event? 😢 We'll miss you!",
            icon: "⚠️",
          },
          error: {
            title: "Wait up! 🛑",
            message:
              "Are you sure you want to bail on this event? 😢 We'll miss you!",
            icon: "⚠️",
          },
        }}
        onPress={handleUnregister}
        onPress2={() => setShowUnregisterAlert(false)}
        buttonText="Yeah, gotta go"
        buttonText2="Nah, I'm staying"
        overrideDefault={true}
        isLoading={isLoading}
        loadingText="Unregistering... 🏃‍♂️"
      />

      {/* Delete Alert */}
      <CampuslyAlert
        isVisible={showDeleteAlert}
        type="error"
        onClose={() => setShowDeleteAlert(false)}
        messages={{
          success: {
            title: "Delete Event? 🗑️",
            message:
              "This action cannot be undone. All registrations will be lost! 😱",
            icon: "⚠️",
          },
          error: {
            title: "Delete Event? 🗑️",
            message:
              "This action cannot be undone. All registrations will be lost! 😱",
            icon: "⚠️",
          },
        }}
        onPress={handleDeleteEvent}
        onPress2={() => setShowDeleteAlert(false)}
        buttonText="Yes, delete it"
        buttonText2="Cancel"
        overrideDefault={true}
        isLoading={isLoading}
        loadingText="Deleting... 🗑️"
      />
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
  creatorActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 15,
    gap: 10,
  },
  creatorButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  creatorButtonText: {
    fontSize: RFValue(14),
    fontWeight: "600",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
