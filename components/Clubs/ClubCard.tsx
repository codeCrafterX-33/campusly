import { useTheme } from "react-native-paper";
import { View, Text, Image } from "react-native";

interface Club {
  id: number;
  name: string;
  club_logo: string;
  about: string;
  createdon: string;
}

export default function ClubCard({ club }: { club: Club }) {
  const { colors } = useTheme();
  return (
    <View>
      <Image
        source={{ uri: club.club_logo }}
        style={{ width: 100, height: 100 }}
      />
      <Text>{club.name}</Text>
      <Text>{club.about}</Text>
      <Text>{club.createdon}</Text>
    </View>
  );
}
