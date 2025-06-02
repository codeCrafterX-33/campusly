import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  BackHandler,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import ClubCard from "../components/Clubs/ClubCard";
import { ClubContext } from "../context/ClubContext";
import { FAB, useTheme } from "react-native-paper";
import Colors from "../constants/Colors";

export default function ExploreClubs() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const {
    clubs,
    getClubs,
    onRefresh,
    refreshing,
    getFollowedClubs,
    followedClubs,
  } = useContext(ClubContext);

  useEffect(() => {
    const fetchClubs = async () => {
      setIsLoading(true);
      try {
        await getClubs();
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubs();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  const isFollowed = (clubId: number) => {
    const club = followedClubs.find((club: any) => club.club_id === clubId);
    return club ? true : false;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      ) : (
        <FlatList
          onRefresh={onRefresh}
          refreshing={refreshing}
          data={clubs}
          renderItem={({ item }) => (
            <ClubCard
              {...item}
              isFollowed={isFollowed(item.id)}
              refreshData={getFollowedClubs}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          numColumns={2}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}

      <FAB
        icon="plus"
        label="Create Club"
        onPress={() => navigation.navigate("CreateClub")}
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          backgroundColor: Colors.PRIMARY,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
