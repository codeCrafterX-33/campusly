import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleProp, ViewStyle, TextStyle } from "react-native";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";
interface Item {
  id: string;
  label: string;
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
  value: string;
  items: Item[];
  setModalVisible: (visible: boolean) => void;
  setValue: (value: string) => void;
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
        <Text style={styles.buttonText}>{value}</Text>
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
                style={styles.audienceItem}
                onPress={() => selectOption("Public")}
              >
                <View style={styles.dropdownIconContainer}>
                  <Ionicons name="earth" size={20} color="white" />
                </View>
                <Text
                  style={[styles.audienceItemText, { color: colors.onBackground }]}
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
                    onPress={() => selectOption(item.label)}
                  >
                    <View style={styles.dropdownIconContainer}>
                      <Ionicons name="earth" size={20} color="white" />
                    </View>
                    <Text
                      style={[
                        styles.audienceItemText         ,
                        { color: colors.onBackground },
                      ]}
                    >
                      {item.label}
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
    height: 350,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
    width: "100%",
    elevation: 5,
  },

  dropdownIconContainer: {
    marginRight: 10,
    borderWidth: 1,
    backgroundColor: Colors.PRIMARY,
    width: 50,
    height: 50,
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
  },
  audienceItemHeader: {
    paddingVertical: 10,
    fontWeight: "800",
    fontSize: 23,
    color: "#333",
  },
  audienceItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default ModalDropdown;
