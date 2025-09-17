import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../constants/Colors";
import { AuthContext } from "../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import Button from "../components/ui/Button";
import CampuslyAlert from "../components/CampuslyAlert";

export default function ClubRules() {
  const { colors } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { userData } = useContext(AuthContext);

  const { club } = route.params as { club: any };

  const [rules, setRules] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/club/rules/${club.id}`
      );

      if (response.status === 200) {
        setRules(response.data.data?.rules || "");
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
      // If rules don't exist yet, that's okay - we'll show empty state
      setRules("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRules = async () => {
    if (!rules.trim()) {
      Toast.show({
        type: "error",
        text1: "Rules cannot be empty",
        text2: "Please enter some club rules",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/club/rules/${club.id}`,
        {
          user_id: userData?.id,
          rules: rules.trim(),
        }
      );

      if (response.status === 200 || response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Rules updated! 📝",
          text2: "Club rules have been successfully saved",
        });
        setIsEditing(false);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        Toast.show({
          type: "error",
          text1: "Failed to save rules",
          text2: error.response?.data?.message || "Please try again",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const handleCancelEdit = () => {
    setShowCancelAlert(true);
  };

  const confirmCancelEdit = () => {
    fetchRules(); // Reset to original rules
    setIsEditing(false);
    setShowCancelAlert(false);
  };

  const defaultRules = `Welcome to ${club.name}! Please follow these guidelines:

1. Be respectful and kind to all members
2. No spam, harassment, or inappropriate content
3. Stay on topic and contribute meaningfully
4. No personal attacks or discrimination
5. Respect others' privacy and opinions
6. Report any violations to admins
7. Have fun and build a positive community!`;

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Icon name="loading" size={32} color={Colors.PRIMARY} />
        <Text style={[styles.loadingText, { color: colors.onBackground }]}>
          Loading rules...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
          Club Rules
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.infoHeader}>
            <Icon name="information" size={20} color={Colors.PRIMARY} />
            <Text style={[styles.infoTitle, { color: colors.onBackground }]}>
              About Club Rules
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.onSurfaceVariant }]}>
            Set clear guidelines for your club members. These rules help
            maintain a positive and respectful community environment.
          </Text>
        </View>

        <View style={[styles.rulesCard, { backgroundColor: colors.surface }]}>
          <View style={styles.rulesHeader}>
            <Text style={[styles.rulesTitle, { color: colors.onBackground }]}>
              {club.name} Rules
            </Text>
            {!isEditing && !!rules && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Icon name="pencil" size={16} color={Colors.PRIMARY} />
                <Text
                  style={[styles.editButtonText, { color: Colors.PRIMARY }]}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View>
              <TextInput
                style={[
                  styles.rulesInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.onBackground,
                    borderColor: Colors.PRIMARY,
                  },
                ]}
                value={rules}
                onChangeText={setRules}
                placeholder="Enter your club rules here..."
                placeholderTextColor={colors.onSurfaceVariant}
                multiline
                textAlignVertical="top"
                maxLength={2000}
              />
              <Text
                style={[
                  styles.characterCount,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {rules.length}/2000 characters
              </Text>

              <View style={styles.editActions}>
                <Button
                  onPress={handleCancelEdit}
                  viewStyle={[styles.actionButton, styles.cancelButton]}
                  outline={true}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleSaveRules}
                  viewStyle={[styles.actionButton, styles.saveButton]}
                  isLoading={isSaving}
                >
                  Save Rules
                </Button>
              </View>
            </View>
          ) : (
            <View>
              {rules ? (
                <Text
                  style={[styles.rulesText, { color: colors.onBackground }]}
                >
                  {rules}
                </Text>
              ) : (
                <View style={styles.emptyRules}>
                  <Icon
                    name="text-box-outline"
                    size={48}
                    color={colors.onSurfaceVariant}
                  />
                  <Text
                    style={[styles.emptyTitle, { color: colors.onBackground }]}
                  >
                    No rules set yet
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtitle,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Tap "Edit" to add rules for your club
                  </Text>
                  <Button
                    onPress={() => {
                      setRules(defaultRules);
                      setIsEditing(true);
                    }}
                    viewStyle={styles.addRulesButton}
                  >
                    Add Default Rules
                  </Button>
                  <Button
                    onPress={() => {
                      setRules("");
                      setIsEditing(true);
                    }}
                    viewStyle={[styles.addRulesButton, { marginTop: 10 }]}
                    outline={true}
                  >
                    Create Yours
                  </Button>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <CampuslyAlert
        isVisible={showCancelAlert}
        type="error"
        onClose={() => setShowCancelAlert(false)}
        messages={{
          success: {
            title: "Changes Discarded! 📝",
            message:
              "Your changes have been discarded and the original rules restored.",
            icon: "🎉",
          },
          error: {
            title: "Discard Changes? ⚠️",
            message:
              "Are you sure you want to discard your changes? This action cannot be undone.",
            icon: "⚠️",
          },
        }}
        onPress={confirmCancelEdit}
        onPress2={() => setShowCancelAlert(false)}
        buttonText="Yes, discard"
        buttonText2="Keep editing"
        overrideDefault={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: RFValue(16),
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: RFValue(16),
    fontWeight: "600",
    marginLeft: 8,
  },
  infoText: {
    fontSize: RFValue(14),
    lineHeight: RFValue(20),
  },
  rulesCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rulesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rulesTitle: {
    fontSize: RFValue(18),
    fontWeight: "700",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: `${Colors.PRIMARY}20`,
  },
  editButtonText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    marginLeft: 4,
  },
  rulesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
  },
  characterCount: {
    fontSize: RFValue(12),
    textAlign: "right",
    marginTop: 4,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  cancelButton: {
    borderColor: "#666",
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
  },
  rulesText: {
    fontSize: RFValue(16),
    lineHeight: RFValue(24),
  },
  emptyRules: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: RFValue(14),
    marginTop: 8,
    textAlign: "center",
    lineHeight: RFValue(20),
  },
  addRulesButton: {
    marginTop: 16,
    width: "auto",
    paddingHorizontal: 24,
  },
});
