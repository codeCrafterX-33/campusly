import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  FlatList,
} from "react-native";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Colors from "../../constants/Colors";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootStackParamList, RootTabParamList } from "../../App";
import ModalDropdown from "./ModalDropdown";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PostContext } from "../../context/PostContext";
import { ClubContext } from "../../context/ClubContext";
import uploadImageToCloudinary from "../../util/uploadToCloudinary";
import { postOptions } from "../../configs/CloudinaryConfig";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

// Video component
const VideoComponent = ({
  uri,
  shouldPlay,
}: {
  uri: string;
  shouldPlay: boolean;
}) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, player]);

  return (
    <VideoView
      style={{ width: "100%", height: "100%" }}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
    />
  );
};

interface UploadResponse {
  url: string;
  secure_url: string;
}

export default function WritePost() {
  const { colors } = useTheme();
  const [selectedMedia, setSelectedMedia] = useState<
    { uri: string; type: "image" | "video" }[]
  >([]);

  const selectedMediaRef = useRef<
    {
      uri: string;
      type: "image" | "video";
    }[]
  >([]);
  const { userData } = useContext(AuthContext);
  const {
    getFollowedClubs,
    followedClubs,
    getUserCreatedClubs,
    userCreatedClubs,
  } = useContext(ClubContext);
  const { getPosts } = useContext(PostContext);
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<RootStackParamList>,
        BottomTabNavigationProp<RootTabParamList>
      >
    >();
  const [followedClubsItems, setFollowedClubsItems] = useState<
    { club_id: number; club_name: string; club_logo: string }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [followedClubValue, setFollowedClubValue] = useState({
    club_name: "Public",
    club_id: 0,
  });
  const [content, setContent] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [previewMedia, setPreviewMedia] = useState<null | {
    uri: string;
    type: string;
  }>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFollowedClubs();
    getUserCreatedClubs();

    const followedClubsAndUserCreatedClubs = [
      ...followedClubs,
      ...userCreatedClubs,
    ];

    if (followedClubsAndUserCreatedClubs) {
      setFollowedClubsItems(
        followedClubsAndUserCreatedClubs.map((club: any) => ({
          club_id: club.club_id || club.id,
          club_logo: club.club_logo,
          club_name: club.name,
        }))
      );
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.onBackground} />
        </TouchableOpacity>
      ),

      headerStyle: {
        backgroundColor: colors.background,
      },
      headerRight: () => (
        <TouchableOpacity onPress={() => onPostBtnClick()}>
          <Text style={[styles.postBtn, { color: "white" }]}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              "Post"
            )}
          </Text>
        </TouchableOpacity>
      ),
      headerTitle: "",
    });
  }, [content, followedClubValue, colors, loading]);

  useEffect(() => {
    if (!modalVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [modalVisible]);

  const onPostBtnClick = async () => {
    // Allow posting without content

    setLoading(true);

    let postMedia = [];
    try {
      if (selectedMediaRef.current && selectedMediaRef.current.length > 0) {
        for (const media of selectedMediaRef.current) {
          const uploadResponse = await uploadImageToCloudinary(
            media.uri,
            postOptions.folder,
            postOptions.upload_preset,
            media.type
          );
          postMedia.push({
            url: uploadResponse,
            type: media.type,
          });
        }
      }

      const result = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/post`,
        {
          content: content,
          media: postMedia,
          visibleIn: followedClubValue.club_id,
          email: userData?.email,
          user_id: userData?.id,
        }
      );

      if (result.status === 201) {
        Toast.show({
          text1: "Your post was sent",
          type: "success",
        });

        navigation.navigate("DrawerNavigator");
      }
    } catch (error) {
      Toast.show({
        text1: "Error creating post",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const pickMedia = async () => {
    const MAX_MEDIA = 4;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      let pickedMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type as "image" | "video",
      }));

      const combinedMedia = [...selectedMediaRef.current, ...pickedMedia];
      // Allow any amount of videos, but maintain 4-item total limit

      const unique = combinedMedia.filter(
        (media, index, self) =>
          index === self.findIndex((m) => m.uri === media.uri)
      );

      if (unique.length > MAX_MEDIA) {
        Toast.show({
          type: "error",
          text1: `You can only select up to ${MAX_MEDIA} media.`,
        });
        return;
      }

      selectedMediaRef.current = unique;
      setSelectedMedia(unique);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        ref={inputRef}
        placeholder="What's on your mind?"
        placeholderTextColor={Colors.GRAY}
        style={[
          styles.input,
          { backgroundColor: colors.background, color: colors.onBackground },
        ]}
        multiline
        numberOfLines={4}
        maxLength={1000}
        onChangeText={(text) => setContent(text)}
      />
      <Modal visible={!!previewMedia} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "black",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setPreviewMedia(null)}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 100,
              backgroundColor: "red",
              padding: 0,
              borderRadius: 99,
            }}
          >
            <Ionicons name="close" size={34} color="white" />
          </TouchableOpacity>

          {previewMedia?.type === "image" ? (
            <Image
              source={{ uri: previewMedia.uri }}
              style={{ width: "100%", height: "100%", resizeMode: "contain" }}
            />
          ) : previewMedia?.type === "video" ? (
            <VideoComponent uri={previewMedia.uri} shouldPlay={true} />
          ) : null}
        </View>
      </Modal>
      <View style={styles.mediaContainer}>
        <FlatList
          keyboardShouldPersistTaps="always"
          horizontal
          data={[
            ...selectedMedia,
            ...(selectedMedia.length < 4 ? [{ uri: "", type: "image" }] : []),
          ]}
          renderItem={({ item }: { item: { uri: string; type: string } }) =>
            item.uri ? (
              <Pressable
                style={styles.mediaItem}
                onPress={() => setPreviewMedia(item)}
              >
                {item.type === "image" ? (
                  <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                ) : (
                  <View style={styles.videoThumb}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.thumbnail}
                    />
                    <View style={styles.videoOverlay}>
                      <Ionicons
                        name="play-circle-outline"
                        size={40}
                        color="white"
                        style={styles.playIcon}
                      />
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => {
                    const filtered = selectedMediaRef.current.filter(
                      (m) => m.uri !== item.uri
                    );
                    selectedMediaRef.current = filtered;
                    setSelectedMedia(filtered);
                  }}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </Pressable>
            ) : null
          }
        />

        {selectedMedia.length === 0 && (
          <TouchableOpacity onPress={pickMedia}>
            <Image
              source={require("../../assets/images/image.png")}
              style={[
                styles.image,
                { borderColor: Colors.PRIMARY, borderWidth: 2 },
              ]}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.dropdownContainer}>
        <ModalDropdown
          modalVisible={modalVisible}
          value={followedClubValue}
          items={followedClubsItems}
          setModalVisible={setModalVisible}
          setValue={setFollowedClubValue}
          setItems={setFollowedClubsItems}
          header="Choose audience"
        />
      </View>

      {selectedMedia.length < 4 && selectedMedia.length > 0 && (
        <TouchableOpacity onPress={pickMedia} style={styles.addMediaBtn}>
          <Ionicons name="image" size={50} color={Colors.PRIMARY} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 10,
    marginTop: 10,
    height: 150,
    textAlignVertical: "top",
    fontSize: 16,
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 15,
    borderRadius: 15,
  },
  dropdownContainer: {
    marginTop: 15,
  },
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
  },
  postBtn: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginRight: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 99,
    elevation: 10,
    shadowColor: Colors.GRAY,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: Colors.PRIMARY,
  },
  mediaContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  mediaItem: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#000",
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  videoThumb: {
    width: 100,
    height: 100,
    borderRadius: 10,
    position: "relative",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  playIcon: {
    position: "absolute",
  },
  removeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 99,
    padding: 2,
    zIndex: 10,
  },
  addMediaBtn: {
    display: "flex",

    margin: 10,
  },
});
