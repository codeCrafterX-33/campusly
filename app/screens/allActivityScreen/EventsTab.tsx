import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemeContext } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../constants/Colors";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EventContext } from "../../context/EventContext";
import ProfileEventCard from "../../components/Events/ProfileEventCard";
import { Tabs } from "react-native-collapsible-tab-view";
import { OnRefresh } from "../../util/OnRefresh";

export default function EventsTab({
  setShowCheckmark,
  user_id,
}: {
  setShowCheckmark: (showCheckmark: boolean) => void;
  user_id?: string;
}) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { isDarkMode } = useContext(ThemeContext);
  const { colors } = useTheme();
  const { registeredEvents, getRegisteredEvents, eventIsRegistered } =
    useContext(EventContext);
  const [refreshing, setRefreshing] = useState(false);

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {registeredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
            <Ionicons
              name="calendar-outline"
              size={50}
              color={Colors.PRIMARY}
            />
          </Animated.View>
          <Text style={[styles.title, { color: colors.onBackground }]}>
            No events yet 🎈
          </Text>
          <Text style={[styles.subtitle, { color: Colors.GRAY }]}>
            You haven't joined or created any events. Don't miss out on the fun
            — explore what's happening on campus! 🎉
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate("DrawerNavigator", {
                screen: "TabLayout",
                params: {
                  screen: "Events",
                },
              })
            }
          >
            <Text style={styles.buttonText}>Discover Events</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Tabs.FlatList
          data={registeredEvents}
          renderItem={({ item, index }) => (
            <ProfileEventCard
              {...item}
              isRegistered={eventIsRegistered(item.event_id)}
            />
          )}
          keyExtractor={(item: any) =>
            item.event_id + Math.random() + item.event_date
          }
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
          contentContainerStyle={{ paddingHorizontal: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: RFValue(18),
    marginTop: 16,
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    fontSize: RFValue(13),
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: RFValue(14),
  },
});
