import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
} from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { RFValue } from "react-native-responsive-fontsize";
import Colors from "../../constants/Colors";
import { AuthContext } from "../../context/AuthContext";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import universities from "../../assets/world_universities_and_domains.json";
import { defaultDegrees, defaultFields } from "../../util/defaultValues";
import axios from "axios";
import CampuslyAlert from "../../components/CampuslyAlert";
import { LinearGradient } from "expo-linear-gradient";

export default function EditEducation({ route }: { route: any }) {
  const navigation = useNavigation();
  const { userEmail } = route.params;
  const { colors } = useTheme();
  const { userData, setUserData, education, setEducation } =
    useContext(AuthContext);

  // Education state is now managed by AuthContext
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newSchool, setNewSchool] = useState<{
    name: string;
    logo: string;
    country: string;
  } | null>(null);
  const [newDegree, setNewDegree] = useState("");
  const [newFieldOfStudy, setNewFieldOfStudy] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [newActivities, setNewActivities] = useState("");
  const [newSocieties, setNewSocieties] = useState("");

  // Date picker modals
  const [isStartDatePickerVisible, setIsStartDatePickerVisible] =
    useState(false);
  const [isEndDatePickerVisible, setIsEndDatePickerVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Search modals
  const [isSchoolModalVisible, setIsSchoolModalVisible] = useState(false);
  const [isDegreeModalVisible, setIsDegreeModalVisible] = useState(false);
  const [isFieldModalVisible, setIsFieldModalVisible] = useState(false);
  const [schoolQuery, setSchoolQuery] = useState("");
  const [degreeQuery, setDegreeQuery] = useState("");
  const [fieldQuery, setFieldQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingEducation, setIsAddingEducation] = useState(false);
  const [isSearchingSchools, setIsSearchingSchools] = useState(false);
  const [isSearchingDegrees, setIsSearchingDegrees] = useState(false);
  const [isSearchingFields, setIsSearchingFields] = useState(false);
  const [removingEducationIndex, setRemovingEducationIndex] = useState<
    number | null
  >(null);
  const [editingEducationIndex, setEditingEducationIndex] = useState<
    number | null
  >(null);
  const [defaultSchools, setDefaultSchools] = useState<
    { name: string; logo: string; country: string }[]
  >([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Modal animation values
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(300)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;

  // Load education data when component mounts
  useEffect(() => {
    // Ensure education is always an array
    if (!Array.isArray(education)) {
      setEducation([]);
    }

    if (!Array.isArray(education) || education.length === 0) {
      refreshEducationData();
    }
  }, [education]);

  // Page entrance animations
  useEffect(() => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.95);

    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Modal entrance animations
  useEffect(() => {
    if (
      isAddModalVisible ||
      isSchoolModalVisible ||
      isDegreeModalVisible ||
      isFieldModalVisible
    ) {
      // Reset modal animations
      modalFadeAnim.setValue(0);
      modalSlideAnim.setValue(300);
      modalScaleAnim.setValue(0.8);

      // Start modal entrance animations
      Animated.parallel([
        Animated.timing(modalFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(modalSlideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    isAddModalVisible,
    isSchoolModalVisible,
    isDegreeModalVisible,
    isFieldModalVisible,
    modalFadeAnim,
    modalSlideAnim,
    modalScaleAnim,
  ]);

  useEffect(() => {
    if (!schoolQuery.trim()) {
      setIsSearchingSchools(false);
      setDefaultSchools(
        universities
          .slice(0, 100)
          .map((university) => ({
            name: university.name,
            logo: `https://logo.clearbit.com/${university.domains[0]}`,
            country: university.country,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } else {
      setIsSearchingSchools(true);
      const delayDebounce = setTimeout(() => {
        fetchSchools();
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [schoolQuery]);

  // Add loading states for degree and field searches
  useEffect(() => {
    if (degreeQuery.trim()) {
      setIsSearchingDegrees(true);
      const delayDebounce = setTimeout(() => {
        setIsSearchingDegrees(false);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [degreeQuery]);

  useEffect(() => {
    if (fieldQuery.trim()) {
      setIsSearchingFields(true);
      const delayDebounce = setTimeout(() => {
        setIsSearchingFields(false);
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [fieldQuery]);

  const populateFormWithEducation = (educationData: any) => {
    try {
      // Parse school data
      let schoolName = "";
      let schoolLogo = "";
      let schoolCountry = "";

      if (typeof educationData.school === "string") {
        const parsed = JSON.parse(educationData.school);
        schoolName = parsed.name || "";
        schoolLogo = parsed.logo || "";
        schoolCountry = parsed.country || "";
      } else if (
        educationData.school &&
        typeof educationData.school === "object"
      ) {
        schoolName = educationData.school.name || "";
        schoolLogo = educationData.school.logo || "";
        schoolCountry = educationData.school.country || "";
      }

      // Set school data
      setNewSchool({
        name: schoolName,
        logo: schoolLogo,
        country: schoolCountry,
      });

      // Set other fields
      setNewDegree(educationData.degree || "");
      setNewFieldOfStudy(educationData.field_of_study || "");
      setNewGrade(educationData.grade || "");
      setNewActivities(
        educationData.activities ? educationData.activities.join(", ") : ""
      );
      setNewSocieties(
        educationData.societies ? educationData.societies.join(", ") : ""
      );

      // Set dates
      if (educationData.start_date) {
        setStartDate(new Date(educationData.start_date));
      }
      if (educationData.end_date) {
        setEndDate(new Date(educationData.end_date));
      }
    } catch (error) {
      console.error("Error populating form:", error);
    }
  };

  const openEditModal = (educationData: any, index: number) => {
    setEditingEducationIndex(index);
    populateFormWithEducation(educationData);
    setIsAddModalVisible(true);
  };

  const openAddModal = () => {
    setEditingEducationIndex(null);
    // Clear all form fields
    setNewSchool(null);
    setNewDegree("");
    setNewFieldOfStudy("");
    setStartDate(null);
    setEndDate(null);
    setNewGrade("");
    setNewActivities("");
    setNewSocieties("");
    setIsAddModalVisible(true);
  };

  const fetchSchools = () => {
    setIsSearchingSchools(true);
    try {
      if (schoolQuery.trim()) {
        setDefaultSchools(
          universities
            .filter((university) =>
              university.name
                .toLowerCase()
                .includes(schoolQuery.trim().toLowerCase())
            )
            .map((university) => ({
              name: university.name,
              logo: `https://logo.clearbit.com/${university.domains[0]}`,
              country: university.country,
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setIsSearchingSchools(false);
    }
  };

  const getDegreeIcon = (degree: string) => {
    const lowerDegree = degree.toLowerCase();
    if (
      lowerDegree.includes("bachelor") ||
      lowerDegree.includes("ba") ||
      lowerDegree.includes("bs")
    ) {
      return "🎓";
    } else if (
      lowerDegree.includes("master") ||
      lowerDegree.includes("ma") ||
      lowerDegree.includes("ms")
    ) {
      return "🎯";
    } else if (
      lowerDegree.includes("phd") ||
      lowerDegree.includes("doctorate")
    ) {
      return "🔬";
    } else if (
      lowerDegree.includes("associate") ||
      lowerDegree.includes("aa")
    ) {
      return "📚";
    } else if (lowerDegree.includes("diploma")) {
      return "📜";
    } else if (lowerDegree.includes("certificate")) {
      return "🏆";
    } else {
      return "🎓";
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Edit Education",
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
            color={colors.onBackground}
          />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 15 }} onPress={openAddModal}>
          <Ionicons name="add" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  const handleSaveEducation = async () => {
    if (newSchool?.name.trim() && newDegree.trim() && newFieldOfStudy.trim()) {
      setIsAddingEducation(true);

      try {
        // Convert comma-separated strings to arrays
        const activitiesList = newActivities.trim()
          ? newActivities
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
          : [];
        const societiesList = newSocieties.trim()
          ? newSocieties
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
          : [];

        const educationEntry = {
          school: {
            name: newSchool?.name.trim() || "",
            logo: newSchool?.logo || "",
            country: newSchool?.country.trim() || "",
          },
          degree: newDegree.trim(),
          fieldOfStudy: newFieldOfStudy.trim(),
          startDate: startDate ? startDate.toLocaleDateString() : "",
          endDate: endDate ? endDate.toLocaleDateString() : "",
          grade: newGrade.trim(),
          activities: activitiesList,
          societies: societiesList,
        };

        if (editingEducationIndex !== null) {
          // Update existing education entry
          const currentEducation = Array.isArray(education) ? education : [];
          const educationToUpdate = currentEducation[editingEducationIndex];

          if (educationToUpdate && educationToUpdate.id) {
            const response = await axios.put(
              `${process.env.EXPO_PUBLIC_SERVER_URL}/education/${educationToUpdate.id}`,
              {
                userEmail,
                school: educationEntry.school,
                degree: educationEntry.degree,
                fieldOfStudy: educationEntry.fieldOfStudy,
                startDate: educationEntry.startDate,
                endDate: educationEntry.endDate,
                grade: educationEntry.grade,
                activities: educationEntry.activities,
                societies: educationEntry.societies,
              }
            );

            if (response.status === 200) {
              console.log("Education entry updated successfully");
            } else {
              console.error("Failed to update education entry");
              return;
            }
          }
        } else {
          // Add new education entry
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_SERVER_URL}/education`,
            {
              userEmail,
              school: educationEntry.school,
              degree: educationEntry.degree,
              fieldOfStudy: educationEntry.fieldOfStudy,
              startDate: educationEntry.startDate,
              endDate: educationEntry.endDate,
              grade: educationEntry.grade,
              activities: educationEntry.activities,
              societies: educationEntry.societies,
            }
          );

          if (response.status !== 201) {
            console.error("Failed to add education entry");
            return;
          }
        }

        // Refresh data from database to ensure consistency
        await refreshEducationData();

        // Clear inputs and close modal
        setNewSchool(null);
        setNewDegree("");
        setNewFieldOfStudy("");
        setStartDate(null);
        setEndDate(null);
        setNewGrade("");
        setNewActivities("");
        setNewSocieties("");
        setEditingEducationIndex(null);
        setIsAddModalVisible(false);

        console.log(
          editingEducationIndex !== null
            ? "Education entry updated successfully"
            : "Education entry added successfully"
        );
      } catch (error) {
        console.error("Error saving education:", error);
      } finally {
        setIsAddingEducation(false);
      }
    }
  };

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<{
    index: number;
    name: string;
  } | null>(null);

  const handleRemoveEducation = async (index: number) => {
    // Get education data for the alert
    const currentEducation = Array.isArray(education) ? education : [];
    const educationData = currentEducation.find((edu: any) => edu.id === index);

    let schoolName = "this education entry";
    try {
      if (typeof educationData.school === "string") {
        const parsed = JSON.parse(educationData.school);
        schoolName = parsed.name || "this education entry";
      } else if (
        educationData.school &&
        typeof educationData.school === "object"
      ) {
        schoolName = educationData.school.name || "this education entry";
      }
    } catch (error) {
      console.warn("Error parsing school data:", error);
    }

    setEducationToDelete({ index, name: schoolName });
    setShowDeleteAlert(true);
  };

  const confirmDeleteEducation = async () => {
    if (!educationToDelete) return;

    setRemovingEducationIndex(educationToDelete.index);
    setShowDeleteAlert(false);

    try {
      const currentEducation = Array.isArray(education) ? education : [];
      const updatedEducation = currentEducation.filter(
        (_: any, i: number) => i !== educationToDelete.index
      );

      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/education/delete/${educationToDelete.index}`
      );

      if (response.status === 200) {
        // Database delete successful - refresh data from database to ensure consistency
        await refreshEducationData();

        console.log(
          "Education entry removed successfully from database and local state"
        );
      } else {
        // Database delete failed - don't update local state
        console.error("Failed to remove education entry from database");
        // You could show a toast/alert here to inform the user
      }
    } catch (error) {
      console.error("Error removing education:", error);
      // You could show a toast/alert here to inform the user
    } finally {
      setRemovingEducationIndex(null);
      setEducationToDelete(null);
    }
  };

  const refreshEducationData = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/education/${userEmail}`
      );

      if (response.status === 200) {
        const educationData = response.data.data;
        console.log("Raw education data from database:", educationData);
        console.log("Type of education data:", typeof educationData);
        console.log("Is array:", Array.isArray(educationData));

        if (Array.isArray(educationData)) {
          console.log("First education item structure:", educationData[0]);
          setEducation(educationData);
        } else {
          console.warn("Education data is not an array:", educationData);
          setEducation([]);
        }
      }
    } catch (error) {
      console.error("Error refreshing education data:", error);
    }
  };

  const handleSave = async () => {
    navigation.goBack();
    setIsSubmitting(true);
    try {
      // Refresh education data from server to ensure consistency
      await refreshEducationData();
      console.log("Education data refreshed from server");
    } catch (error) {
      console.warn("Error during save operation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Animated.View
      style={[
        { flex: 1, backgroundColor: colors.background },
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={false}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <Animated.ScrollView
          style={[
            styles.ultraModernContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
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
            <LinearGradient
              colors={[Colors.PRIMARY, colors.onBackground, Colors.PRIMARY]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Animated.View
                  style={[
                    styles.heroIconWrapper,
                    {
                      transform: [{ scale: scaleAnim }],
                    },
                  ]}
                >
                  <Ionicons name="school" size={RFValue(40)} color="#fff" />
                </Animated.View>
                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>Education</Text>
                  <Text style={styles.heroSubtitle}>
                    Showcase your academic journey
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
          {(isAddingEducation || removingEducationIndex !== null) && (
            <Animated.View
              style={[
                styles.savingIndicator,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={[styles.savingText, { color: Colors.PRIMARY }]}>
                💾 Saving changes...
              </Text>
            </Animated.View>
          )}

          {Array.isArray(education) && education.length > 0 ? (
            education.map((edu: any, index: number) => {
              console.log("Education item:", edu); // Debug log

              // Parse school data safely
              let schoolName = "Unknown School";
              let schoolLogo = "";
              try {
                if (typeof edu.school === "string") {
                  const parsed = JSON.parse(edu.school);
                  schoolName = parsed.name || "Unknown School";
                  schoolLogo = parsed.logo || "";
                } else if (edu.school && typeof edu.school === "object") {
                  schoolName = edu.school.name || "Unknown School";
                  schoolLogo = edu.school.logo || "";
                }
              } catch (error) {
                console.warn("Error parsing school data:", error);
              }

              return (
                <Animated.View
                  key={index}
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.ultraModernCard,
                      { backgroundColor: colors.surface },
                    ]}
                    onPress={() => openEditModal(edu, index)}
                    activeOpacity={0.7}
                  >
                    {/* Card Header */}
                    <View style={styles.cardHeader}>
                      <View style={styles.schoolInfo}>
                        {/* School Logo */}
                        {schoolLogo ? (
                          <Image
                            source={{ uri: schoolLogo }}
                            style={styles.ultraModernLogo}
                            defaultSource={require("../../assets/images/no-club.png")}
                          />
                        ) : (
                          <View style={styles.ultraModernLogoPlaceholder}>
                            <Ionicons
                              name="school"
                              size={RFValue(24)}
                              color={Colors.PRIMARY}
                            />
                          </View>
                        )}

                        <View style={styles.schoolDetails}>
                          <Text
                            style={[
                              styles.ultraModernInstitutionText,
                              { color: colors.onBackground },
                            ]}
                          >
                            {schoolName}
                          </Text>

                          {/* Degree and Field of Study */}
                          {edu.degree && edu.field_of_study && (
                            <Text
                              style={[
                                styles.ultraModernDegreeText,
                                { color: colors.onSurfaceVariant },
                              ]}
                            >
                              {edu.degree} in {edu.field_of_study}
                            </Text>
                          )}

                          {/* Degree only */}
                          {edu.degree && !edu.field_of_study && (
                            <Text
                              style={[
                                styles.ultraModernDegreeText,
                                { color: colors.onSurfaceVariant },
                              ]}
                            >
                              {edu.degree}
                            </Text>
                          )}

                          {/* Field of Study only */}
                          {!edu.degree && edu.field_of_study && (
                            <Text
                              style={[
                                styles.ultraModernDegreeText,
                                { color: colors.onSurfaceVariant },
                              ]}
                            >
                              {edu.field_of_study}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.ultraModernActionButtons}>
                        <TouchableOpacity
                          onPress={() => openEditModal(edu, index)}
                          style={styles.ultraModernEditButton}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="pencil"
                            size={RFValue(16)}
                            color={Colors.PRIMARY}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleRemoveEducation(edu.id)}
                          style={styles.ultraModernRemoveButton}
                          disabled={removingEducationIndex === index}
                        >
                          {removingEducationIndex === index ? (
                            <Text style={styles.removingText}>...</Text>
                          ) : (
                            <Ionicons
                              name="close-circle"
                              size={RFValue(20)}
                              color="#ff4444"
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Card Footer with Dates */}
                    {(edu.start_date || edu.end_date) && (
                      <View style={styles.cardFooter}>
                        <View style={styles.dateInfo}>
                          <Ionicons
                            name="calendar"
                            size={RFValue(14)}
                            color={colors.onSurfaceVariant}
                          />
                          <Text
                            style={[
                              styles.dateText,
                              { color: colors.onSurfaceVariant },
                            ]}
                          >
                            {edu.start_date && edu.end_date
                              ? `${format(
                                  new Date(edu.start_date),
                                  "MMM yyyy"
                                )} - ${format(
                                  new Date(edu.end_date),
                                  "MMM yyyy"
                                )}`
                              : edu.start_date
                              ? `Started ${format(
                                  new Date(edu.start_date),
                                  "MMM yyyy"
                                )}`
                              : `Ended ${format(
                                  new Date(edu.end_date),
                                  "MMM yyyy"
                                )}`}
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          ) : (
            <Animated.View
              style={[
                styles.ultraModernEmptyState,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.emptyStateIcon}>
                <Ionicons
                  name="school-outline"
                  size={RFValue(48)}
                  color={colors.onSurfaceVariant}
                />
              </View>
              <Text
                style={[styles.emptyStateTitle, { color: colors.onBackground }]}
              >
                No Education Added Yet
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtitle,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Start building your academic profile by adding your first
                education entry
              </Text>
            </Animated.View>
          )}
        </Animated.ScrollView>

        {/* Floating Add Education Button */}
        <TouchableOpacity
          style={[
            styles.floatingAddButton,
            { backgroundColor: Colors.PRIMARY },
          ]}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={RFValue(28)} color="white" />
        </TouchableOpacity>

        {/* Ultra Modern Save Button */}
        <View
          style={[
            styles.ultraModernSaveButtonContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.ultraModernSaveButton,
              {
                backgroundColor: isSubmitting ? "#cccccc" : Colors.PRIMARY,
                shadowColor: isSubmitting ? "transparent" : Colors.PRIMARY,
              },
            ]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.ultraModernLoadingContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={RFValue(20)}
                  color="white"
                />
                <Text style={styles.ultraModernSaveButtonText}>Done</Text>
              </View>
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={RFValue(20)}
                  color="white"
                />
                <Text style={styles.ultraModernSaveButtonText}>Done</Text>
              </>
            )}
          </TouchableOpacity>
          <Text
            style={[
              styles.ultraModernSaveButtonDescription,
              { color: colors.onSurfaceVariant },
            ]}
          >
            Changes are saved automatically as you add or remove entries
          </Text>
        </View>

        {/* Add Education Modal */}
        <Modal
          visible={isAddModalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={() => {}}
          statusBarTranslucent={true}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: modalFadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => {
                setIsAddModalVisible(false);
                setEditingEducationIndex(null);
                // Clear form when modal is closed
                setNewSchool(null);
                setNewDegree("");
                setNewFieldOfStudy("");
                setStartDate(null);
                setEndDate(null);
                setNewGrade("");
                setNewActivities("");
                setNewSocieties("");
              }}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
              style={{ flex: 1 }}
            >
              <Animated.View
                style={[
                  styles.modalContent,
                  { backgroundColor: colors.background },
                  {
                    opacity: modalFadeAnim,
                    transform: [
                      { translateY: modalSlideAnim },
                      { scale: modalScaleAnim },
                    ],
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHandle} />
                  <View style={styles.modalTitleRow}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setIsAddModalVisible(false);
                        setEditingEducationIndex(null);
                        // Clear form when modal is closed
                        setNewSchool(null);
                        setNewDegree("");
                        setNewFieldOfStudy("");
                        setStartDate(null);
                        setEndDate(null);
                        setNewGrade("");
                        setNewActivities("");
                        setNewSocieties("");
                      }}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={colors.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.modalTitle,
                        { color: colors.onBackground },
                      ]}
                    >
                      {editingEducationIndex !== null
                        ? "Edit Education"
                        : "Add New Education"}
                    </Text>
                    <View style={styles.cancelButton} />
                  </View>
                </View>

                <ScrollView
                  style={styles.modalScrollView}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: RFValue(20) }}
                >
                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: colors.onBackground },
                      ]}
                    >
                      School
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: "#ffffff",
                          borderColor: "#e0e0e0",
                        },
                      ]}
                      onPress={() => setIsSchoolModalVisible(true)}
                    >
                      {newSchool?.logo ? (
                        <Image
                          source={{ uri: newSchool.logo }}
                          style={styles.selectedLogo}
                        />
                      ) : null}
                      <Text
                        style={[
                          styles.searchInputText,
                          {
                            color: newSchool ? "#000000" : "#666666",
                          },
                        ]}
                      >
                        {newSchool?.name || "Select school..."}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={colors.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: colors.onBackground },
                      ]}
                    >
                      Degree
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: "#ffffff",
                          borderColor: "#e0e0e0",
                        },
                      ]}
                      onPress={() => setIsDegreeModalVisible(true)}
                    >
                      {newDegree ? (
                        <Text style={styles.degreeIcon}>
                          {getDegreeIcon(newDegree)}
                        </Text>
                      ) : null}
                      <Text
                        style={[
                          styles.searchInputText,
                          {
                            color: newDegree ? "#000000" : "#666666",
                          },
                        ]}
                      >
                        {newDegree || "Select degree..."}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={colors.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: colors.onBackground },
                      ]}
                    >
                      Field of Study
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: "#ffffff",
                          borderColor: "#e0e0e0",
                        },
                      ]}
                      onPress={() => setIsFieldModalVisible(true)}
                    >
                      <Text
                        style={[
                          styles.searchInputText,
                          {
                            color: newFieldOfStudy ? "#000000" : "#666666",
                          },
                        ]}
                      >
                        {newFieldOfStudy || "Select field of study..."}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={colors.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: colors.onBackground },
                      ]}
                    >
                      Start Date
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: "#ffffff",
                          borderColor: "#e0e0e0",
                        },
                      ]}
                      onPress={() => setIsStartDatePickerVisible(true)}
                    >
                      <Text
                        style={[
                          styles.searchInputText,
                          {
                            color: startDate ? "#000000" : "#666666",
                          },
                        ]}
                      >
                        {startDate
                          ? format(startDate as Date, "MMMM yyyy")
                          : "Select start date..."}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={colors.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: colors.onBackground },
                      ]}
                    >
                      End Date
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: "#ffffff",
                          borderColor: "#e0e0e0",
                        },
                      ]}
                      onPress={() => setIsEndDatePickerVisible(true)}
                    >
                      <Text
                        style={[
                          styles.searchInputText,
                          {
                            color: endDate ? "#000000" : "#666666",
                          },
                        ]}
                      >
                        {endDate
                          ? format(endDate as Date, "MMMM yyyy")
                          : "Select end date..."}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={colors.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: colors.onBackground },
                      ]}
                    >
                      Grade
                    </Text>
                    <TextInput
                      placeholder="e.g., 3.8 GPA"
                      placeholderTextColor="#666666"
                      value={newGrade}
                      onChangeText={setNewGrade}
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: "#ffffff",
                          borderColor: "#e0e0e0",
                          color: "#000000",
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: colors.onBackground },
                      ]}
                    >
                      Activities
                    </Text>
                    <TextInput
                      placeholder="e.g., Student Council, Debate Team, Sports Team"
                      placeholderTextColor="#666666"
                      value={newActivities}
                      onChangeText={setNewActivities}
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: "#ffffff",
                          borderColor: "#e0e0e0",
                          color: "#000000",
                        },
                      ]}
                      multiline
                    />
                    <Text
                      style={[
                        styles.inputHint,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Separate multiple activities with commas
                    </Text>
                    {newActivities.trim() && (
                      <View
                        style={[
                          styles.previewContainer,
                          { backgroundColor: `${Colors.PRIMARY}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.previewLabel,
                            { color: colors.onSurfaceVariant },
                          ]}
                        >
                          Will be saved as:
                        </Text>
                        <View style={styles.previewItems}>
                          {newActivities
                            .split(",")
                            .map((item, index) => item.trim())
                            .filter((item) => item.length > 0)
                            .map((item, index) => (
                              <View
                                key={index}
                                style={[
                                  styles.previewItem,
                                  { backgroundColor: `${Colors.PRIMARY}40` },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.previewItemText,
                                    { color: colors.onBackground },
                                  ]}
                                >
                                  {item.trim()}
                                </Text>
                              </View>
                            ))}
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: colors.onBackground },
                      ]}
                    >
                      Societies
                    </Text>
                    <TextInput
                      placeholder="e.g., Computer Science Society, Engineering Club, Chess Club"
                      placeholderTextColor="#666666"
                      value={newSocieties}
                      onChangeText={setNewSocieties}
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: "#ffffff",
                          borderColor: "#e0e0e0",
                          color: "#000000",
                        },
                      ]}
                      multiline
                    />
                    <Text
                      style={[
                        styles.inputHint,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Separate multiple societies with commas
                    </Text>
                    {newSocieties.trim() && (
                      <View
                        style={[
                          styles.previewContainer,
                          { backgroundColor: `${Colors.PRIMARY}20` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.previewLabel,
                            { color: colors.onSurfaceVariant },
                          ]}
                        >
                          Will be saved as:
                        </Text>
                        <View style={styles.previewItems}>
                          {newSocieties
                            .split(",")
                            .map((item, index) => item.trim())
                            .filter((item) => item.length > 0)
                            .map((item, index) => (
                              <View
                                key={index}
                                style={[
                                  styles.previewItem,
                                  { backgroundColor: `${Colors.PRIMARY}40` },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.previewItemText,
                                    { color: colors.onBackground },
                                  ]}
                                >
                                  {item.trim()}
                                </Text>
                              </View>
                            ))}
                        </View>
                      </View>
                    )}
                  </View>
                </ScrollView>

                {/* Fixed Bottom Button */}
                <View style={styles.fixedButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.addButton,
                      {
                        backgroundColor: isAddingEducation
                          ? "#cccccc"
                          : Colors.PRIMARY,
                      },
                    ]}
                    onPress={handleSaveEducation}
                    disabled={isAddingEducation}
                  >
                    {isAddingEducation ? (
                      <View style={styles.loadingContainer}>
                        <Text
                          style={[styles.addButtonText, { color: "white" }]}
                        >
                          {editingEducationIndex !== null
                            ? "Updating..."
                            : "Adding..."}
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.addButtonText, { color: "white" }]}>
                        {editingEducationIndex !== null
                          ? "Update Education"
                          : "Add Education Entry"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </Animated.View>
        </Modal>

        {/* School Search Modal */}
        <Modal
          visible={isSchoolModalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={() => {}}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: modalFadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setIsSchoolModalVisible(false)}
            />
            <Animated.View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
                {
                  opacity: modalFadeAnim,
                  transform: [
                    { translateY: modalSlideAnim },
                    { scale: modalScaleAnim },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { backgroundColor: colors.background },
                ]}
              >
                <View
                  style={[
                    styles.modalHandle,
                    { backgroundColor: colors.background },
                  ]}
                />
                <View style={styles.modalTitleRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsSchoolModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[styles.modalTitle, { color: colors.onBackground }]}
                  >
                    🎓 Find Your School
                  </Text>
                  <View style={styles.cancelButton} />
                </View>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Search from thousands of universities worldwide
                </Text>
              </View>

              <View style={styles.searchInputContainer}>
                <TextInput
                  placeholder="Search schools..."
                  placeholderTextColor="#666666"
                  value={schoolQuery}
                  onChangeText={setSchoolQuery}
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

              {/* Search Status */}
              <View style={styles.searchStatusContainer}>
                {isSearchingSchools ? (
                  <Text
                    style={[styles.searchStatusText, { color: Colors.PRIMARY }]}
                  >
                    ⌛
                  </Text>
                ) : schoolQuery ? (
                  <Text
                    style={[
                      styles.searchStatusText,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Found {defaultSchools.length} schools for "{schoolQuery}"
                  </Text>
                ) : (
                  <Text
                    style={[
                      styles.searchStatusText,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Enter a school name to search
                  </Text>
                )}
              </View>

              {isSearchingSchools ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.PRIMARY} />
                  <Text
                    style={[
                      styles.searchStatusText,
                      { color: Colors.PRIMARY, marginLeft: RFValue(8) },
                    ]}
                  >
                    Searching schools...
                  </Text>
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <FlatList
                    data={defaultSchools}
                    keyExtractor={(item, index) =>
                      item.name + index + item.logo
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.searchOption,
                          newSchool?.name === item.name &&
                            styles.searchOptionSelected,
                        ]}
                        onPress={() => {
                          setNewSchool({
                            name: item.name,
                            logo: item.logo,
                            country: item.country,
                          });
                          setSchoolQuery("");
                          setIsSchoolModalVisible(false);
                        }}
                      >
                        <View style={styles.schoolItem}>
                          <Image
                            source={{ uri: item.logo }}
                            style={styles.logo}
                          />
                          <Text
                            style={[
                              styles.schoolItemText,
                              {
                                color:
                                  newSchool?.name === item.name
                                    ? "#ffffff"
                                    : colors.onBackground,
                              },
                            ]}
                          >
                            {item.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    style={{ maxHeight: "100%" }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}

              {schoolQuery &&
                !defaultSchools.some((school) =>
                  school.name.toLowerCase().includes(schoolQuery.toLowerCase())
                ) && (
                  <TouchableOpacity
                    style={[
                      styles.searchOption,
                      newSchool?.name === schoolQuery &&
                        styles.searchOptionSelected,
                    ]}
                    onPress={() => {
                      setNewSchool({
                        name: schoolQuery,
                        logo: "",
                        country: "",
                      });
                      setSchoolQuery("");
                      setIsSchoolModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.searchOptionText,
                        {
                          color:
                            newSchool?.name === schoolQuery
                              ? "#ffffff"
                              : "#000000",
                        },
                      ]}
                    >
                      {schoolQuery}
                    </Text>
                  </TouchableOpacity>
                )}
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Degree Search Modal */}
        <Modal
          visible={isDegreeModalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={() => {}}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: modalFadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setIsDegreeModalVisible(false)}
            />
            <Animated.View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
                {
                  opacity: modalFadeAnim,
                  transform: [
                    { translateY: modalSlideAnim },
                    { scale: modalScaleAnim },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { backgroundColor: colors.background },
                ]}
              >
                <View
                  style={[
                    styles.modalHandle,
                    { backgroundColor: colors.background },
                  ]}
                />
                <View style={styles.modalTitleRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsDegreeModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[styles.modalTitle, { color: colors.onBackground }]}
                  >
                    🎯 Choose Your Degree
                  </Text>
                  <View style={styles.cancelButton} />
                </View>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Select from common degree types or add your own
                </Text>
              </View>

              <View style={styles.searchInputContainer}>
                <TextInput
                  placeholder="Search degrees..."
                  placeholderTextColor="#666666"
                  value={degreeQuery}
                  onChangeText={setDegreeQuery}
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
                {isSearchingDegrees && (
                  <View style={styles.searchLoadingIndicator}>
                    <Text style={styles.searchLoadingText}>🔍</Text>
                  </View>
                )}
              </View>

              {/* Debug info */}
              <Text
                style={{
                  color: colors.onSurfaceVariant,
                  marginBottom: RFValue(4),
                }}
              >
                {isSearchingDegrees
                  ? "Searching degrees..."
                  : degreeQuery
                  ? `Found ${
                      defaultDegrees.filter((degree) =>
                        degree.toLowerCase().includes(degreeQuery.toLowerCase())
                      ).length
                    } degrees for "${degreeQuery}"`
                  : "Enter a degree to search"}
              </Text>

              {defaultDegrees.length > 0 && (
                <View style={styles.flatListContainer}>
                  <FlatList
                    data={
                      [
                        ...defaultDegrees
                          .filter((degree) =>
                            degree
                              .toLowerCase()
                              .includes(degreeQuery.trim().toLowerCase())
                          )
                          .sort((a, b) => a.localeCompare(b)),
                        // Add custom degree option if query doesn't match any default degrees
                        ...(degreeQuery.trim() &&
                        !defaultDegrees.some((degree) =>
                          degree
                            .toLowerCase()
                            .includes(degreeQuery.trim().toLowerCase())
                        )
                          ? [{ isCustom: true, name: degreeQuery }]
                          : []),
                      ] as (string | { isCustom: boolean; name: string })[]
                    }
                    keyExtractor={(item, index) =>
                      typeof item === "object" && item.isCustom
                        ? `custom-${item.name}-${index}`
                        : `${item}-${index}`
                    }
                    renderItem={({ item }) => {
                      if (typeof item === "object" && item.isCustom) {
                        return (
                          <TouchableOpacity
                            style={[
                              styles.searchOption,
                              newDegree === item.name &&
                                styles.searchOptionSelected,
                            ]}
                            onPress={() => {
                              setNewDegree(item.name);
                              setDegreeQuery("");
                              setIsDegreeModalVisible(false);
                            }}
                          >
                            <View style={styles.degreeItem}>
                              <Text style={styles.degreeIcon}>
                                {getDegreeIcon(item.name)}
                              </Text>
                              <Text
                                style={[
                                  styles.searchOptionText,
                                  {
                                    color:
                                      newDegree === item.name
                                        ? "#ffffff"
                                        : "#000000",
                                  },
                                ]}
                              >
                                {item.name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      }

                      return (
                        <TouchableOpacity
                          style={[
                            styles.searchOption,
                            newDegree === item && styles.searchOptionSelected,
                          ]}
                          onPress={() => {
                            setNewDegree(item as string);
                            setDegreeQuery("");
                            setIsDegreeModalVisible(false);
                          }}
                        >
                          <View style={styles.degreeItem}>
                            <Text style={styles.degreeIcon}>
                              {getDegreeIcon(item as string)}
                            </Text>
                            <Text
                              style={[
                                styles.searchOptionText,
                                {
                                  color:
                                    newDegree === item
                                      ? "#ffffff"
                                      : colors.onBackground,
                                },
                              ]}
                            >
                              {item as string}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                  />
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Field of Study Search Modal */}
        <Modal
          visible={isFieldModalVisible}
          animationType="none"
          transparent={true}
          onRequestClose={() => {}}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: modalFadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setIsFieldModalVisible(false)}
            />
            <Animated.View
              style={[
                styles.modalContent,
                { backgroundColor: colors.background },
                {
                  opacity: modalFadeAnim,
                  transform: [
                    { translateY: modalSlideAnim },
                    { scale: modalScaleAnim },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.modalHeader,
                  { backgroundColor: colors.background },
                ]}
              >
                <View
                  style={[
                    styles.modalHandle,
                    { backgroundColor: colors.background },
                  ]}
                />
                <View style={styles.modalTitleRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsFieldModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[styles.modalTitle, { color: colors.onBackground }]}
                  >
                    📚 Pick Your Field
                  </Text>
                  <View style={styles.cancelButton} />
                </View>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Choose your academic discipline or create a custom one
                </Text>
              </View>

              <View style={styles.searchInputContainer}>
                <TextInput
                  placeholder="Search fields..."
                  placeholderTextColor="#666666"
                  value={fieldQuery}
                  onChangeText={setFieldQuery}
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
                {isSearchingFields && (
                  <View style={styles.searchLoadingIndicator}>
                    <Text style={styles.searchLoadingText}>🔍</Text>
                  </View>
                )}
              </View>

              {/* Debug info */}
              <Text
                style={{
                  color: colors.onSurfaceVariant,
                  marginBottom: RFValue(4),
                }}
              >
                {isSearchingFields
                  ? "Searching fields..."
                  : fieldQuery
                  ? `Found ${
                      defaultFields.filter((field) =>
                        field.toLowerCase().includes(fieldQuery.toLowerCase())
                      ).length
                    } fields for "${fieldQuery}"`
                  : "Enter a field to search"}
              </Text>

              {defaultFields.length > 0 && (
                <View style={styles.flatListContainer}>
                  <FlatList
                    data={
                      [
                        ...defaultFields
                          .filter((field) =>
                            field
                              .toLowerCase()
                              .includes(fieldQuery.trim().toLowerCase())
                          )
                          .sort((a, b) => a.localeCompare(b)),
                        // Add custom field option if query doesn't match any default fields
                        ...(fieldQuery.trim() &&
                        !defaultFields.some((field) =>
                          field.toLowerCase().includes(fieldQuery.toLowerCase())
                        )
                          ? [{ isCustom: true, name: fieldQuery }]
                          : []),
                      ] as (string | { isCustom: boolean; name: string })[]
                    }
                    keyExtractor={(item, index) =>
                      typeof item === "object" && item.isCustom
                        ? `custom-${item.name}-${index}`
                        : `${item}-${index}`
                    }
                    renderItem={({ item }) => {
                      if (typeof item === "object" && item.isCustom) {
                        return (
                          <TouchableOpacity
                            style={[
                              styles.searchOption,
                              newFieldOfStudy === item.name &&
                                styles.searchOptionSelected,
                            ]}
                            onPress={() => {
                              setNewFieldOfStudy(item.name);
                              setFieldQuery("");
                              setIsFieldModalVisible(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.searchOptionText,
                                {
                                  color:
                                    newFieldOfStudy === item.name
                                      ? "#ffffff"
                                      : "#000000",
                                },
                              ]}
                            >
                              {item.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      }

                      return (
                        <TouchableOpacity
                          style={[
                            styles.searchOption,
                            newFieldOfStudy === item &&
                              styles.searchOptionSelected,
                          ]}
                          onPress={() => {
                            setNewFieldOfStudy(item as string);
                            setFieldQuery("");
                            setIsFieldModalVisible(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.searchOptionText,
                              {
                                color:
                                  newFieldOfStudy === item
                                    ? "#ffffff"
                                    : colors.onBackground,
                              },
                            ]}
                          >
                            {item as string}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                  />
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </Modal>

        {/* Date Picker Modals */}
        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          locale="en_US"
          display="spinner"
          onConfirm={(date) => {
            setStartDate(new Date(date));
            setIsStartDatePickerVisible(false);
          }}
          onCancel={() => setIsStartDatePickerVisible(false)}
        />

        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="date"
          locale="en_US"
          display="spinner"
          onConfirm={(date) => {
            setEndDate(new Date(date));
            setIsEndDatePickerVisible(false);
          }}
          onCancel={() => setIsEndDatePickerVisible(false)}
        />

        {/* Delete Confirmation Alert */}
        <CampuslyAlert
          isVisible={showDeleteAlert}
          type="error"
          onClose={() => setShowDeleteAlert(false)}
          messages={{
            success: {
              title: "Deleted! ✂️",
              message:
                "Poof! That education entry is gone for good. Hope you didn’t need it for your CV… 👀",
              icon: "🎉",
            },
            error: {
              title: "Heads Up! 🚨",
              message: `About to drop ${educationToDelete?.name} like a tough elective. Once it’s gone, no retakes! 📚🔥`,
              icon: "🤓",
            },
          }}
          onPress={confirmDeleteEducation}
          buttonText="Yes, Drop It"
          buttonText2="Nevermind"
          onPress2={() => setShowDeleteAlert(false)}
          overrideDefault={true}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: RFValue(16),
  },
  sectionTitle: {
    fontSize: RFValue(24),
    fontWeight: "bold",
    marginBottom: RFValue(8),
  },
  sectionDescription: {
    fontSize: RFValue(16),
    marginBottom: RFValue(24),
    lineHeight: RFValue(22),
  },
  educationCard: {
    flexDirection: "row",
    padding: RFValue(16),
    borderRadius: RFValue(12),
    marginBottom: RFValue(12),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  educationLogo: {
    width: RFValue(48),
    height: RFValue(48),
    borderRadius: RFValue(8),
    marginRight: RFValue(16),
  },
  educationLogoPlaceholder: {
    width: RFValue(48),
    height: RFValue(48),
    borderRadius: RFValue(8),
    marginRight: RFValue(16),
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholderText: {
    fontSize: RFValue(24),
  },
  educationContent: {
    flex: 1,
  },
  institutionText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    marginBottom: RFValue(4),
    lineHeight: RFValue(18),
  },
  degreeText: {
    fontSize: RFValue(12),
    lineHeight: RFValue(16),
    opacity: 0.8,
  },
  actionButtonsContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: RFValue(4),
  },
  editButton: {
    padding: RFValue(8),
    alignSelf: "flex-start",
    marginTop: RFValue(4),
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: RFValue(6),
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.3)",
  },
  removeButton: {
    padding: RFValue(8),
    alignSelf: "flex-start",
    marginTop: RFValue(4),
  },
  placeholderContainer: {
    alignItems: "center",
    paddingVertical: RFValue(40),
  },
  placeholderText: {
    fontSize: RFValue(16),
    textAlign: "center",
    lineHeight: RFValue(22),
  },
  saveButtonContainer: {
    padding: RFValue(16),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  saveButton: {
    paddingVertical: RFValue(14),
    borderRadius: RFValue(8),
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: RFValue(16),
    fontWeight: "bold",
  },
  saveButtonDescription: {
    fontSize: RFValue(12),
    textAlign: "center",
    marginTop: RFValue(8),
    opacity: 0.7,
    lineHeight: RFValue(16),
  },
  savingIndicator: {
    alignItems: "center",
    marginBottom: RFValue(16),
    paddingVertical: RFValue(8),
    paddingHorizontal: RFValue(16),
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: RFValue(20),
  },
  savingText: {
    fontSize: RFValue(14),
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    display: "flex",

    padding: RFValue(20),
    width: "100%",
    height: "100%",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: RFValue(20),
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    position: "relative",
  },
  cancelButton: {
    width: RFValue(40),
    height: RFValue(40),
    alignItems: "center",
    justifyContent: "center",
  },
  modalHandle: {
    width: RFValue(40),
    height: RFValue(4),
    backgroundColor: "#ffffff",
    borderRadius: RFValue(2),
    marginBottom: RFValue(12),
  },
  modalTitle: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: RFValue(14),
    textAlign: "center",
    marginTop: RFValue(8),
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: RFValue(16),
  },
  inputLabel: {
    fontSize: RFValue(14),
    marginBottom: RFValue(8),
  },
  textInput: {
    paddingHorizontal: RFValue(12),
    paddingVertical: RFValue(10),
    borderRadius: RFValue(8),
    borderWidth: 1,
    fontSize: RFValue(16),
  },
  fixedButtonContainer: {
    paddingHorizontal: RFValue(20),
    paddingVertical: RFValue(10),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    backgroundColor: "transparent",
  },
  addButton: {
    paddingVertical: RFValue(10),
    paddingHorizontal: RFValue(20),
    borderRadius: RFValue(8),
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: RFValue(16),
    fontWeight: "bold",
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
  searchOption: {
    paddingVertical: RFValue(12),
    paddingHorizontal: RFValue(16),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  searchOptionSelected: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: RFValue(8),
  },
  searchOptionText: {
    fontSize: RFValue(16),
  },
  modalScrollView: {
    flex: 1,
  },
  schoolItem: {
    flexDirection: "row",
    alignItems: "center",

    color: "white",
    width: "100%",
  },
  schoolItemText: {},
  logo: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  selectedLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 4,
  },
  degreeItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  degreeIcon: {
    fontSize: RFValue(20),
    marginRight: RFValue(12),
  },
  flatListContainer: {
    flex: 1,
    maxHeight: "80%",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: RFValue(8),
  },
  searchLoadingIndicator: {
    marginLeft: RFValue(8),
    paddingHorizontal: RFValue(8),
  },
  searchLoadingText: {
    fontSize: RFValue(16),
  },
  searchStatusContainer: {
    marginBottom: RFValue(12),
    paddingHorizontal: RFValue(4),
  },
  searchStatusText: {
    fontSize: RFValue(14),
    textAlign: "center",
    marginBottom: RFValue(4),
  },
  removingText: {
    fontSize: RFValue(16),
    color: "#ff4444",
    fontWeight: "bold",
  },
  inputHint: {
    fontSize: RFValue(12),
    marginTop: RFValue(4),
    fontStyle: "italic",
    opacity: 0.7,
  },
  previewContainer: {
    marginTop: RFValue(8),
    padding: RFValue(8),
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: RFValue(6),
  },
  previewLabel: {
    fontSize: RFValue(12),
    marginBottom: RFValue(4),
    fontWeight: "500",
  },
  previewItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: RFValue(6),
  },
  previewItem: {
    backgroundColor: "rgba(0, 122, 255, 0.2)",
    paddingHorizontal: RFValue(8),
    paddingVertical: RFValue(4),
    borderRadius: RFValue(12),
  },
  previewItemText: {
    fontSize: RFValue(12),
    fontWeight: "500",
  },

  // Ultra Modern Styles
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
  ultraModernCard: {
    borderRadius: RFValue(16),
    padding: RFValue(20),
    marginBottom: RFValue(16),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: RFValue(12),
  },
  schoolInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ultraModernLogo: {
    width: RFValue(48),
    height: RFValue(48),
    borderRadius: RFValue(12),
    marginRight: RFValue(16),
  },
  ultraModernLogoPlaceholder: {
    width: RFValue(48),
    height: RFValue(48),
    borderRadius: RFValue(12),
    marginRight: RFValue(16),
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  schoolDetails: {
    flex: 1,
  },
  ultraModernInstitutionText: {
    fontSize: RFValue(18),
    fontWeight: "600",
    marginBottom: RFValue(4),
    letterSpacing: 0.2,
  },
  ultraModernDegreeText: {
    fontSize: RFValue(14),
    fontWeight: "400",
    opacity: 0.8,
  },
  ultraModernActionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: RFValue(8),
  },
  ultraModernEditButton: {
    width: RFValue(36),
    height: RFValue(36),
    borderRadius: RFValue(18),
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  ultraModernRemoveButton: {
    width: RFValue(36),
    height: RFValue(36),
    borderRadius: RFValue(18),
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: RFValue(12),
    marginTop: RFValue(8),
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: RFValue(6),
  },
  dateText: {
    fontSize: RFValue(12),
    fontWeight: "500",
    opacity: 0.7,
  },
  ultraModernEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: RFValue(60),
    paddingHorizontal: RFValue(40),
  },
  emptyStateIcon: {
    width: RFValue(80),
    height: RFValue(80),
    borderRadius: RFValue(40),
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: RFValue(20),
  },
  emptyStateTitle: {
    fontSize: RFValue(20),
    fontWeight: "600",
    marginBottom: RFValue(8),
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: RFValue(14),
    fontWeight: "400",
    textAlign: "center",
    lineHeight: RFValue(20),
    opacity: 0.8,
  },
  ultraModernSaveButtonContainer: {
    padding: RFValue(20),
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    backgroundColor: "transparent",
  },
  ultraModernSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: RFValue(16),
    paddingHorizontal: RFValue(24),
    borderRadius: RFValue(12),
    gap: RFValue(8),
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ultraModernLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: RFValue(8),
  },
  ultraModernSaveButtonText: {
    color: "white",
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  ultraModernSaveButtonDescription: {
    fontSize: RFValue(12),
    textAlign: "center",
    marginTop: RFValue(8),
    opacity: 0.7,
  },
  floatingAddButton: {
    position: "absolute",
    bottom: RFValue(100),
    right: RFValue(20),
    width: RFValue(56),
    height: RFValue(56),
    borderRadius: RFValue(28),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
});
