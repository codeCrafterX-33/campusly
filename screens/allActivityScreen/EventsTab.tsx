import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, RefreshControl, FlatList } from "react-native";
import { EventContext } from "../../context/EventContext";
import { Tabs } from "react-native-collapsible-tab-view";
import ProfileEventCard from "../../components/Events/ProfileEventCard";
import { OnRefresh } from "../../util/OnRefresh";
import Colors from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import Button from "../../components/ui/Button";
import {
  CompositeNavigationProp,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
export default function EventsTab({
  setShowCheckmark,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
}) {
  const { registeredEvents, eventIsRegistered, getRegisteredEvents } =
    useContext(EventContext);
  const [refreshing, setRefreshing] = useState(false);
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<any>,
        BottomTabNavigationProp<any>
      >
    >();

  return registeredEvents.length > 0 ? (
    <View style={styles.container}>
      <Tabs.FlatList
        data={registeredEvents}
        renderItem={({ item }) => (
          <ProfileEventCard
            {...item}
            isRegistered={eventIsRegistered(item.event_id)}
          />
        )}
        keyExtractor={(item: any) => item.event_id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              OnRefresh({
                setRefreshing,
                setShowCheckmark,
                getFunction: getRegisteredEvents,
                route: "Events",
              })
            }
            tintColor={Colors.PRIMARY}
            colors={[Colors.PRIMARY]}
          />
        }
      />
    </View>
  ) : (
    <View style={styles.container}>
      {registeredEvents.length > 0 ? (
        <FlatList
          data={registeredEvents}
          renderItem={({ item }) => (
            <ProfileEventCard
              {...item}
              isRegistered={eventIsRegistered(item.event_id)}
            />
          )}
          keyExtractor={(item: any) => item.event_id.toString()}
        />
      ) : (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>Your event list is empty...</Text>
          <Button
            onPress={() =>
              navigation.navigate("DrawerNavigator", {
                screen: "TabLayout",
                params: {
                  screen: "Events",
                },
              })
            }
          >
            Discover what's happening 🎉
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsText: {
    textAlign: "center",
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.GRAY,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
