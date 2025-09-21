import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
  Dimensions,
  SafeAreaView,
  BackHandler,
  ActivityIndicator,
  Image,
} from "react-native";
import React, {
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
import RenderEditProfileSection from "./RenderEditProfileSection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfileSaveButton from "./ProfileSaveButton";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

// Debounce utility function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Calculate relevance score for search results
const calculateRelevance = (text: string, query: string): number => {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  if (textLower === queryLower) return 100; // Exact match
  if (textLower.startsWith(queryLower)) return 90; // Starts with query
  if (textLower.includes(queryLower)) return 70; // Contains query
  if (queryLower.includes(textLower)) return 50; // Query contains text

  // Calculate similarity based on common characters
  const commonChars = queryLower
    .split("")
    .filter((char) => textLower.includes(char)).length;
  return (commonChars / query.length) * 30;
};

export default function EditProfile({ route }: { route: any }) {
  const navigation = useNavigation();
  // Destructure the parameters passed from the previous screen
  const { userEmail, sectionToEdit } = route.params;
  const { colors } = useTheme();
  const { userData, setUserData, education } = useContext(AuthContext);

  // Cache for search results
  const searchCache = useRef<Map<string, any[]>>(new Map());

  // Education options - will be fetched from database later
  const educationOptions = [
    { value: "high_school", label: "High School" },
    { value: "associate", label: "Associate's Degree" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "doctorate", label: "Doctorate/PhD" },
    { value: "other", label: "Other" },
  ];
  const [skills, setSkills] = useState<string[]>(userData?.skills || []);
  const [interests, setInterests] = useState<string[]>(
    userData?.interests || []
  );
  const [intro, setIntro] = useState<string>("");
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [activeSection, setActiveSection] = useState<"skills" | "interests">(
    "skills"
  );
  const [aboutText, setAboutText] = useState("");
  const [headline, setHeadline] = useState(userData?.headline || "");
  const [country, setCountry] = useState(userData?.country || "");
  const [city, setCity] = useState(userData?.city || "");

  const [firstName, setFirstName] = useState(userData?.firstname || "");
  const [lastName, setLastName] = useState(userData?.lastname || "");
  const [school, setSchool] = useState(userData?.school || "");
  const [isSchoolModalVisible, setIsSchoolModalVisible] = useState(false);
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [countryQuery, setCountryQuery] = useState(userData?.country || "");
  const [cityQuery, setCityQuery] = useState(userData?.city || "");
  const [countries, setCountries] = useState<
    Array<{ name: string; flag: string; capital: string; countryCode: string }>
  >([]);
  const [cities, setCities] = useState<
    Array<{
      name: string;
      country: string;
      region: string;
      isOutOfCountry?: boolean;
    }>
  >([]);
  const [isSearchingCountries, setIsSearchingCountries] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validation state for intro fields
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [headlineError, setHeadlineError] = useState("");
  const [countryError, setCountryError] = useState("");
  const [cityError, setCityError] = useState("");

  // Validation functions for intro fields
  const validateFirstName = (text: string) => {
    if (text.length > 30) {
      setFirstNameError("First name must be 30 characters or less");
      return false;
    } else {
      setFirstNameError("");
      return true;
    }
  };

  const validateLastName = (text: string) => {
    if (text.length > 30) {
      setLastNameError("Last name must be 30 characters or less");
      return false;
    } else {
      setLastNameError("");
      return true;
    }
  };

  const validateHeadline = (text: string) => {
    if (text.length > 200) {
      setHeadlineError("Headline must be 200 characters or less");
      return false;
    } else {
      setHeadlineError("");
      return true;
    }
  };

  const validateCountry = (text: string) => {
    if (text.length > 50) {
      setCountryError("Country must be 50 characters or less");
      return false;
    } else {
      setCountryError("");
      return true;
    }
  };

  const validateCity = (text: string) => {
    if (text.length > 50) {
      setCityError("City must be 50 characters or less");
      return false;
    } else {
      setCityError("");
      return true;
    }
  };

  // Check if intro form is valid
  const isIntroFormValid = () => {
    return (
      !firstNameError &&
      !lastNameError &&
      !headlineError &&
      !countryError &&
      !cityError
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title:
        sectionToEdit === "skills"
          ? "Edit Skills & Interests"
          : `Edit ${sectionToEdit}`, // Dynamic title based on section being edited
      headerStyle: {
        backgroundColor: colors.background,
        shadowColor: "transparent",
      },
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: RFValue(18),
        color: colors.onBackground,
      },
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 15 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back-outline"
            size={24}
            color={colors.onBackground} // Back icon
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Initialize form fields with user data
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstname || "");
      setLastName(userData.lastname || "");
      setHeadline(userData.headline || "");
      setCountry(userData.country || "");
      setCity(userData.city || "");
      setAboutText(userData.about || "");
      setSkills(userData.skills || []);
      setInterests(userData.interests || []);
    }
  }, [userData]);

  // Handle back press
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true; // Prevent default back behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Function to convert country code to flag emoji
  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Debounced search functions for countries and cities
  const searchCountries = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setCountries([]);
        return;
      }

      const cacheKey = `countries_${query.toLowerCase()}`;
      if (searchCache.current.has(cacheKey)) {
        setCountries(searchCache.current.get(cacheKey) || []);
        return;
      }

      setIsSearchingCountries(true);
      try {
        const response = await axios.get(
          `https://restcountries.com/v3.1/name/${query}`,
          { timeout: 5000 }
        );
        const countryData = response.data
          .map((country: any) => ({
            name: country.name.common,
            flag: getCountryFlag(country.cca2 || ""),
            capital: country.capital?.[0] || "",
            countryCode: country.cca2 || "",
            relevance: calculateRelevance(country.name.common, query),
          }))
          .sort((a: any, b: any) => b.relevance - a.relevance)
          .slice(0, 15);

        searchCache.current.set(cacheKey, countryData);
        setCountries(countryData);
      } catch (error) {
        console.warn("Country search error:", error);
        setCountries([]);
      } finally {
        setIsSearchingCountries(false);
      }
    }, 300),
    []
  );

  const searchCities = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setCities([]);
        return;
      }

      const targetCountry = country || userData?.country;
      const cacheKey = `cities_${query.toLowerCase()}_${
        targetCountry || "all"
      }`;

      if (searchCache.current.has(cacheKey)) {
        setCities(searchCache.current.get(cacheKey) || []);
        return;
      }

      setIsSearchingCities(true);
      try {
        const encodedQuery = encodeURIComponent(query);

        // Build search URL with country filter if available
        let searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=30&accept-language=en&featuretype=city`;

        if (targetCountry) {
          searchUrl += `&countrycodes=${targetCountry.toLowerCase()}`;
        }

        const response = await axios.get(searchUrl, { timeout: 8000 });

        const cityData = response.data
          .filter((place: any) => {
            // More precise city filtering
            const isCity =
              (place.class === "place" && place.type === "city") ||
              (place.class === "boundary" && place.addresstype === "city") ||
              (place.importance && place.importance > 0.3);

            const queryLower = query.toLowerCase();
            const placeName = (place.name || "").toLowerCase();
            const displayName = (place.display_name || "").toLowerCase();

            const nameMatch =
              placeName.includes(queryLower) ||
              queryLower.includes(placeName) ||
              displayName.includes(queryLower);

            return isCity && nameMatch;
          })
          .map((place: any) => ({
            name: place.name || place.display_name.split(",")[0],
            country: place.address?.country || "",
            region: place.address?.state || place.address?.province || "",
            country_code: place.address?.country_code || "",
            relevance: calculateRelevance(place.name || "", query),
            isOutOfCountry: targetCountry
              ? place.address?.country !== targetCountry
              : false,
          }))
          .filter((city: any) => city.name && city.country)
          .sort((a: any, b: any) => {
            // Sort by relevance, then by importance
            if (a.relevance !== b.relevance) return b.relevance - a.relevance;
            return (b.importance || 0) - (a.importance || 0);
          })
          .slice(0, 15);

        searchCache.current.set(cacheKey, cityData);
        setCities(cityData);
      } catch (error) {
        console.warn("City search error:", error);
        setCities([]);
      } finally {
        setIsSearchingCities(false);
      }
    }, 400),
    [country, userData?.country]
  );

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple saves

    setIsSaving(true);
    try {
      // Update local state first
      const updatedUserData = {
        ...userData,
        about: aboutText ? aboutText : userData?.about,
        skills: (skills || []).length > 0 ? skills : userData?.skills,
        interests:
          (interests || []).length > 0 ? interests : userData?.interests,
        headline: headline || userData?.bio,
        country: country || userData?.country,
        city: city || userData?.city,
        firstName: firstName || userData?.firstname,
        lastName: lastName || userData?.lastname,
        school: school || userData?.school,
      };

      setUserData(updatedUserData);

      // Prepare data for server
      const serverData = {
        about: updatedUserData.about,
        skills: updatedUserData.skills,
        interests: updatedUserData.interests,
        headline: updatedUserData.headline,
        country: updatedUserData.country,
        city: updatedUserData.city,
        firstName: updatedUserData.firstName,
        lastName: updatedUserData.lastName,
        school: updatedUserData.school,
      };

      console.log("Sending data to server:", serverData);
      console.log(
        "Server URL:",
        `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${userEmail}`
      );

      // Update in database
      const response = await axios.put(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${userEmail}`,
        serverData
      );

      if (response.status === 200) {
        console.log("User updated successfully in database");
        navigation.goBack();
      } else {
        console.error("Failed to update user in database");
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error updating user:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = () => {
    return (
      <RenderEditProfileSection
        sectionToEdit={sectionToEdit}
        skills={skills}
        interests={interests}
        aboutText={aboutText}
        onAboutTextChange={setAboutText}
        firstName={firstName}
        onFirstNameChange={(text) => {
          setFirstName(text);
          validateFirstName(text);
        }}
        lastName={lastName}
        onLastNameChange={(text) => {
          setLastName(text);
          validateLastName(text);
        }}
        headline={headline}
        onHeadlineChange={(text) => {
          setHeadline(text);
          validateHeadline(text);
        }}
        country={country}
        onCountryChange={(text) => {
          setCountry(text);
          validateCountry(text);
        }}
        city={city}
        onCityChange={(text) => {
          setCity(text);
          validateCity(text);
        }}
        school={school}
        onOpenSchoolModal={(mode) => {
          if (mode === "select") {
            setIsSchoolModalVisible(true);
          }
        }}
        onOpenCountryModal={() => setIsCountryModalVisible(true)}
        onOpenCityModal={() => setIsCityModalVisible(true)}
        onOpenSection={(section) => {
          setActiveSection(section);
          setIsModalVisible(true);
        }}
        // Error states for validation
        firstNameError={firstNameError}
        lastNameError={lastNameError}
        headlineError={headlineError}
        countryError={countryError}
        cityError={cityError}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom:
                sectionToEdit === "about" ? RFValue(20) : RFValue(200),
              backgroundColor: colors.background,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            {renderSection()}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Save Button - Sticks to bottom */}
        {sectionToEdit && (
          <View
            style={[
              styles.saveButtonContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <ProfileSaveButton
              sectionToSave={sectionToEdit}
              dataToSave={
                sectionToEdit === "about"
                  ? aboutText
                  : sectionToEdit === "skills"
                  ? { skills: skills, interests: interests }
                  : sectionToEdit === "intro"
                  ? {
                      firstName: firstName,
                      lastName: lastName,
                      headline: headline,
                      country: country,
                      city: city,
                      school: school,
                    }
                  : intro
              }
              handleSave={handleSave}
              isFormValid={
                sectionToEdit === "intro" ? isIntroFormValid : undefined
              }
              isLoading={isSaving}
            />
          </View>
        )}
      </View>

      {/* Full Screen Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: colors.background }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
        >
          <View style={styles.fullScreenModal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setIsEditingSkills(false);
                  setIsEditingInterests(false);
                  setNewSkill("");
                  setNewInterest("");
                }}
              >
                <Ionicons name="arrow-back" size={RFValue(24)} color={"#fff"} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle]}>Edit Skills & Interests</Text>
              <View style={{ width: RFValue(24) }} />
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeSection === "skills" && styles.activeTabButton,
                ]}
                onPress={() => setActiveSection("skills")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeSection === "skills" && styles.activeTabText,
                  ]}
                >
                  Skills ({(skills || []).length}/5)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeSection === "interests" && styles.activeTabButton,
                ]}
                onPress={() => setActiveSection("interests")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeSection === "interests" && styles.activeTabText,
                  ]}
                >
                  Interests ({(interests || []).length}/5)
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={[
                styles.modalScrollView,
                { backgroundColor: colors.background },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              {activeSection === "skills" ? (
                /* Skills Section */
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Text
                      style={[
                        styles.modalSectionTitle,
                        { color: colors.onBackground },
                      ]}
                    >
                      Your Skills
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsEditingSkills(!isEditingSkills)}
                    >
                      {isEditingSkills ? (
                        <Text
                          style={{
                            color: Colors.PRIMARY,
                            fontSize: RFValue(16),
                          }}
                        >
                          Done
                        </Text>
                      ) : (
                        <Ionicons
                          name="pencil-outline"
                          size={RFValue(20)}
                          color={Colors.PRIMARY}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalSectionSubHeader}>
                    <Text style={[styles.modalSectionSubHeaderText]}>
                      {isEditingSkills
                        ? "Remove or add your skills below"
                        : "Show off your top skills — add up to 5 things you want to be known for. They'll shine here and in your Skills section ✨"}
                    </Text>
                  </View>

                  {/* Skills List */}
                  {(skills || []).length <= 0 && (
                    <View style={styles.placeholderContainer}>
                      <Text
                        style={[
                          styles.placeholderText,
                          { color: colors.onBackground },
                        ]}
                      >
                        No skills added yet… what are you waiting for? 🚀
                      </Text>
                    </View>
                  )}
                  <View style={styles.modalListContainer}>
                    {(skills || []).map((skill, index) => (
                      <View key={index} style={styles.modalListItem}>
                        {isEditingSkills && (
                          <TouchableOpacity
                            onPress={() =>
                              setSkills((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                            style={styles.deleteButton}
                          >
                            <Ionicons
                              name="close-circle"
                              size={RFValue(20)}
                              color="#ff4444"
                            />
                          </TouchableOpacity>
                        )}
                        <Text
                          style={[
                            styles.modalListItemText,
                            { color: colors.onBackground },
                          ]}
                        >
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Add Skill Section */}
                  {isEditingSkills && (
                    <View style={styles.addSection}>
                      <TextInput
                        placeholder="Add a skill..."
                        value={newSkill}
                        onChangeText={(text) => setNewSkill(text)}
                        placeholderTextColor={colors.onSurfaceVariant}
                        style={[
                          styles.modalInput,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.outline,
                            color: colors.onBackground,
                          },
                        ]}
                        onSubmitEditing={() => {
                          if (
                            newSkill.trim() &&
                            !(skills || []).includes(newSkill.trim()) &&
                            (skills || []).length < 5
                          ) {
                            setSkills([...(skills || []), newSkill.trim()]);
                            setNewSkill("");
                          }
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          if (
                            newSkill.trim() &&
                            !(skills || []).includes(newSkill.trim()) &&
                            (skills || []).length < 5
                          ) {
                            setSkills([...(skills || []), newSkill.trim()]);
                            setNewSkill("");
                          }
                        }}
                        disabled={(skills || []).length >= 5}
                        style={[
                          styles.addButton,
                          {
                            backgroundColor:
                              (skills || []).length >= 5
                                ? colors.onSurfaceVariant
                                : Colors.PRIMARY,
                          },
                        ]}
                      >
                        <Ionicons name="add" size={RFValue(20)} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Maximum Limit Message */}
                  {isEditingSkills && (skills || []).length >= 5 && (
                    <Text
                      style={[
                        styles.maxLimitText,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Maximum 5 skills reached
                    </Text>
                  )}
                </View>
              ) : (
                /* Interests Section */
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Text
                      style={[
                        styles.modalSectionTitle,
                        { color: colors.onBackground },
                      ]}
                    >
                      Your Interests
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsEditingInterests(!isEditingInterests)}
                    >
                      {isEditingInterests ? (
                        <Text
                          style={{
                            color: Colors.PRIMARY,
                            fontSize: RFValue(16),
                          }}
                        >
                          Done
                        </Text>
                      ) : (
                        <Ionicons
                          name="pencil-outline"
                          size={RFValue(16)}
                          color={Colors.PRIMARY}
                        />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalSectionSubHeader}>
                    <Text style={[styles.modalSectionSubHeaderText]}>
                      {isEditingInterests
                        ? "Remove or add your interests below"
                        : "Share up to 5 interests — the things that keep you curious, inspired, or awake at 3AM 🌙"}
                    </Text>
                  </View>

                  {/* Interests List */}
                  {(interests || []).length > 0 ? (
                    <View style={styles.modalListContainer}>
                      {(interests || []).map((interest, index) => (
                        <View key={index} style={styles.modalListItem}>
                          {isEditingInterests && (
                            <TouchableOpacity
                              onPress={() =>
                                setInterests((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              style={styles.deleteButton}
                            >
                              <Ionicons
                                name="close-circle"
                                size={RFValue(20)}
                                color="#ff4444"
                              />
                            </TouchableOpacity>
                          )}
                          <Text
                            style={[
                              styles.modalListItemText,
                              { color: colors.onBackground },
                            ]}
                          >
                            {interest}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Text
                        style={[
                          styles.placeholderText,
                          { color: colors.onBackground },
                        ]}
                      >
                        {/* No Interests Message */}
                        No interests added yet… are you secretly a robot? 🤖
                      </Text>
                    </View>
                  )}

                  {/* Add Interest Section */}
                  {isEditingInterests && (
                    <View style={styles.addSection}>
                      <TextInput
                        placeholder="Add an interest..."
                        value={newInterest}
                        onChangeText={(text) => setNewInterest(text)}
                        placeholderTextColor={colors.onSurfaceVariant}
                        style={[
                          styles.modalInput,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.outline,
                            color: colors.onBackground,
                          },
                        ]}
                        onSubmitEditing={() => {
                          if (
                            newInterest.trim() &&
                            !(interests || []).includes(newInterest.trim()) &&
                            (interests || []).length < 5
                          ) {
                            setInterests([
                              ...(interests || []),
                              newInterest.trim(),
                            ]);
                            setNewInterest("");
                          }
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          if (
                            newInterest.trim() &&
                            !(interests || []).includes(newInterest.trim()) &&
                            (interests || []).length < 5
                          ) {
                            setInterests([
                              ...(interests || []),
                              newInterest.trim(),
                            ]);
                            setNewInterest("");
                          }
                        }}
                        disabled={(interests || []).length >= 5}
                        style={[
                          styles.addButton,
                          {
                            backgroundColor:
                              (interests || []).length >= 5
                                ? colors.onSurfaceVariant
                                : Colors.PRIMARY,
                          },
                        ]}
                      >
                        <Ionicons name="add" size={RFValue(20)} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Maximum Limit Message */}
                  {isEditingInterests && (interests || []).length >= 5 && (
                    <Text
                      style={[
                        styles.maxLimitText,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Maximum 5 interests reached
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* school Selection Modal */}
      <Modal
        visible={isSchoolModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSchoolModalVisible(false)}
      >
        <View style={styles.educationModalOverlay}>
          <TouchableOpacity
            style={styles.educationModalBackdrop}
            onPress={() => setIsSchoolModalVisible(false)}
          />
          <View
            style={[
              styles.educationModalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.educationModalHeader}>
              <View style={styles.educationModalHandle} />
              <Text
                style={[
                  styles.educationModalTitle,
                  { color: colors.onBackground },
                ]}
              >
                Select School
              </Text>
            </View>

            <ScrollView style={styles.educationModalScrollView}>
              <Text
                style={[
                  styles.educationModalSubtitle,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Select from your school entries
              </Text>

              {education && education.length > 0 ? (
                education.map((schoolItem: any, index: number) => {
                  const schoolName = schoolItem.school.name;
                  const schoolLogo = schoolItem.school.logo;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.educationOption,
                        school === schoolName && styles.educationOptionSelected,
                      ]}
                      onPress={() => {
                        setSchool(schoolName);
                        setIsSchoolModalVisible(false);
                      }}
                    >
                      <View style={styles.educationOptionContent}>
                        {/* School Logo */}
                        {schoolLogo ? (
                          <Image
                            source={{ uri: schoolLogo }}
                            style={styles.schoolLogoInModal}
                            defaultSource={require("../../assets/images/no-club.png")}
                          />
                        ) : (
                          <View style={styles.schoolLogoPlaceholder}>
                            <Text style={styles.schoolLogoPlaceholderText}>
                              🎓
                            </Text>
                          </View>
                        )}

                        <View style={styles.schoolTextContainer}>
                          <Text
                            style={[
                              styles.educationOptionText,
                              {
                                color:
                                  school === schoolName
                                    ? colors.onPrimary
                                    : colors.onBackground,
                              },
                            ]}
                          >
                            {schoolName}
                          </Text>
                          {/* Show country if available */}
                          {schoolItem.school.country && (
                            <Text
                              style={[
                                styles.educationOptionSubtext,
                                {
                                  color:
                                    school === schoolName
                                      ? colors.onSurfaceVariant
                                      : colors.onSurfaceVariant,
                                },
                              ]}
                            >
                              {schoolItem.school.country}
                            </Text>
                          )}
                        </View>
                      </View>
                      {school === schoolName && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.onPrimary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text
                  style={[
                    styles.educationModalSubtitle,
                    {
                      color: colors.onSurfaceVariant,
                      textAlign: "center",
                      marginTop: 20,
                    },
                  ]}
                >
                  No school set yet
                </Text>
              )}

              {/* Add New Education Option */}
              <TouchableOpacity
                style={styles.addNewEducationOption}
                onPress={() => {
                  setIsSchoolModalVisible(false);
                  (navigation as any).navigate("EditEducation", {
                    userEmail: userEmail,
                  });
                }}
              >
                <Ionicons name="add-circle" size={24} color={Colors.PRIMARY} />
                <Text
                  style={[
                    styles.addNewEducationText,
                    { color: Colors.PRIMARY },
                  ]}
                >
                  Add New Education
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Country Search Modal */}
      <Modal
        visible={isCountryModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <View
          style={[styles.fullScreenModal, { backgroundColor: colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsCountryModalVisible(false)}>
              <Ionicons
                name="arrow-back"
                size={RFValue(24)}
                color={colors.onBackground}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.onBackground }]}>
              🌍 Select Country
            </Text>
            <View style={{ width: RFValue(24) }} />
          </View>

          <View style={styles.searchInputContainer}>
            <TextInput
              placeholder="Search countries..."
              placeholderTextColor="#666666"
              value={countryQuery}
              onChangeText={(text) => {
                setCountryQuery(text);
                if (text.trim()) {
                  searchCountries(text);
                } else {
                  setCountries([]);
                }
              }}
              style={[
                styles.textInput,
                {
                  backgroundColor: "#ffffff",
                  borderColor: "#e0e0e0",
                  color: "#000000",
                  marginBottom: RFValue(8),
                  flex: 1,
                },
              ]}
            />
          </View>

          <ScrollView
            style={styles.modalScrollView}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isSearchingCountries ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text
                  style={[
                    styles.searchStatusText,
                    { color: Colors.PRIMARY, marginLeft: RFValue(8) },
                  ]}
                >
                  Searching countries...
                </Text>
              </View>
            ) : countries.length > 0 ? (
              countries.map((countryItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.educationOption,

                    country === countryItem.name &&
                      styles.educationOptionSelected,
                  ]}
                  onPress={() => {
                    setCountry(countryItem.name);
                    setCountryQuery(countryItem.name); // Set query to selected country name
                    setIsCountryModalVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.educationOptionContent,
                      { flexDirection: "column", alignItems: "flex-start" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.educationOptionText,
                        {
                          color:
                            country === countryItem.name
                              ? colors.onPrimary
                              : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {countryItem.flag} {countryItem.name}
                    </Text>
                    <Text
                      style={[
                        styles.educationOptionSubtext,
                        {
                          color:
                            country === countryItem.name
                              ? colors.onSurfaceVariant
                              : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {countryItem.capital || "No capital"}
                    </Text>
                  </View>
                  {country === countryItem.name && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.PRIMARY}
                    />
                  )}
                </TouchableOpacity>
              ))
            ) : countryQuery ? (
              <Text
                style={[
                  styles.educationModalSubtitle,
                  {
                    color: colors.onSurfaceVariant,
                    textAlign: "center",
                    marginTop: 20,
                  },
                ]}
              >
                No countries found
              </Text>
            ) : (
              <Text
                style={[
                  styles.educationModalSubtitle,
                  {
                    color: colors.onSurfaceVariant,
                    textAlign: "center",
                    marginTop: 20,
                  },
                ]}
              >
                Start typing to search countries
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* City Search Modal */}
      <Modal
        visible={isCityModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCityModalVisible(false)}
      >
        <View
          style={[styles.fullScreenModal, { backgroundColor: colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsCityModalVisible(false)}>
              <Ionicons
                name="arrow-back"
                size={RFValue(24)}
                color={colors.onBackground}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.onBackground }]}>
              🏙️ Select City
            </Text>
            <View style={{ width: RFValue(24) }} />
          </View>

          <View style={styles.searchInputContainer}>
            <TextInput
              placeholder="Search for cities..."
              placeholderTextColor="#666666"
              value={cityQuery}
              onChangeText={(text) => {
                setCityQuery(text);
                if (text.trim()) {
                  searchCities(text);
                } else {
                  setCities([]);
                }
              }}
              style={[
                styles.textInput,
                {
                  backgroundColor: "#ffffff",
                  borderColor: "#e0e0e0",
                  color: "#000000",
                  marginBottom: RFValue(8),
                  flex: 1,
                },
              ]}
            />
          </View>

          <ScrollView
            style={styles.modalScrollView}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isSearchingCities ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text
                  style={[
                    styles.searchStatusText,
                    { color: Colors.PRIMARY, marginLeft: RFValue(8) },
                  ]}
                >
                  Searching cities...
                </Text>
              </View>
            ) : cities.length > 0 ? (
              cities.map((cityItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.educationOption,
                    city === cityItem.name && styles.educationOptionSelected,
                    { borderBottomColor: Colors.GRAY, borderBottomWidth: 1 },
                  ]}
                  onPress={() => {
                    // Combine city name with region/state, separated by comma
                    const cityWithRegion = cityItem.region
                      ? `${cityItem.name}, ${cityItem.region}`
                      : cityItem.name;
                    setCity(cityWithRegion);
                    setCityQuery(cityWithRegion);
                    setIsCityModalVisible(false);
                  }}
                >
                  <View style={styles.educationOptionContent}>
                    <Text
                      style={[
                        styles.educationOptionText,
                        {
                          color:
                            city === cityItem.name
                              ? "#ffffff"
                              : colors.onBackground,
                        },
                      ]}
                    >
                      {`${cityItem.name}, `}
                      {cityItem.isOutOfCountry && (
                        <Text
                          style={{ color: Colors.GRAY, fontSize: RFValue(12) }}
                        >
                          {" "}
                          ({cityItem.country})
                        </Text>
                      )}
                    </Text>
                    {cityItem.region && (
                      <Text
                        style={[
                          styles.educationOptionSubtext,
                          {
                            color:
                              city === cityItem.name
                                ? "#ffffff"
                                : colors.onSurfaceVariant,
                          },
                        ]}
                      >
                        {cityItem.region}
                      </Text>
                    )}
                  </View>
                  {city === cityItem.name && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.PRIMARY}
                    />
                  )}
                </TouchableOpacity>
              ))
            ) : cityQuery ? (
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Text
                  style={[
                    styles.educationModalSubtitle,
                    {
                      color: colors.onSurfaceVariant,
                      textAlign: "center",
                      marginBottom: 16,
                    },
                  ]}
                >
                  No cities found for "{cityQuery}"
                </Text>
                <TouchableOpacity
                  style={[
                    styles.educationOption,
                    {
                      borderBottomColor: Colors.GRAY,
                      borderBottomWidth: 1,
                      backgroundColor: Colors.PRIMARY,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    },
                  ]}
                  onPress={() => {
                    setCity(cityQuery);
                    setCityQuery(cityQuery);
                    setIsCityModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.educationOptionText,
                      { color: "#ffffff", textAlign: "center" },
                    ]}
                  >
                    Use "{cityQuery}" as city
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text
                style={[
                  styles.educationModalSubtitle,
                  {
                    color: colors.onSurfaceVariant,
                    textAlign: "center",
                    marginTop: 20,
                  },
                ]}
              >
                Start typing to search for cities worldwide
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: RFValue(16),
  },
  requiredText: {
    fontSize: RFValue(12),
    marginBottom: RFValue(16),
    fontStyle: "italic",
  },
  sectionContainer: {
    marginBottom: RFValue(24),
  },
  sectionTitle: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    marginBottom: RFValue(8),
  },
  sectionDescription: {
    fontSize: RFValue(14),
    marginBottom: RFValue(16),
    lineHeight: RFValue(20),
  },
  skillsSection: {
    marginTop: RFValue(25),
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(16),
  },
  skillsTitle: {
    color: "#fff",
    fontSize: RFValue(22),
    fontWeight: "bold",
    marginBottom: RFValue(8),
  },
  skillsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: RFValue(8),
  },
  skillTag: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(6),
    borderRadius: RFValue(20),
    marginRight: RFValue(8),
    marginBottom: RFValue(8),
  },
  skillText: {
    color: "#fff",
    fontSize: RFValue(14),
  },

  skillInput: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#fff",
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(6),
    borderRadius: RFValue(10),
    marginRight: RFValue(8),
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  interestsSection: {
    marginTop: RFValue(25),
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(16),
  },
  interestsTitle: {
    color: "#fff",
    fontSize: RFValue(22),
    fontWeight: "bold",
    marginBottom: RFValue(8),
  },
  interestsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: RFValue(8),
  },
  interestTag: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(6),
    borderRadius: RFValue(20),
    marginRight: RFValue(8),
    marginBottom: RFValue(8),
  },
  interestText: {
    color: "#fff",
    fontSize: RFValue(14),
  },
  interestInput: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#fff",
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(6),
    borderRadius: RFValue(10),
    marginRight: RFValue(8),
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: Dimensions.get("window").width * 0.9,
    maxHeight: Dimensions.get("window").height * 0.8,
    borderRadius: RFValue(12),
    padding: RFValue(20),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: RFValue(20),
    paddingVertical: RFValue(16),
    paddingTop: RFValue(50),
    backgroundColor: Colors.PRIMARY,
  },
  modalTitle: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    color: "#fff",
  },
  modalScrollView: {
    flex: 1,
    padding: RFValue(16),
  },
  modalSection: {
    marginBottom: RFValue(24),
  },
  modalSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: RFValue(12),
  },
  modalSectionTitle: {
    fontSize: RFValue(18),
    fontWeight: "bold",
  },
  modalSkillsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: RFValue(8),
    marginBottom: RFValue(12),
  },
  modalSkillTag: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(6),
    borderRadius: RFValue(20),
    marginRight: RFValue(8),
    marginBottom: RFValue(8),
    flexDirection: "row",
    alignItems: "center",
  },
  modalSkillText: {
    color: "#fff",
    fontSize: RFValue(14),
  },
  modalInterestsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: RFValue(8),
    marginBottom: RFValue(12),
  },
  modalInterestTag: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(6),
    borderRadius: RFValue(20),
    marginRight: RFValue(8),
    marginBottom: RFValue(8),
    flexDirection: "row",
    alignItems: "center",
  },
  modalInterestText: {
    color: "#fff",
    fontSize: RFValue(14),
  },
  modalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: RFValue(12),
  },
  modalInput: {
    flex: 1,
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(8),
    borderRadius: RFValue(8),
    borderWidth: 1,
    marginRight: RFValue(8),
    fontSize: RFValue(14),
  },

  fullScreenModal: {
    flex: 1,
  },
  // New Column List Styles
  modalListContainer: {
    marginBottom: RFValue(20),
  },
  modalListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: RFValue(12),
    paddingHorizontal: RFValue(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalListItemText: {
    fontSize: RFValue(16),
    flex: 1,
  },
  deleteButton: {
    padding: RFValue(4),
  },
  addSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: RFValue(16),
    paddingHorizontal: RFValue(16),
  },
  addButton: {
    width: RFValue(44),
    height: RFValue(44),
    borderRadius: RFValue(22),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: RFValue(12),
  },
  maxLimitText: {
    fontSize: RFValue(14),
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: RFValue(16),
  },
  modalSectionSubHeader: {},
  modalSectionSubHeaderText: {
    color: Colors.GRAY,
  },

  placeholderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: RFValue(100),
  },
  placeholderText: {
    fontSize: RFValue(16),
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: RFValue(8),
    marginBottom: RFValue(16),
    borderRadius: RFValue(10),
  },
  tabButton: {
    paddingVertical: RFValue(8),
    paddingHorizontal: RFValue(15),
    borderRadius: RFValue(8),
  },
  activeTabButton: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  tabText: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    color: "#fff",
  },
  activeTabText: {
    color: Colors.PRIMARY,
  },
  saveButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: RFValue(16),
    paddingBottom: Platform.OS === "ios" ? RFValue(34) : RFValue(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    zIndex: 1000,
  },
  saveButton: {
    paddingVertical: RFValue(12),
    paddingHorizontal: RFValue(20),
    borderRadius: RFValue(8),
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: RFValue(18),
    fontWeight: "bold",
  },
  // Education Modal Styles
  educationModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  educationModalBackdrop: {
    flex: 1,
  },
  educationModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: RFValue(20),
    borderTopRightRadius: RFValue(20),
    borderTopWidth: 1,
    borderTopColor: Colors.PRIMARY + "50",
    maxHeight: "80%",
  },
  educationModalHeader: {
    alignItems: "center",
    paddingVertical: RFValue(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  educationModalHandle: {
    width: RFValue(40),
    height: RFValue(4),
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: RFValue(2),
    marginBottom: RFValue(12),
  },
  educationModalTitle: {
    fontSize: RFValue(18),
    fontWeight: "bold",
  },
  educationModalScrollView: {
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(16),
  },
  educationModalSubtitle: {
    fontSize: RFValue(14),
    marginBottom: RFValue(16),
  },
  educationOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: RFValue(16),
    paddingHorizontal: RFValue(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  educationOptionSelected: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: RFValue(8),
  },
  educationOptionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  educationOptionText: {
    fontSize: RFValue(16),
    fontWeight: "500",
  },
  educationOptionSubtext: {
    fontSize: RFValue(14),
    marginTop: RFValue(4),
  },
  addNewEducationOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: RFValue(16),
    paddingHorizontal: RFValue(16),
    marginTop: RFValue(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  addNewEducationText: {
    fontSize: RFValue(16),
    fontWeight: "500",
    marginLeft: RFValue(12),
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: RFValue(8),
    paddingHorizontal: RFValue(16),
  },
  textInput: {
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(10),
    borderRadius: RFValue(8),
    borderWidth: 1,
    fontSize: RFValue(16),
    flex: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: RFValue(20),
  },
  searchStatusText: {
    fontSize: RFValue(14),
    textAlign: "center",
  },
  // School logo styles for modal
  schoolLogoInModal: {
    width: RFValue(32),
    height: RFValue(32),
    borderRadius: RFValue(6),
    marginRight: RFValue(12),
  },
  schoolLogoPlaceholder: {
    width: RFValue(32),
    height: RFValue(32),
    borderRadius: RFValue(6),
    marginRight: RFValue(12),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  schoolLogoPlaceholderText: {
    fontSize: RFValue(16),
  },
  schoolTextContainer: {
    flex: 1,
  },
});
