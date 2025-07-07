import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../constants/Colors";

const miniTabs = ["Posts", "Clubs", "Academic", "Events"];
const fullTabs = ["Posts", "Clubs", "Academic", "Events", "Comments", "Likes",];

export default function ActivitySectionScreen() {
  const [activeTab, setActiveTab] = useState(miniTabs[0]);
  const renderTabs = () => {
    return (
      <View style={styles.container}>
        {miniTabs.map((tab, index) => (
          <TouchableOpacity
            onPress={() => setActiveTab(tab)}
            style={activeTab === tab ? styles.activeTab : styles.tab}
            key={index}
          >
              <Text style={activeTab === tab ? styles.activeTabText : styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTabContent = ({ tab }: { tab: string }) => {
    return (
      
      <View>
          <Switch value={activeTab === "Posts"} />
if

        <Text>Tab Content</Text>
      </View>
    );
  };

  return (
    <View>
      {renderTabs()}
      {renderTabContent({ tab: activeTab })}
    </View>
  );
}

const ActivitySectionFullScreen = () => {
  return <View>{ActivitySectionScreen()}</View>;
};

const ActivitySectionMiniScreen = () => {
  return <View>{ActivitySectionScreen()}</View>;
};

export { ActivitySectionFullScreen, ActivitySectionMiniScreen };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tab: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.GRAY,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 99,
    paddingVertical: 8,
  },

  activeTab: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 99,
    paddingVertical: 8,
    backgroundColor: Colors.DARK_GRAY,
  },
  activeTabText: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.WHITE,
  },
  tabText: {
    fontSize: RFValue(15),
    fontWeight: "bold",
    color: Colors.GRAY,
  },
});
