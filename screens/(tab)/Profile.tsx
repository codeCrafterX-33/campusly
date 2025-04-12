import { View, Text, Button } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { auth } from "../../configs/FireBaseConfigs";

export default function Profile() {
  const authCtx = useContext(AuthContext);
  return (
    <View>
      <Text>Profile</Text>
      <Button title="Logout" onPress={() => auth.signOut()} />
      <Text>{authCtx.user?.name}</Text>
    </View>
  );
}
