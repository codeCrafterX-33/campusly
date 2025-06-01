import { useEffect, useState } from "react";
import { View, Text, BackHandler, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import ClubCard from "../components/Clubs/ClubCard";

interface Club {
  id: number;
  name: string;
  club_logo: string;
  about: string;
  createdon: string;
}

export default function ExploreClubs() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [clubs, setClubs] = useState<Club[]>([]);

  const getallclubs = async () => {
    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/clubs`
    );
    setClubs(response.data.data);
  };

  useEffect(() => {
    getallclubs();
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

  return (
    <View style={{ flex: 1 }}>
      {clubs.length > 0 ? (
        <FlatList
          data={clubs}
          renderItem={({ item }) => <ClubCard club={item} />}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Loading clubs...
        </Text>
      )}
    </View>
  );
}
