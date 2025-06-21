import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
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
  const { getEvents, events, refreshing, onRefresh, setRefreshing } =
    useContext(EventContext);

  useLayoutEffect(() => {
    getEvents();
  }, []);

  const { colors } = useTheme();
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
      <FlatList
        data={events}
        renderItem={({ item, index }) => <EventCard event={item} key={index} />}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await getEvents();
          setRefreshing(false);
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PRIMARY]} // Android spinner color
            tintColor={Colors.PRIMARY} // iOS spinner color
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
});
