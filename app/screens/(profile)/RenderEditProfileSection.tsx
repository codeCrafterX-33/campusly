import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
import { useThemeContext } from "../../context/ThemeContext";

type Props = {
  sectionToEdit:
    | "intro"
    | "about"
    | "education"
    | "skills"
    | "interests"
    | string;
  skills: string[];
  interests: string[];
  aboutText?: string;
  onAboutTextChange?: (text: string) => void;
  firstName?: string;
  onFirstNameChange?: (text: string) => void;
  lastName?: string;
  onLastNameChange?: (text: string) => void;
  headline?: string;
  onHeadlineChange?: (text: string) => void;
  country?: string;
  onCountryChange?: (text: string) => void;
  city?: string;
  onCityChange?: (text: string) => void;
  graduationYear?: string;
  onGraduationYearChange?: (text: string) => void;
  school?: string;
  onOpenSchoolModal?: (mode: "select" | "add") => void;
  onOpenCountryModal?: () => void;
  onOpenCityModal?: () => void;
  onOpenSection: (section: "skills" | "interests") => void;
  // Error states for validation
  firstNameError?: string;
  lastNameError?: string;
  headlineError?: string;
  countryError?: string;
  cityError?: string;
};

export default function RenderEditProfileSection({
  sectionToEdit,
  skills,
  interests,
  aboutText = "",
  onAboutTextChange,
  firstName = "",
  onFirstNameChange,
  lastName = "",
  onLastNameChange,
  headline = "",
  onHeadlineChange,
  country = "",
  onCountryChange,
  city = "",
  onCityChange,
  graduationYear = "",
  onGraduationYearChange,
  onOpenSection,
  onOpenSchoolModal,
  onOpenCountryModal,
  onOpenCityModal,
  school,
  // Error states for validation
  firstNameError = "",
  lastNameError = "",
  headlineError = "",
  countryError = "",
  cityError = "",
}: Props) {
  const { colors } = useTheme();
  const { isDarkMode } = useThemeContext();
  const aboutRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (sectionToEdit === "about") {
      requestAnimationFrame(() => {
        setTimeout(() => {
          aboutRef.current?.focus();
        }, 50);
      });
    }
  }, [sectionToEdit]);

  // Intro section animations
  useEffect(() => {
    if (sectionToEdit === "intro") {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sectionToEdit, fadeAnim, slideAnim, scaleAnim]);

  // About section animations
  useEffect(() => {
    if (sectionToEdit === "about") {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);

      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sectionToEdit, fadeAnim, slideAnim, scaleAnim]);

  switch (sectionToEdit) {
    case "intro":
      return (
        <Animated.View
          style={[
            styles.ultraModernContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Hero Header */}
          <Animated.View
            style={[
              styles.heroHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.heroGradient}>
              <View style={styles.heroContent}>
                <Animated.View
                  style={[
                    styles.heroIconWrapper,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Ionicons
                    name="person-circle"
                    size={RFValue(40)}
                    color="#fff"
                  />
                </Animated.View>
                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>Personal Information</Text>
                  <Text style={styles.heroSubtitle}>
                    Tell your story to the world
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Form Cards */}
          <Animated.View
            style={[
              styles.formCardsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Name Card */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDarkMode
                    ? colors.outline || "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Animated.View
                  style={[
                    styles.cardIcon,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={RFValue(20)}
                    color={Colors.PRIMARY}
                  />
                </Animated.View>
                <Text
                  style={[styles.cardTitle, { color: colors.onBackground }]}
                >
                  Name
                </Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  First Name
                </Text>
                <TextInput
                  placeholder="John"
                  placeholderTextColor={Colors.GRAY}
                  value={firstName}
                  onChangeText={onFirstNameChange}
                  style={[
                    styles.ultraModernInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: firstNameError
                        ? "#ff4444"
                        : isDarkMode
                        ? colors.outline || "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                      color: colors.onBackground,
                    },
                  ]}
                  maxLength={30}
                />
                {firstNameError ? (
                  <Text style={styles.errorText}>{firstNameError}</Text>
                ) : null}
              </View>

              <View style={styles.fieldContainer}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Last Name
                </Text>
                <TextInput
                  placeholder="Doe"
                  placeholderTextColor={Colors.GRAY}
                  value={lastName}
                  onChangeText={onLastNameChange}
                  style={[
                    styles.ultraModernInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: lastNameError
                        ? "#ff4444"
                        : isDarkMode
                        ? colors.outline || "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                      color: colors.onBackground,
                    },
                  ]}
                  maxLength={30}
                />
                {lastNameError ? (
                  <Text style={styles.errorText}>{lastNameError}</Text>
                ) : null}
              </View>
            </Animated.View>

            {/* Professional Card */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDarkMode
                    ? colors.outline || "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Animated.View
                  style={[
                    styles.cardIcon,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Ionicons
                    name="star"
                    size={RFValue(20)}
                    color={Colors.PRIMARY}
                  />
                </Animated.View>
                <Text
                  style={[styles.cardTitle, { color: colors.onBackground }]}
                >
                  Professional Identity
                </Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Headline
                </Text>
                <TextInput
                  placeholder="e.g., Computer Science Student | Aspiring Software Engineer"
                  placeholderTextColor={Colors.GRAY}
                  value={headline}
                  onChangeText={onHeadlineChange}
                  multiline={true}
                  numberOfLines={3}
                  scrollEnabled={true}
                  textAlignVertical="top"
                  style={[
                    styles.ultraModernTextArea,
                    {
                      backgroundColor: colors.background,
                      borderColor: headlineError
                        ? "#ff4444"
                        : isDarkMode
                        ? colors.outline || "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                      color: colors.onBackground,
                    },
                  ]}
                  maxLength={200}
                />
                {headlineError ? (
                  <Text style={styles.errorText}>{headlineError}</Text>
                ) : null}
                <View style={styles.counterContainer}>
                  <Text
                    style={[
                      styles.counterText,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {headline.length}/200
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Location Card */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDarkMode
                    ? colors.outline || "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Animated.View
                  style={[
                    styles.cardIcon,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Ionicons
                    name="location"
                    size={RFValue(20)}
                    color={Colors.PRIMARY}
                  />
                </Animated.View>
                <Text
                  style={[styles.cardTitle, { color: colors.onBackground }]}
                >
                  Location
                </Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Country
                </Text>
                <TouchableOpacity
                  style={[
                    styles.ultraModernSelect,
                    {
                      backgroundColor: colors.background,
                      borderColor: countryError
                        ? "#ff4444"
                        : isDarkMode
                        ? colors.outline || "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                    },
                  ]}
                  onPress={onOpenCountryModal}
                >
                  <Text
                    style={[
                      styles.selectText,
                      {
                        color: country
                          ? colors.onBackground
                          : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {country || "Select country"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={RFValue(16)}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {countryError ? (
                  <Text style={styles.errorText}>{countryError}</Text>
                ) : null}
              </View>

              <View style={styles.fieldContainer}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  City
                </Text>
                <TouchableOpacity
                  style={[
                    styles.ultraModernSelect,
                    {
                      backgroundColor: colors.background,
                      borderColor: cityError
                        ? "#ff4444"
                        : isDarkMode
                        ? colors.outline || "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                    },
                  ]}
                  onPress={onOpenCityModal}
                >
                  <Text
                    style={[
                      styles.selectText,
                      {
                        color: city
                          ? colors.onBackground
                          : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {city || "Select city"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={RFValue(16)}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
                {cityError ? (
                  <Text style={styles.errorText}>{cityError}</Text>
                ) : null}
              </View>
            </Animated.View>

            {/* Education Card */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDarkMode
                    ? colors.outline || "rgba(255, 255, 255, 0.1)"
                    : "transparent",
                },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Animated.View
                  style={[
                    styles.cardIcon,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Ionicons
                    name="school"
                    size={RFValue(20)}
                    color={Colors.PRIMARY}
                  />
                </Animated.View>
                <Text
                  style={[styles.cardTitle, { color: colors.onBackground }]}
                >
                  Education
                </Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text
                  style={[
                    styles.fieldLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Institution
                </Text>
                <TouchableOpacity
                  style={[
                    styles.ultraModernSelect,
                    {
                      backgroundColor: colors.background,
                      borderColor: isDarkMode
                        ? colors.outline || "rgba(255, 255, 255, 0.1)"
                        : "transparent",
                    },
                  ]}
                  onPress={() =>
                    onOpenSchoolModal && onOpenSchoolModal("select")
                  }
                >
                  <Text
                    style={[
                      styles.selectText,
                      {
                        color: school
                          ? colors.onBackground
                          : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {school || "Select your school"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={RFValue(16)}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      );

    case "about":
      return (
        <Animated.View
          style={[
            styles.ultraModernContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Hero Header */}
          <Animated.View
            style={[
              styles.heroHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.heroGradient}>
              <View style={styles.heroContent}>
                <Animated.View
                  style={[
                    styles.heroIconWrapper,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Ionicons
                    name="document-text"
                    size={RFValue(40)}
                    color="#fff"
                  />
                </Animated.View>
                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>About Me</Text>
                  <Text style={styles.heroSubtitle}>
                    Share your story, passions, and what makes you unique
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* About Card */}
          <Animated.View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                borderColor: isDarkMode
                  ? colors.outline || "rgba(255, 255, 255, 0.1)"
                  : "transparent",
              },
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Animated.View
                style={[
                  styles.cardIcon,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <Ionicons
                  name="create"
                  size={RFValue(20)}
                  color={Colors.PRIMARY}
                />
              </Animated.View>
              <Text style={[styles.cardTitle, { color: colors.onBackground }]}>
                Your Story
              </Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text
                style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}
              >
                Tell us about yourself
              </Text>
              <TextInput
                ref={aboutRef}
                placeholder="Write about yourself, your interests, goals, or anything you'd like others to know..."
                placeholderTextColor={Colors.GRAY}
                value={aboutText}
                onChangeText={onAboutTextChange}
                style={[
                  styles.ultraModernTextArea,
                  {
                    backgroundColor: colors.background,
                    borderColor: isDarkMode
                      ? colors.outline || "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                    color: colors.onBackground,
                    minHeight: RFValue(120),
                    maxHeight: RFValue(200),
                  },
                ]}
                multiline
                textAlignVertical="top"
                autoFocus={sectionToEdit === "about"}
                scrollEnabled={true}
                maxLength={1000}
                onSubmitEditing={() => {
                  aboutRef.current?.blur();
                }}
                numberOfLines={8}
              />
              <View style={styles.counterContainer}>
                <Text
                  style={[
                    styles.counterText,
                    {
                      color:
                        aboutText.length > 800
                          ? "#ff4444"
                          : aboutText.length > 600
                          ? "#ffaa00"
                          : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {aboutText.length}/1000
                </Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      );

    case "skills":
      return (
        <View style={styles.sectionContainer}>
          <View style={styles.skillsSection}>
            <View style={styles.rowBetween}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="star"
                  size={RFValue(20)}
                  color={Colors.PRIMARY}
                  style={styles.sectionIcon}
                />
                <Text
                  style={[styles.skillsTitle, { color: colors.onBackground }]}
                >
                  Skills ({skills.length}/5)
                </Text>
              </View>
              <TouchableOpacity onPress={() => onOpenSection("skills")}>
                <Ionicons
                  name="pencil-outline"
                  size={RFValue(16)}
                  color={Colors.PRIMARY}
                />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.sectionDescription,
                { color: colors.onSurfaceVariant, marginBottom: RFValue(16) },
              ]}
            >
              Show off your top skills — add up to 5 things you want to be known
              for professionally ✨
            </Text>

            {skills.length <= 0 && (
              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.onSurfaceVariant, marginTop: RFValue(15) },
                ]}
              >
                No skills added yet… what are you waiting for? 💼
              </Text>
            )}

            <View style={styles.skillsWrapper}>
              {skills.map((skill, index) => (
                <View key={`${skill}-${index}`} style={styles.skillTag}>
                  <Text style={styles.skillText}>#{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );

    case "interests":
      return (
        <View style={styles.sectionContainer}>
          <View style={styles.interestsSection}>
            <View style={styles.rowBetween}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="heart"
                  size={RFValue(20)}
                  color="#E91E63"
                  style={styles.sectionIcon}
                />
                <Text
                  style={[
                    styles.interestsTitle,
                    { color: colors.onBackground },
                  ]}
                >
                  Interests ({interests.length}/5)
                </Text>
              </View>
              <TouchableOpacity onPress={() => onOpenSection("interests")}>
                <Ionicons
                  name="pencil-outline"
                  size={RFValue(16)}
                  color="#E91E63"
                />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.sectionDescription,
                { color: colors.onSurfaceVariant, marginBottom: RFValue(16) },
              ]}
            >
              Share your passions — add up to 5 things you love doing in your
              free time ❤️
            </Text>

            {interests.length <= 0 && (
              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.onSurfaceVariant, marginTop: RFValue(15) },
                ]}
              >
                No interests added yet… what makes you tick? 🎯
              </Text>
            )}

            <View style={styles.interestsWrapper}>
              {interests.map((interest, index) => (
                <View key={`${interest}-${index}`} style={styles.interestTag}>
                  <Text style={styles.interestText}>#{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );

    default:
      return (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
            Edit Profile
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: colors.onSurfaceVariant },
            ]}
          >
            Select a section to edit
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: RFValue(24),
  },
  fullscreenContainer: {
    flex: 1,
    padding: RFValue(16),
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
  aboutInput: {
    borderWidth: 1,
    borderRadius: RFValue(8),
    padding: RFValue(12),
    marginBottom: RFValue(16),
    fontSize: RFValue(14),
    textAlignVertical: "top",
  },
  fullscreenInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RFValue(8),
    padding: RFValue(12),
    fontSize: RFValue(16),
    textAlignVertical: "top",
    minHeight: RFValue(150),
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillsSection: {
    marginTop: RFValue(10),
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
  inputContainer: {
    flex: 1,
    position: "relative",
  },
  characterCounterContainer: {
    alignSelf: "flex-end",
    marginTop: RFValue(8),
    marginRight: RFValue(4),
  },
  characterCounterText: {
    fontSize: RFValue(12),
  },
  inputLabel: {
    fontSize: RFValue(14),
    marginBottom: RFValue(8),
  },
  textInput: {
    borderWidth: 1,
    borderRadius: RFValue(8),
    padding: RFValue(12),
    fontSize: RFValue(16),
    minHeight: RFValue(50),
  },
  headlineInput: {
    minHeight: RFValue(80), // Height for approximately 2 lines
    maxHeight: RFValue(120), // Maximum height to prevent excessive expansion
    paddingTop: RFValue(12),
    paddingBottom: RFValue(12),
    lineHeight: RFValue(20), // Better line spacing for readability
  },
  educationInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: RFValue(8),
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(12),
    minHeight: RFValue(50),
  },
  educationInputText: {
    flex: 1,
    fontSize: RFValue(16),
    marginRight: RFValue(8),
  },
  errorText: {
    color: "#ff4444",
    fontSize: RFValue(12),
    marginTop: RFValue(4),
    fontStyle: "italic",
  },
  searchInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(10),
    borderRadius: RFValue(8),
    borderWidth: 1,
    fontSize: RFValue(16),
  },
  searchInputText: {
    flex: 1,
    fontSize: RFValue(16),
    marginRight: RFValue(8),
  },
  // Ultra Modern Intro Section Styles
  ultraModernContainer: {
    flex: 1,
    padding: RFValue(20),
  },
  heroHeader: {
    marginBottom: RFValue(32),
    borderRadius: RFValue(20),
    overflow: "hidden",
  },
  heroGradient: {
    backgroundColor: Colors.PRIMARY,
    padding: RFValue(24),
    paddingTop: RFValue(32),
    paddingBottom: RFValue(32),
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroIconWrapper: {
    width: RFValue(64),
    height: RFValue(64),
    borderRadius: RFValue(32),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: RFValue(16),
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: RFValue(24),
    fontWeight: "700",
    color: "#fff",
    marginBottom: RFValue(4),
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: RFValue(16),
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.9)",
    opacity: 0.9,
  },
  formCardsContainer: {
    gap: RFValue(20),
  },
  formCard: {
    borderRadius: RFValue(16),
    padding: RFValue(20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: RFValue(16),
  },
  cardIcon: {
    width: RFValue(36),
    height: RFValue(36),
    borderRadius: RFValue(18),
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: RFValue(12),
  },
  cardTitle: {
    fontSize: RFValue(18),
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  nameRow: {
    flexDirection: "row",
    gap: RFValue(12),
  },
  nameField: {
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    gap: RFValue(12),
  },
  locationField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: RFValue(8),
  },
  fieldLabel: {
    fontSize: RFValue(14),
    fontWeight: "500",
    marginBottom: RFValue(8),
    letterSpacing: 0.2,
  },
  ultraModernInput: {
    borderRadius: RFValue(12),
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(14),
    fontSize: RFValue(16),
    fontWeight: "400",
    minHeight: RFValue(48),
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ultraModernTextArea: {
    borderRadius: RFValue(12),
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(14),
    fontSize: RFValue(16),
    fontWeight: "400",
    minHeight: RFValue(80),
    maxHeight: RFValue(120),
    textAlignVertical: "top",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ultraModernSelect: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: RFValue(12),
    paddingHorizontal: RFValue(16),
    paddingVertical: RFValue(14),
    minHeight: RFValue(48),
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectText: {
    flex: 1,
    fontSize: RFValue(16),
    fontWeight: "400",
    marginRight: RFValue(8),
  },
  counterContainer: {
    alignSelf: "flex-end",
    marginTop: RFValue(6),
    marginRight: RFValue(4),
  },
  counterText: {
    fontSize: RFValue(11),
    fontWeight: "500",
    opacity: 0.7,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: RFValue(8),
  },
});
