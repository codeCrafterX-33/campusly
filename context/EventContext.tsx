import { View, Text } from "react-native";
import React, { createContext, useEffect } from "react";
import usePersistedState from "../util/PersistedState";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const EventContext = createContext<any>({
  events: [],
  getEvents: () => {},
  setEvents: () => {},
  refreshing: false,
  onRefresh: () => {},
  getRegisteredEvents: () => {},
  registeredEvents: [],
  setRegisteredEvents: () => {},
});

function EventProvider({ children }: { children: React.ReactNode }) {
  const { user } = React.useContext<any>(AuthContext);
  const [events, setEvents] = usePersistedState("events", []);
  const [registeredEvents, setRegisteredEvents] = usePersistedState(
    "registeredEvents",
    []
  );
  const [refreshing, setRefreshing] = React.useState(false);

  const GetEvents = async () => {
    try {
      console.log("fetching events.....");
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/events`
      );
      if (response.status === 200) {
        setEvents(response.data.data);
        if (events.length > 0) {
          console.log(events);
        }
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
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/event/registered/${user?.email}`
      );
      if (response.status === 200) {
        setRegisteredEvents(response.data.data);
        console.log("Registered events fetched successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const value = {
    events: events,
    getEvents: GetEvents,
    setEvents: setEvents,
    refreshing: refreshing,
    onRefresh: onRefresh,
    getRegisteredEvents: getRegisteredEvents,
    registeredEvents: registeredEvents,
    setRegisteredEvents: setRegisteredEvents,
  };

 return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export { EventContext, EventProvider };
export default EventProvider;
