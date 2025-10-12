import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Linking,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useColorScheme } from "react-native";
import SchoolSelector from "../../components/SchoolSelector";
import universities from "../../assets/world_universities_and_domains.json";
import Colors from "../../constants/Colors";
import { useTheme } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize";
import { useThemeContext } from "../../context/ThemeContext";
import CampuslyAlert from "../../components/CampuslyAlert";
import { DynamicHeader } from "../../components/VerificationScreen/DynamicHeader";
import axios from "axios";
import { RootStackParamList } from "../../navigation/StackNavigator";

export default function VerificationScreen() {
  const [query, setQuery] = useState("");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { colors } = useTheme();
  const { isDarkMode } = useThemeContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<{
    name: string;
    logo: string;
    country: string;
    web_pages: string;
    domains: string[];
  } | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<string>("");

  const messages = {
    success: {
      icon: "🏅",
      title: "You're Verified! 🎉",
      message:
        "Your school email is on point! You’ve earned your Campusly badge and unlocked full access. Time to explore, connect, and shine! 🚀",
    },
    error: {
      icon: "🤔",
      title: "Hmm... Something’s Off",
      message:
        "That email doesn’t match your school’s domain. Are you sure it's your official address? Try again, smarty! 🎓",
    },
  };

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
  }>(messages);

  useEffect(() => {
    const handleBackPress = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(
        universities
          .slice(0, 100) // clone to avoid mutating original
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    }

    const delayDebounce = setTimeout(() => {
      fetchSchools();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchSchools = () => {
    setLoading(true);
    setError(null);
    if (query) {
      const results = universities.filter((university) =>
        university.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(results);
    }
    setLoading(false);
  };

  const verifyEmail = async () => {
    setLoading(true);
    Keyboard.dismiss();
    const SchoolEmail = email.trim();

    if (!SchoolEmail.includes("@")) {
      setAlertMessage({
        ...alertMessage,
        error: {
          icon: "📧",
          title: "Invalid Email",
          message:
            "Looks like you forgot the '@' — even professors get it wrong sometimes!😁\n\nTry entering a valid school email to continue. 🎓",
        },
      });
      setIsAlertVisible(true);
      setAlertType("error");
      return;
    }

    const domainFromEmail = SchoolEmail.split("@")[1];
    const schoolDomains = selectedSchool?.domains || [];
    let isValid = false;

    if (SchoolEmail.includes("@")) {
      isValid = schoolDomains.some((domain: string) =>
        domainFromEmail.endsWith(domain)
      );
    }

    if (isValid) {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/otp/send-otp`,
        { email: SchoolEmail }
      );
      if (response.status === 200) {
        navigation.navigate("OTPVerificationScreen", { email: SchoolEmail });
      }
    } else {
      setAlertMessage({
        ...alertMessage,
        error: { ...messages.error },
      });
      setIsAlertVisible(true);
      setAlertType("error");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <DynamicHeader selectedSchool={selectedSchool} />
          {!selectedSchool && (
            <View style={{ width: "100%" }}>
              <Text style={[styles.title, { color: colors.onBackground }]}>
                What school do you attend?
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background }]}
                placeholder="🔍 Search for your school"
                placeholderTextColor="gray"
                value={query}
                onChangeText={setQuery}
              />
            </View>
          )}

          {loading && <ActivityIndicator size="small" color="#555" />}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {!results.length && !loading && !error && (
            <Text style={styles.noResultsText}>
              😕 No schools match that... Try checking the spelling!
            </Text>
          )}

          {!selectedSchool && (
            <View style={{ flex: 1 }}>
              <FlatList
                data={results}
                keyExtractor={(item) => item.name + item.domains[0]}
                renderItem={({ item }) => {
                  const logoUrl = `https://logo.clearbit.com/${item.domains[0]}`;
                  return (
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedSchool({
                          name: item.name,
                          logo: logoUrl,
                          country: item.country,
                          web_pages: item.web_pages[0],
                          domains: item.domains,
                        })
                      }
                    >
                      <View style={styles.schoolItem}>
                        <Image source={{ uri: logoUrl }} style={styles.logo} />
                        <Text style={{ color: colors.onBackground }}>
                          {item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                style={{ flex: 1 }}
              />
              <TouchableOpacity
                onPress={() => navigation.navigate("DrawerNavigator")}
              >
                <Text style={styles.clearText}>Skip</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ultra Modern Selected School Section */}
          {selectedSchool && (
            <View style={styles.modernSchoolContainer}>
              {/* Header with Close Button */}
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
                  onPress={() => setSelectedSchool(null)}
                >
                  <Ionicons name="close-circle" size={28} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Modern Info Cards */}
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
          )}
          {selectedSchool && (
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
                style={[styles.input, { backgroundColor: colors.background }]}
                placeholder="codecrafterx@wtu.edu.cn"
                placeholderTextColor="gray"
                value={email}
                onChangeText={setEmail}
              />

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
          )}
          <CampuslyAlert
            isVisible={isAlertVisible}
            type={alertType}
            onClose={() => setIsAlertVisible(false)}
            messages={alertMessage}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  lightBg: {
    backgroundColor: "white",
  },
  darkBg: {
    backgroundColor: "black",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  textDark: {
    color: "black",
  },
  textLight: {
    color: "white",
  },
  input: {
    width: "100%",
    color: Colors.PRIMARY,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputLight: {
    borderColor: "#d1d5db",
    backgroundColor: "#f3f4f6",
    color: "black",
  },
  inputDark: {
    borderColor: "#4b5563",
    backgroundColor: "#1f2937",
    color: "white",
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 8,
    elevation: 8,
    shadowColor: "green",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 8,
    opacity: 0.5,
  },
  schoolItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    color: "white",
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  selectedSchoolContainer: {
    position: "relative",
    width: "100%",
    padding: RFValue(10),
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colors.PRIMARY,
    elevation: 4,
    shadowColor: "green",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedSchoolLogo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  selectedSchoolText: {
    fontSize: RFValue(20),
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  selectedSchoolInfo: {
    marginTop: 10,
  },
  selectedSchoolInfoTextLight: {
    fontSize: RFValue(16),
    color: "#374151",
  },
  selectedSchoolInfoTextDark: {
    color: "#f9fafb",
    fontSize: RFValue(16),
  },
  selectedSchoolLabelTextLight: {
    fontWeight: "bold",
    color: "#6b7280",
  },
  selectedSchoolLabelTextDark: {
    fontWeight: "bold",
    color: "#9ca3af",
  },
  selectedSchoolHeader: {
    flexDirection: "column",
    alignItems: "center",
  },
  noResultsText: {
    color: "gray",
    textAlign: "center",
    marginTop: 10,
    fontSize: RFValue(16),
  },
  clearText: {
    color: Colors.PRIMARY,
    marginTop: 10,
    fontSize: RFValue(16),
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "center",
    overflow: "hidden",
  },
  // Ultra Modern Styles
  modernSchoolContainer: {
    width: "100%",
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(42, 157, 143, 0.1)",
  },
  modernHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
    borderRadius: 16,
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modernLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
});
