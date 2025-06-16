import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import Button from "../../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/StackNavigator";

type EventViewProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function EventView({ navigation }: EventViewProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.HeaderText, { color: colors.onBackground }]}>
          Event
        </Text>

      <Button
        onPress={() => {
          navigation.navigate("AddEvent");
        }}

      >
          <Ionicons name="add" size={24} color="white" />
        </Button>
      </View>
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
