import { View, Text, Button, Image, BackHandler } from "react-native";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { auth } from "../../configs/FireBaseConfigs";

export default function Profile({ navigation }: { navigation: any }) {
  const authCtx = useContext(AuthContext);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.replace("DrawerNavigator");
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View>
      <Text>Profile</Text>
      <Button title="Logout" onPress={() => authCtx.logout()} />
      <Text>{authCtx.user?.name}</Text>
      <Text>{authCtx.user?.email}</Text>

      <Image
        source={{ uri: authCtx.user?.image }}
        style={{ width: 100, height: 100 }}
      />
    </View>
  );
}
