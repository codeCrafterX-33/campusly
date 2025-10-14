import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Linking,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "react-native-paper";
import Colors from "../../constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import { useThemeContext } from "../../context/ThemeContext";
import CampuslyAlert from "../../components/CampuslyAlert";
import axios from "axios";
import { RootStackParamList } from "../../navigation/StackNavigator";

type EmailVerificationScreenRouteProp = RouteProp<
  RootStackParamList,
  "EmailVerificationScreen"
>;
type EmailVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "EmailVerificationScreen"
>;

export default function EmailVerificationScreen() {
  const navigation = useNavigation<EmailVerificationScreenNavigationProp>();
  const route = useRoute<EmailVerificationScreenRouteProp>();
  const { colors } = useTheme();
  const { isDarkMode } = useThemeContext();

  const selectedSchool = route.params?.selectedSchool;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<{
    success: {
      icon: string;
      title: string;
      message: string;
    };
    error: {
      icon: string;
      title: string;
      message: string;
    };
  }>({
    success: {
      icon: "🏅",
      title: "You're Verified! 🎉",
      message:
        "Your school email is on point! You've earned your Campusly badge and unlocked full access. Time to explore, connect, and shine! 🚀",
    },
    error: {
      icon: "🤔",
      title: "Hmm... Something's Off",
      message:
        "That email doesn't match your school's domain. Are you sure it's your official address? Try again, smarty! 🎓",
    },
  });

  // Ref for school email input
  const schoolEmailInputRef = useRef<TextInput>(null);

  const verifyEmail = async () => {
    if (!email || !selectedSchool) return;

    setLoading(true);
    setEmailError("");

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/otp/send-otp`,
        {
          email: email,
        }
      );

      if (response.status === 200) {
        // Navigate to OTP verification screen
        navigation.navigate("OTPVerificationScreen", {
          email: email,
        });
      }
    } catch (error: any) {
      // Check if it's the "already used" error
      if (error.response?.status === 409) {
        setEmailError(
          "This school email has already been used to verify another account"
        );
        setAlertMessage({
          ...alertMessage,
          error: {
            icon: "🚫",
            title: "Oops! Email Already Taken",
            message:
              "This school email has already been used to verify another account. Looks like someone beat you to it! Try a different email or contact support if this is your email. 🎓",
          },
        });
        setAlertType("error");
        setIsAlertVisible(true);
        // Don't show generic error for 409 - we handle it specifically above
        return;
      } else {
        console.error("Error sending OTP:", error);
        setAlertType("error");
        setIsAlertVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!selectedSchool) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.onBackground }]}>
            No school selected
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: Colors.PRIMARY }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar backgroundColor={Colors.PRIMARY} barStyle="light-content" />
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 90}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* School Info */}
            <View style={styles.modernSchoolContainer}>
              <View style={styles.modernHeader}>
                <View style={styles.modernHeaderContent}>
                  <View style={styles.modernLogoContainer}>
                    <Image
                      source={{ uri: selectedSchool.logo }}
                      style={styles.modernLogo}
                      defaultSource={require("../../assets/images/image.png")}
                    />
                  </View>
                  <View style={styles.modernSchoolInfo}>
                    <Text style={styles.modernSchoolName}>
                      {selectedSchool.name}
                    </Text>
                    <View style={styles.modernBadge}>
                      <Text style={styles.modernBadgeText}>
                        🎓 {selectedSchool.country}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.modernCloseButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="close-circle" size={28} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.modernInfoGrid}>
                <View style={styles.modernInfoCard}>
                  <View style={styles.modernInfoIcon}>
                    <Text style={styles.modernInfoIconText}>🌍</Text>
                  </View>
                  <View style={styles.modernInfoContent}>
                    <Text style={styles.modernInfoLabel}>Country</Text>
                    <Text style={styles.modernInfoValue}>
                      {selectedSchool.country}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modernInfoCard}
                  onPress={() => Linking.openURL(selectedSchool.web_pages)}
                >
                  <View style={styles.modernInfoIcon}>
                    <Text style={styles.modernInfoIconText}>🔗</Text>
                  </View>
                  <View style={styles.modernInfoContent}>
                    <Text style={styles.modernInfoLabel}>Website</Text>
                    <Text style={styles.modernInfoValue} numberOfLines={1}>
                      {selectedSchool.web_pages}
                    </Text>
                  </View>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={Colors.PRIMARY}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Email Input */}
            <View style={{ width: "100%", marginTop: 20 }}>
              <Text
                style={{
                  color: colors.onBackground,
                  fontSize: RFValue(16),
                  marginBottom: 7,
                }}
              >
                Enter your school email
              </Text>
              <TextInput
                ref={schoolEmailInputRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: emailError ? "#EF4444" : "#ddd",
                  },
                ]}
                placeholder="codecrafterx@wtu.edu.cn"
                placeholderTextColor="gray"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(""); // Clear error when user types
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="done"
              />
              {emailError && (
                <Text style={[styles.errorText, { color: "#EF4444" }]}>
                  {emailError}
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Sticky Button */}
          <View
            style={[
              styles.stickyButtonContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <TouchableOpacity
              style={[!email ? styles.disabledButton : styles.button]}
              disabled={!email}
              onPress={() => verifyEmail()}
            >
              <Text style={styles.buttonText}>
                {loading ? "Verifying..." : "Verify school email"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <CampuslyAlert
          isVisible={isAlertVisible}
          type={alertType}
          onClose={() => setIsAlertVisible(false)}
          messages={alertMessage}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 10,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: RFValue(18),
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modernSchoolContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modernHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modernHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modernLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  modernLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modernSchoolInfo: {
    flex: 1,
  },
  modernSchoolName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 24,
  },
  modernBadge: {
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  modernBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.PRIMARY,
  },
  modernCloseButton: {
    padding: 4,
  },
  modernInfoGrid: {
    gap: 12,
  },
  modernInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(42, 157, 143, 0.05)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(42, 157, 143, 0.1)",
  },
  modernInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modernInfoIconText: {
    fontSize: 18,
  },
  modernInfoContent: {
    flex: 1,
  },
  modernInfoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modernInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    color: Colors.PRIMARY,
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  stickyButtonContainer: {
    margin: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
