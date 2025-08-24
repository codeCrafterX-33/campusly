import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";

type Props = {
  sectionToEdit: "intro" | "about" | "education" | "skills" | string;
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
  const aboutRef = useRef<TextInput>(null);
  useEffect(() => {
    if (sectionToEdit === "about") {
      requestAnimationFrame(() => {
        setTimeout(() => {
          aboutRef.current?.focus();
        }, 50);
      });
    }
  }, [sectionToEdit]);

  switch (sectionToEdit) {
    case "intro":
      return (
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
            Introduction
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: colors.onSurfaceVariant },
            ]}
          >
            Tell people about yourself and where you're from
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
              First Name
            </Text>
            <TextInput
              placeholder="e.g., John"
              placeholderTextColor={colors.onSurfaceVariant}
              value={firstName}
              onChangeText={onFirstNameChange}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                  color: colors.onBackground,
                },
              ]}
              maxLength={30}
            />
            {firstNameError ? (
              <Text style={styles.errorText}>{firstNameError}</Text>
            ) : null}
            <View style={styles.characterCounterContainer}>
              <Text
                style={[
                  styles.characterCounterText,
                  {
                    color:
                      firstName.length > 25
                        ? "#ff4444"
                        : firstName.length > 20
                        ? "#ffaa00"
                        : colors.onSurfaceVariant,
                  },
                ]}
              >
                {firstName.length}/30
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
              Last Name
            </Text>
            <TextInput
              placeholder="e.g., Doe"
              placeholderTextColor={colors.onSurfaceVariant}
              value={lastName}
              onChangeText={onLastNameChange}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                  color: colors.onBackground,
                },
              ]}
              maxLength={30}
            />
            {lastNameError ? (
              <Text style={styles.errorText}>{lastNameError}</Text>
            ) : null}
            <View style={styles.characterCounterContainer}>
              <Text
                style={[
                  styles.characterCounterText,
                  {
                    color:
                      lastName.length > 25
                        ? "#ff4444"
                        : lastName.length > 20
                        ? "#ffaa00"
                        : colors.onSurfaceVariant,
                  },
                ]}
              >
                {lastName.length}/30
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
              Headline
            </Text>
            <TextInput
              placeholder="e.g., Accounting Student, Aspiring Developer"
              placeholderTextColor={colors.onSurfaceVariant}
              value={headline}
              onChangeText={onHeadlineChange}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                  color: colors.onBackground,
                },
              ]}
              maxLength={200}
            />
            {headlineError ? (
              <Text style={styles.errorText}>{headlineError}</Text>
            ) : null}
            <View style={styles.characterCounterContainer}>
              <Text
                style={[
                  styles.characterCounterText,
                  {
                    color:
                      headline.length > 190
                        ? "#ff4444"
                        : headline.length > 180
                        ? "#ffaa00"
                        : colors.onSurfaceVariant,
                  },
                ]}
              >
                {headline.length}/200
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
              Country
            </Text>
            <TouchableOpacity
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
              onPress={onOpenCountryModal}
            >
              <Text
                style={[
                  styles.searchInputText,
                  {
                    color: country
                      ? colors.onBackground
                      : colors.onSurfaceVariant,
                  },
                ]}
              >
                {country || "Select country..."}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            {countryError ? (
              <Text style={styles.errorText}>{countryError}</Text>
            ) : null}
            {country && (
              <View style={styles.characterCounterContainer}>
                <Text
                  style={[
                    styles.characterCounterText,
                    {
                      color:
                        country.length > 40
                          ? "#ff4444"
                          : country.length > 35
                          ? "#ffaa00"
                          : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {country.length}/50
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
              City
            </Text>
            <TouchableOpacity
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
              onPress={onOpenCityModal}
            >
              <Text
                style={[
                  styles.searchInputText,
                  {
                    color: city ? colors.onBackground : colors.onSurfaceVariant,
                  },
                ]}
              >
                {city || "Select city..."}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            {cityError ? (
              <Text style={styles.errorText}>{cityError}</Text>
            ) : null}
            {city && (
              <View style={styles.characterCounterContainer}>
                <Text
                  style={[
                    styles.characterCounterText,
                    {
                      color:
                        city.length > 40
                          ? "#ff4444"
                          : city.length > 35
                          ? "#ffaa00"
                          : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {city.length}/50
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
              School
            </Text>
            <TouchableOpacity
              style={[
                styles.educationInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
              onPress={() => onOpenSchoolModal && onOpenSchoolModal("select")}
            >
              <Text
                style={[
                  styles.educationInputText,
                  {
                    color: school
                      ? colors.onBackground
                      : colors.onSurfaceVariant,
                  },
                ]}
              >
                {school ? school : "Select your school"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>
      );

    case "about":
      return (
        <View style={styles.fullscreenContainer}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
            About
          </Text>
          <Text
            style={[
              styles.sectionDescription,
              { color: colors.onSurfaceVariant },
            ]}
          >
            Share your story, your passions, and the stuff that makes you, you
            😎
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              ref={aboutRef}
              placeholder="Write about yourself..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={aboutText}
              onChangeText={onAboutTextChange}
              style={[
                styles.fullscreenInput,
                { color: colors.onBackground, borderColor: colors.outline },
              ]}
              multiline
              textAlignVertical="top"
              autoFocus={sectionToEdit === "about"}
              scrollEnabled={true}
              maxLength={500}
              onSubmitEditing={() => {
                aboutRef.current?.blur();
              }}
              numberOfLines={9}
            />
          </View>

          <View style={styles.characterCounterContainer}>
            <Text
              style={[
                styles.characterCounterText,
                {
                  color:
                    aboutText.length > 400
                      ? "#ff4444"
                      : colors.onSurfaceVariant,
                },
              ]}
            >
              {aboutText.length}/500
            </Text>
          </View>
        </View>
      );

    case "skills":
      return (
        <View style={styles.sectionContainer}>
          {/* Skills preview */}
          <View style={styles.skillsSection}>
            <View style={styles.rowBetween}>
              <Text
                style={[styles.skillsTitle, { color: colors.onBackground }]}
              >
                Skills ({skills.length}/5)
              </Text>
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
              for ✨
            </Text>

            {skills.length <= 0 && (
              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.onSurfaceVariant, marginTop: RFValue(15) },
                ]}
              >
                No skills added yet… what are you waiting for? 🚀
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

          {/* Interests preview */}
          <View style={styles.interestsSection}>
            <View style={styles.rowBetween}>
              <Text
                style={[styles.interestsTitle, { color: colors.onBackground }]}
              >
                Interests ({interests.length}/5)
              </Text>
              <TouchableOpacity onPress={() => onOpenSection("interests")}>
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
              Share up to 5 interests — the things that keep you curious and
              inspired 🌙
            </Text>

            {interests.length <= 0 && (
              <Text
                style={[
                  styles.sectionDescription,
                  { color: colors.onSurfaceVariant, marginTop: RFValue(15) },
                ]}
              >
                No interests added yet… are you secretly a robot? 🤖
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
});
