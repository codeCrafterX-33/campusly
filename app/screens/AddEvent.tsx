import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import moment from "moment";
import {
  useNavigation,
  CompositeNavigationProp,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "../constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { RFValue } from "react-native-responsive-fontsize";
import Toast from "react-native-toast-message";
import { eventOptions } from "../configs/CloudinaryConfig";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import Button from "../components/ui/Button";

interface UploadResponse {
  url: string;
  secure_url: string;
}

interface RouteParams {
  isEditing?: boolean;
  eventData?: {
    id: number;
    name: string;
    bannerurl: string;
    location: string;
    link: string;
    event_date: string;
    event_time: string;
  };
}

export default function AddEvent() {
  const { userData } = useContext(AuthContext);
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        StackNavigationProp<RootStackParamList>,
        DrawerNavigationProp<any>
      >
    >();
  const route = useRoute();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState<string>("");
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [eventLink, setEventLink] = useState<string>("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [eventDateError, setEventDateError] = useState<boolean>(false);
  const [eventTimeError, setEventTimeError] = useState<boolean>(false);

  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventTime, setEventTime] = useState<Date | null>(null);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openTimePicker, setOpenTimePicker] = useState(false);

  // Get route params
  const params = route.params as RouteParams;
  const isEditing = params?.isEditing || false;
  const eventData = params?.eventData;

  // Pre-fill form data when editing
  useEffect(() => {
    if (isEditing && eventData) {
      setEventName(eventData.name);
      setEventLocation(eventData.location);
      setEventLink(eventData.link);
      setEventImage(eventData.bannerurl);

      // Parse date and time from existing event
      if (eventData.event_date) {
        const parsedDate = moment(
          eventData.event_date,
          "MMMM Do YYYY"
        ).toDate();
        setEventDate(parsedDate);
      }

      if (eventData.event_time) {
        const parsedTime = moment(eventData.event_time, "hh:mm a").toDate();
        setEventTime(parsedTime);
      }
    }
  }, [isEditing, eventData]);

  const showDatePicker = () => {
    setOpenDatePicker(true);
  };

  const showTimePicker = () => {
    setOpenTimePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: any) => {
    if (Platform.OS === "android") {
      setOpenDatePicker(false);
      if (event.type === "set" && selectedDate) {
        setEventDate(selectedDate);
        setEventDateError(false);
      }
    } else {
      if (selectedDate) {
        setEventDate(selectedDate);
        setEventDateError(false);
      }
    }
  };

  const onTimeChange = (event: any, selectedTime?: any) => {
    if (Platform.OS === "android") {
      setOpenTimePicker(false);
      if (event.type === "set" && selectedTime) {
        setEventTime(selectedTime);
        setEventTimeError(false);
      }
    } else {
      if (selectedTime) {
        setEventTime(selectedTime);
        setEventTimeError(false);
      }
    }
  };

  const validateInputs = (
    name: string,
    location: string,
    link: string,
    image: string | null,
    eventDate: Date | null,
    eventTime: Date | null
  ) => {
    let isValid = true;

    if (!name) {
      setNameError("Please enter an event name");
      isValid = false;
    } else if (name.length < 3) {
      setNameError("Name must be at least 3 characters");
      isValid = false;
    } else {
      setNameError(null);
    }

    if (!location) {
      setLocationError("Please enter an event location");
      isValid = false;
    } else if (location.length < 3) {
      setLocationError("Location must be at least 3 characters");
      isValid = false;
    } else {
      setLocationError(null);
    }

    // For editing, image is optional if it already exists
    if (!image && !isEditing) {
      setImageError("Please select a banner");
      isValid = false;
    } else {
      setImageError(null);
    }

    if (!link) {
      setLinkError("Please enter a link");
      isValid = false;
    } else if (!link.includes("https://")) {
      setLinkError("Please enter a valid link");
      isValid = false;
    } else {
      setLinkError(null);
    }

    if (!eventDate) {
      setEventDateError(true);
      isValid = false;
    }

    if (!eventTime) {
      setEventTimeError(true);
      isValid = false;
    }

    console.log("Validation Result:", { name, location, link, image, isValid });
    return isValid;
  };

  const uploadData = async (
    name: string,
    location: string,
    link: string,
    image: string | null,
    eventDate: Date | null,
    eventTime: Date | null
  ) => {
    setLoading(true);
    try {
      let imageUrl = eventImage; // Use existing image if editing

      // Only upload new image if it's different from the existing one
      if (image && image !== eventData?.bannerurl) {
        // Create form data for image upload
        const formData = new FormData();
        const uri = image;
        const filename = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename as string);
        const type = match ? `image/${match[1]}` : "image";

        formData.append("file", {
          uri,
          name: filename,
          type,
        } as any);

        formData.append("upload_preset", eventOptions.upload_preset);
        formData.append("folder", eventOptions.folder);

        // Upload to Cloudinary directly
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.secure_url;
      }

      if (imageUrl) {
        if (isEditing && eventData) {
          // Update existing event
          const result = await axios.put(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/event/update/${eventData.id}`,
            {
              eventName: name,
              location: location,
              link: link,
              eventImage: imageUrl,
              eventDate: moment(eventDate).format("MMMM Do YYYY"),
              eventTime: moment(eventTime).format("hh:mm a"),
              user_id: userData?.id,
            }
          );

          if (result.status === 200) {
            Toast.show({
              text1: "Event updated successfully! 🎉",
              type: "success",
            });

            navigation.navigate("DrawerNavigator", {
              screen: "TabLayout",
              params: {
                screen: "Events",
              },
            });
          }
        } else {
          // Create new event
          const result = await axios.post(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/event`,
            {
              eventName: name,
              location: location,
              link: link,
              eventImage: imageUrl,
              eventDate: moment(eventDate).format("MMMM Do YYYY"),
              eventTime: moment(eventTime).format("hh:mm a"),
              u_email: userData?.email,
              user_id: userData?.id,
            }
          );

          if (result.status === 201) {
            Toast.show({
              text1: "Great! New event added 🎉",
              type: "success",
            });

            navigation.navigate("DrawerNavigator", {
              screen: "TabLayout",
              params: {
                screen: "Events",
              },
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        text1: isEditing ? "Failed to update event" : "Failed to create event",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onPostBtnClick = () => {
    setTimeout(() => {
      const name = eventName.trim();
      const location = eventLocation.trim();
      const link = eventLink.trim();
      const image = eventImage;
      const date = eventDate;
      const time = eventTime;

      const isValid = validateInputs(name, location, link, image, date, time);

      if (isValid) {
        uploadData(name, location, link, image, date, time);
      } else {
        Toast.show({
          text1: "Please fill all the required fields",
          type: "error",
        });
        Keyboard.dismiss();
      }
    }, 100);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      const fileInfo = await fetch(result.assets[0].uri).then((res) => {
        return {
          size: res.headers.get("Content-Length"),
          type: res.headers.get("Content-Type"),
        };
      });

      const fileSizeInMB = fileInfo.size
        ? parseInt(fileInfo.size) / (1024 * 1024)
        : 0;

      if (fileSizeInMB > 5) {
        setImageError("Image size should be less than 5MB");
        return;
      }

      setEventImage(result.assets[0].uri);
      setImageError(null);
    }
  };

  const handleNameChange = (text: string) => {
    setEventName(text);
    if (text.trim().length < 3 && text.trim().length > 0) {
      setNameError("Event name must be at least 3 characters");
    } else {
      setNameError(null);
    }
  };

  const handleLocationChange = (text: string) => {
    setEventLocation(text);
    if (text.trim().length < 3 && text.trim().length > 0) {
      setLocationError("Location must be at least 3 characters");
    } else {
      setLocationError(null);
    }
  };

  const handleLinkChange = (text: string) => {
    setEventLink(text);
    if (!text.includes("https://")) {
      setLinkError("Please enter a valid link");
    } else {
      setLinkError(null);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10, marginRight: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
      ),

      headerStyle: {
        backgroundColor: colors.background,
      },
      headerRight: () => (
        <TouchableOpacity onPress={onPostBtnClick} disabled={loading}>
          <Text style={[styles.postBtn, { color: "white" }]}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : isEditing ? (
              "Update"
            ) : (
              "Create"
            )}
          </Text>
        </TouchableOpacity>
      ),
      headerTitle: isEditing ? "Edit Event" : "Add Event",
      headerTitleStyle: {
        fontSize: RFValue(16),
        fontWeight: "bold",
        color: colors.onBackground,
      },
    });
  }, [navigation, colors, onPostBtnClick, loading, isEditing]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Editing Indicator */}
        {isEditing && (
          <View style={styles.editingIndicator}>
            <Ionicons name="create-outline" size={16} color={Colors.PRIMARY} />
            <Text style={styles.editingText}>Editing Event</Text>
          </View>
        )}

        <TouchableOpacity onPress={pickImage}>
          {eventImage ? (
            <Image source={{ uri: eventImage }} style={styles.image} />
          ) : (
            <Image
              source={require("../assets/images/image.png")}
              style={[
                styles.image,
                {
                  borderColor: imageError ? "red" : Colors.PRIMARY,
                  borderWidth: 2,
                },
              ]}
            />
          )}
        </TouchableOpacity>
        {imageError && <Text style={styles.errorText}>{imageError}</Text>}
        <Text style={styles.helperText}>
          {isEditing
            ? "Tap to change banner image"
            : "Recommended: Square image, max 5MB"}
        </Text>

        <TextInput
          placeholder="Event Name"
          placeholderTextColor={Colors.GRAY}
          style={[
            styles.eventInput,
            {
              backgroundColor: colors.background,
              color: colors.onBackground,
              borderColor: nameError ? "red" : "transparent",
              borderWidth: nameError ? 1 : 0,
            },
          ]}
          value={eventName}
          onChangeText={handleNameChange}
          maxLength={30}
          autoCapitalize="words"
          autoFocus={!isEditing}
        />
        {nameError && <Text style={styles.errorText}>{nameError}</Text>}

        <TextInput
          placeholder="Location"
          placeholderTextColor={Colors.GRAY}
          style={[
            styles.eventInput,
            {
              backgroundColor: colors.background,
              color: colors.onBackground,
              borderColor: locationError ? "red" : "transparent",
              borderWidth: locationError ? 1 : 0,
            },
          ]}
          value={eventLocation}
          onChangeText={handleLocationChange}
          maxLength={30}
        />
        {locationError && <Text style={styles.errorText}>{locationError}</Text>}

        <TextInput
          placeholder="Event Link"
          placeholderTextColor={Colors.GRAY}
          style={[
            styles.eventInput,
            {
              backgroundColor: colors.background,
              color: colors.onBackground,
              borderColor: linkError ? "red" : "transparent",
              borderWidth: linkError ? 1 : 0,
            },
          ]}
          value={eventLink}
          onChangeText={handleLinkChange}
          maxLength={30}
        />
        {linkError && <Text style={styles.errorText}>{linkError}</Text>}

        <View style={styles.dateTimeRow}>
          <Button
            viewStyle={[
              styles.dateTimeButton,
              {
                borderColor: eventDateError ? "red" : Colors.PRIMARY,
              },
            ]}
            textStyle={{ color: eventDateError ? "red" : Colors.PRIMARY }}
            outline
            onPress={() => showDatePicker()}
          >
            <Text>
              {eventDate
                ? eventDate.toLocaleDateString([], {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Select Date"}
            </Text>
          </Button>

          <Button
            viewStyle={[
              styles.dateTimeButton,
              {
                borderColor: eventTimeError ? "red" : Colors.PRIMARY,
              },
            ]}
            textStyle={{ color: eventTimeError ? "red" : Colors.PRIMARY }}
            outline
            onPress={() => showTimePicker()}
          >
            <Text>
              {eventTime
                ? eventTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Select Time"}
            </Text>
          </Button>
        </View>

        {openDatePicker && (
          <DateTimePicker
            value={eventDate || new Date()}
            mode={"date"}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            is24Hour={true}
            onChange={onDateChange}
          />
        )}
        {openTimePicker && (
          <DateTimePicker
            value={eventTime || new Date()}
            mode={"time"}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: RFValue(15),
    paddingBottom: RFValue(100), // Extra padding to ensure buttons are visible above keyboard
  },
  editingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY + "20",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 5,
  },
  editingText: {
    color: Colors.PRIMARY,
    fontSize: RFValue(12),
    fontWeight: "600",
    marginLeft: 4,
  },
  postBtn: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    textAlign: "center",
    marginRight: RFValue(10),
    paddingHorizontal: RFValue(15),
    paddingVertical: RFValue(5),
    borderRadius: 99,
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: Colors.PRIMARY,
  },
  postBtnContainer: {
    marginTop: 15,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 15,
    borderRadius: 15,
  },
  eventInput: {
    backgroundColor: Colors.WHITE,
    borderRadius: RFValue(15),
    padding: RFValue(10),
    marginTop: RFValue(10),
    height: RFValue(50),
    fontSize: RFValue(14),
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  errorText: {
    color: "red",
    fontSize: RFValue(12),
    marginTop: 5,
    marginLeft: 5,
  },
  helperText: {
    color: Colors.GRAY,
    fontSize: RFValue(12),
    marginTop: 5,
    marginLeft: 5,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: RFValue(10),
    gap: RFValue(10),
  },
  dateTimeButton: {
    flex: 1,
  },
});
