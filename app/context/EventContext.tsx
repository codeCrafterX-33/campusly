import { View, Text } from "react-native";
import React, { createContext, useContext, useEffect, useState } from "react";
import usePersistedState from "../util/PersistedState";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const EventContext = createContext<any>({
  events: [],
  getEvents: () => {},
  setEvents: () => {},
  registerEvent: () => {},
  unregisterEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
  refreshing: false,
  onRefresh: () => {},
  getRegisteredEvents: () => {},
  registeredEvents: [],
  setRegisteredEvents: () => {},
  eventIsRegistered: () => {},
  getUserCreatedEvents: () => {},
  userCreatedEvents: [],
  setUserCreatedEvents: () => {},
});

function EventProvider({ children }: { children: React.ReactNode }) {
  const { userData } = useContext<any>(AuthContext);
  const [events, setEvents] = usePersistedState("events", []);
  const [registeredEvents, setRegisteredEvents] = usePersistedState(
    "registeredEvents",
    []
  );
  const [userCreatedEvents, setUserCreatedEvents] = usePersistedState(
    "userCreatedEvents",
    []
  );
  const [refreshing, setRefreshing] = useState(false);

  const GetEvents = async () => {
    try {
      console.log("fetching events.....");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/event/get-events`
      );

      if (userData?.email) {
        await getRegisteredEvents();
      }

      if (response.status === 200) {
        setEvents(response.data.data);
        if (events.length > 0) {
          console.log(events);
        }
        return response.status;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await GetEvents();
    setRefreshing(false);
  };

  const getRegisteredEvents = async () => {
    console.log("userData?.id", userData?.id);
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/event/registered/${userData?.id}`
    );
    if (response.status === 200) {
      setRegisteredEvents(response.data.data);
      console.log("Registered events fetched successfully");
      console.log(response.data.data);
      return response.status;
    } else {
      console.log("Error fetching registered events");
    }
    return response.status;
  };

  const registerEvent = async (eventId: string) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/event/register`,
        {
          eventId: eventId,
          user_id: userData?.id,
        }
      );
      if (response.status === 201) {
        console.log("Event registered successfully");
        await getRegisteredEvents();
      }
      return { status: response.status };
    } catch (error) {
      console.log(error);
    }
  };

  const unregisterEvent = async (eventId: string) => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/event/unregister/${userData?.id}`,
        {
          data: { eventId: eventId },
        }
      );
      if (response.status === 200) {
        console.log("Event unregistered successfully");
        await getRegisteredEvents();
      }
      return { status: response.status };
    } catch (error) {
      console.log(error);
    }
  };

  const updateEvent = async (eventId: string, eventData: any) => {
    try {
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/event/update/${eventId}`,
        {
          ...eventData,
          user_id: userData?.id,
        }
      );
      if (response.status === 200) {
        console.log("Event updated successfully");
        await GetEvents(); // Refresh events list
      }
      return { status: response.status, data: response.data };
    } catch (error) {
      console.log("Error updating event:", error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/event/delete/${eventId}`,
        {
          data: { user_id: userData?.id },
        }
      );
      if (response.status === 200) {
        console.log("Event deleted successfully");
        await GetEvents(); // Refresh events list
      }
      return { status: response.status, data: response.data };
    } catch (error) {
      console.log("Error deleting event:", error);
      throw error;
    }
  };

  const eventIsRegistered = (eventId: number) => {
    const event = registeredEvents.find(
      (event: any) => event.event_id === eventId
    );
    return event ? true : false;
  };

  const getUserCreatedEvents = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/event/user-created/${userData?.id}`
      );
      if (response.status === 200) {
        setUserCreatedEvents(response.data.data);
        console.log("User created events fetched successfully");
        console.log(response.data.data);
        return response.status;
      } else {
        console.log("Error fetching user created events");
      }
      return response.status;
    } catch (error) {
      console.log("Error fetching user created events:", error);
    }
  };

  const value = {
    events: events,
    getEvents: GetEvents,
    registerEvent: registerEvent,
    unregisterEvent: unregisterEvent,
    updateEvent: updateEvent,
    deleteEvent: deleteEvent,
    setEvents: setEvents,
    refreshing: refreshing,
    onRefresh: onRefresh,
    getRegisteredEvents: getRegisteredEvents,
    registeredEvents: registeredEvents,
    setRegisteredEvents: setRegisteredEvents,
    eventIsRegistered: eventIsRegistered,
    getUserCreatedEvents: getUserCreatedEvents,
    userCreatedEvents: userCreatedEvents,
    setUserCreatedEvents: setUserCreatedEvents,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}

export { EventContext, EventProvider };
export default EventProvider;
