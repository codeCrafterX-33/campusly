import React, { useState, useContext } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import {
  Avatar,
  Drawer,
  Text,
  TouchableRipple,
  Switch,
  useTheme,
  Surface,
} from "react-native-paper";

import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { Typography } from "../../components/shared/Typography";
import { AuthContext } from "../../context/AuthContext";
import Colors from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";
import usePersistedState from "../../util/PersistedState";
export function CustomDrawerContent(props: any) {
  const authCtx = useContext(AuthContext);
  const { isDarkMode, setIsDarkMode } = useThemeContext();
  const [expanded, setExpanded] = usePersistedState("expanded", false);

  const { colors } = useTheme();

  return (
    <DrawerContentScrollView
      {...props}
      style={[styles.drawerContent, { backgroundColor: colors.background }]}
    >
      <Drawer.Section style={[styles.drawerSection]}>
        <View style={styles.userInfoSection}>
          <TouchableOpacity
            style={{ marginBottom: -10 }}
            onPress={() => {
              props.navigation.navigate("Profile");
            }}
          >
            <Avatar.Image
              source={{
                uri: authCtx.user?.image,
              }}
              size={50}
            />
          </TouchableOpacity>
          <Typography
            variant="titleMedium"
            style={[styles.title, { color: colors.onBackground }]}
          >
            {authCtx.user?.name}
          </Typography>
          <Typography variant="titleLarge" style={[styles.caption]}>
            {authCtx.user?.email}
          </Typography>
          <View style={styles.row}>
            <View style={styles.section}>
              <Typography
                style={[styles.paragraph, { color: colors.onBackground }]}
              >
                202
              </Typography>
              <Typography style={[styles.caption]}>Following</Typography>
            </View>
            <View style={styles.section}>
              <Typography
                variant="bodyMedium"
                style={[styles.paragraph, { color: colors.onSurface }]}
              >
                159
              </Typography>

              <Typography style={[styles.caption]}>Followers</Typography>
            </View>
          </View>
        </View>
      </Drawer.Section>

      <Drawer.Section style={[styles.drawerSection]}>
        <DrawerItem
          icon={({ color, size }) => (
            <Icon
              name="account-outline"
              color={colors.onBackground}
              size={size}
            />
          )}
          label="Profile"
          labelStyle={{ color: colors.onBackground }}
          onPress={() => {
            props.navigation.navigate("Profile");
          }}
        />
        <DrawerItem
          icon={({ color, size }) => (
            <Icon name="tune" color={colors.onBackground} size={size} />
          )}
          label="Preferences"
          labelStyle={{ color: colors.onBackground }}
          onPress={() => {}}
        />
        <DrawerItem
          icon={({ color, size }) => (
            <Icon
              name="bookmark-outline"
              color={colors.onBackground}
              size={size}
            />
          )}
          label="Bookmarks"
          labelStyle={{ color: colors.onBackground }}
          onPress={() => {}}
        />

        <View style={{ paddingBottom: 10 }} />
      </Drawer.Section>

      <View style={{ paddingTop: 10 }}>
        <TouchableRipple
          onPress={() => {
            setExpanded(!expanded);
          }}
        >
          <View style={styles.preference}>
            <Text>Preferences</Text>
            <Icon
              name={expanded ? "chevron-up" : "chevron-down"}
              size={24}
              color={expanded ? Colors.PRIMARY : colors.onBackground}
            />
          </View>
        </TouchableRipple>

        {expanded && (
          <>
            <TouchableRipple
              onPress={() => {
                setIsDarkMode(!isDarkMode);
                props.navigation.closeDrawer();
              }}
            >
              <View style={styles.preference}>
                <Text>Dark Theme</Text>
                <View pointerEvents="none">
                  <Switch value={isDarkMode} />
                </View>
              </View>
            </TouchableRipple>
            <TouchableRipple onPress={() => {}}>
              <View style={styles.preference}>
                <Text>RTL</Text>
                <View pointerEvents="none">
                  <Switch value={false} />
                </View>
              </View>
            </TouchableRipple>
          </>
        )}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  title: {
    marginTop: 20,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    color: Colors.GRAY,
    fontWeight: "bold",
  },
  row: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
    marginBottom: 10,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
