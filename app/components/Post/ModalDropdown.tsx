import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Keyboard,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleProp, ViewStyle, TextStyle } from "react-native";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";
interface Item {
  club_id: number;
  club_name: string;
  club_logo: string;
  id?: number;
}

const ModalDropdown = ({
  modalVisible,
  value,
  items,
  setModalVisible,
  setValue,
  setItems,
  header,
  placeholder,
  style,
}: {
  modalVisible: boolean;
  value: { club_name: string; club_id: number };
  items: Item[];
  setModalVisible: (visible: boolean) => void;
  setValue: (value: { club_name: string; club_id: number }) => void;
  setItems: (items: Item[]) => void;
  header?: string;
  placeholder?: string;
  style?: StyleProp<ViewStyle | TextStyle>;
}) => {
  const { colors } = useTheme();

  const selectOption = (option: any) => {
    setValue(option);
    setModalVisible(false);
  };

  return (
    <View>
      {/* Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Keyboard.dismiss();
          setTimeout(() => {
            setModalVisible(true);
          }, 100);
        }}
      >
        <Text style={styles.buttonText}>{value.club_name}</Text>
        <Ionicons name="chevron-down" size={18} color={Colors.PRIMARY} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View
            style={[styles.dropdown, { backgroundColor: colors.background }]}
          >
            <View style={styles.dropdownHeader}>
              <Text
                style={[
                  styles.dropdownHeaderText,
                  { color: colors.onBackground },
                ]}
              >
                {header}
              </Text>

              <TouchableOpacity
                style={styles.defaultItem}
                onPress={() =>
                  selectOption({ club_name: "Public", club_id: 0 })
                }
              >
                <View style={styles.dropdownIconContainer}>
                  <Ionicons name="earth" size={20} color="white" />
                </View>
                <Text
                  style={[
                    styles.audienceItemText,
                    { color: colors.onBackground },
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.audienceItemContainer}>
              <Text
                style={[
                  styles.audienceItemHeader,
                  { color: colors.onBackground },
                ]}
              >
                My Clubs
              </Text>
              <FlatList
                data={items}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.audienceItem}
                    onPress={() =>
                      selectOption({
                        club_name: item.club_name,
                        club_id: item.club_id || item.id,
                      })
                    }
                  >
                    <View style={styles.dropdownIconContainer}>
                      <Image
                        source={{ uri: item.club_logo }}
                        style={styles.audienceItemImage}
                      />
                    </View>
                    <Text
                      style={[
                        styles.audienceItemText,
                        { color: colors.onBackground },
                      ]}
                    >
                      {item.club_name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  defaultItem: {
    flexDirection: "row",
    alignItems: "center",
    color: Colors.GRAY,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 14,
    color: Colors.PRIMARY,
    marginRight: 6,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  dropdown: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
    width: "100%",
    elevation: 5,
  },

  dropdownIconContainer: {
    marginRight: 20,
    borderWidth: 1,
    backgroundColor: Colors.PRIMARY,
    width: 70,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  option: {
    padding: 15,
  },

  dropdownHeader: {
    paddingBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownHeaderText: {
    paddingBottom: 10,
    alignSelf: "center",
    fontWeight: "800",
    fontSize: 23,
    color: "#333",
  },
  audienceItemContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  audienceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    color: Colors.GRAY,
    marginBottom: 18,
  },
  audienceItemHeader: {
    paddingVertical: 10,
    fontWeight: "800",
    fontSize: 23,
    color: "#333",
  },
  audienceItemText: {
    fontSize: 20,
    color: "#333",
  },
  audienceItemImage: {
    width: 70,
    height: 60,
    borderRadius: 10,
  },
});

export default ModalDropdown;
