import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import EmptyState from "../../components/Clubs/EmptyState";
import { useTheme } from "react-native-paper";
export default function Clubs() {
  const { colors } = useTheme();
  const [followedclubs, setFollowedClubs] = useState([]);
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 35,
            fontWeight: "bold",
            color: colors.onBackground,
          }}
        >
          Clubs
        </Text>
        {followedclubs.length === 0 && <EmptyState />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
