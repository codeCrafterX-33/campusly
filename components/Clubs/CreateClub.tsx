import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "../../constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { RFValue } from "react-native-responsive-fontsize";
export default function CreateClub() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [clubName, setClubName] = useState<string>("");
  const [clubDescription, setClubDescription] = useState<string>("");
  const [clubImage, setClubImage] = useState<string | null>(null);

  const onPostBtnClick = () => {
    console.log("Post button clicked");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.5,
    });

    if (!result.canceled) {
      setClubImage(result.assets[0].uri);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10, marginRight: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
      ),

      headerStyle: {
        backgroundColor: colors.background,
      },
      headerRight: () => (
        <TouchableOpacity onPress={() => onPostBtnClick()}>
          <Text style={[styles.postBtn, { color: "white" }]}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.PRIMARY} />
            ) : (
              "Create"
            )}
          </Text>
        </TouchableOpacity>
      ),
      headerTitle: "Add New Club",
      headerTitleStyle: {
        fontSize: RFValue(16),
        fontWeight: "bold",
        color: colors.onBackground,
      },
    });
  }, []);
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={pickImage}>
        {clubImage && (
          <Image source={{ uri: clubImage }} style={styles.image} />
        )}
        {!clubImage && (
          <Image
            source={require("../../assets/images/image.png")}
            style={[
              styles.image,
              { borderColor: Colors.PRIMARY, borderWidth: 2 },
            ]}
          />
        )}
      </TouchableOpacity>
      <TextInput
        placeholder="Club Name"
        placeholderTextColor={Colors.GRAY}
        style={[
          styles.clubNameInput,
          { backgroundColor: colors.background, color: colors.onBackground },
        ]}
        value={clubName}
        onChangeText={setClubName}
        maxLength={30}
        autoCapitalize="words"
        autoFocus={true}
      />
      <TextInput
        placeholder="Club Description"
        placeholderTextColor={Colors.GRAY}
        style={[
          styles.input,
          { backgroundColor: colors.background, color: colors.onBackground },
        ]}
        value={clubDescription}
        onChangeText={setClubDescription}
        multiline={true}
        numberOfLines={4}
        maxLength={1000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: RFValue(10),
  },
  postBtn: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    textAlign: "center",
    marginRight: RFValue(10),
    paddingHorizontal: RFValue(15),
    paddingVertical: RFValue(5),
    borderRadius: 99,
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: Colors.PRIMARY,
  },
  postBtnContainer: {
    marginTop: 15,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 15,
    borderRadius: 15,
  },
  clubNameInput: {
    backgroundColor: Colors.WHITE,
    borderRadius: RFValue(15),
    padding: RFValue(10),
    marginTop: RFValue(10),
    height: RFValue(50),
    fontSize: RFValue(14),
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderRadius: RFValue(15),
    padding: RFValue(10),
    marginTop: RFValue(10),
    height: RFValue(150),
    textAlignVertical: "top",
    fontSize: RFValue(14),
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
