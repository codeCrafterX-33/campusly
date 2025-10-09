import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type ModalStep = 'form' | 'school' | 'degree' | 'field';

export default function EditEducationOptimized({ route }: { route: any }) {
  const navigation = useNavigation();
  const { userEmail } = route.params;
  const { colors } = useTheme();
  const { userData, setUserData, education, setEducation } = useContext(AuthContext);

  // Single modal state management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Education form data
  const [formData, setFormData] = useState({
    school: { name: "", logo: "", country: "" },
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    grade: "",
    activities: "",
    societies: "",
  });

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Date picker states
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [datePickerType, setDatePickerType] = useState<'start' | 'end'>('start');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Clear form function
  const clearForm = () => {
    setFormData({
      school: { name: "", logo: "", country: "" },
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      grade: "",
      activities: "",
      societies: "",
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  // Open modal functions
  const openAddModal = () => {
    clearForm();
    setModalStep('form');
    setIsModalVisible(true);
  };

  const openEditModal = (educationData: any, index: number) => {
    setFormData({
      school: educationData.school || { name: "", logo: "", country: "" },
      degree: educationData.degree || "",
      fieldOfStudy: educationData.field_of_study || "",
      startDate: educationData.start_date || "",
      endDate: educationData.end_date || "",
      grade: educationData.grade || "",
      activities: educationData.activities || "",
      societies: educationData.societies || "",
    });
    setModalStep('form');
    setIsModalVisible(true);
  };

  // Search functions
  const searchSchools = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const filtered = universities
      .filter((uni: any) => 
        uni.name.toLowerCase().includes(query.toLowerCase()) ||
        uni.country.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 20);
    
    setSearchResults(filtered);
    setIsSearching(false);
  };

  const searchDegrees = (query: string) => {
    if (query.length < 1) {
      setSearchResults(defaultDegrees);
      return;
    }

    const filtered = defaultDegrees.filter((degree: string) =>
      degree.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const searchFields = (query: string) => {
    if (query.length < 1) {
      setSearchResults(defaultFields);
      return;
    }

    const filtered = defaultFields.filter((field: string) =>
      field.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // Handle search based on current step
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    switch (modalStep) {
      case 'school':
        searchSchools(query);
        break;
      case 'degree':
        searchDegrees(query);
        break;
      case 'field':
        searchFields(query);
        break;
    }
  };

  // Handle selection
  const handleSelection = (item: any) => {
    switch (modalStep) {
      case 'school':
        setFormData(prev => ({
          ...prev,
          school: {
            name: item.name,
            logo: item.logo || "",
            country: item.country,
          }
        }));
        break;
      case 'degree':
        setFormData(prev => ({ ...prev, degree: item }));
        break;
      case 'field':
        setFormData(prev => ({ ...prev, fieldOfStudy: item }));
        break;
    }
    setModalStep('form');
    setSearchQuery("");
    setSearchResults([]);
  };

  // Date picker functions
  const openDatePicker = (type: 'start' | 'end') => {
    setDatePickerType(type);
    setSelectedDate(type === 'start' ? 
      (formData.startDate ? new Date(formData.startDate) : new Date()) :
      (formData.endDate ? new Date(formData.endDate) : new Date())
    );
    setIsDatePickerVisible(true);
  };

  const handleDateConfirm = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setFormData(prev => ({
      ...prev,
      [datePickerType === 'start' ? 'startDate' : 'endDate']: formattedDate
    }));
    setIsDatePickerVisible(false);
  };

  // Save education
  const saveEducation = async () => {
    if (!formData.school.name || !formData.degree || !formData.fieldOfStudy) {
      return;
    }

    setIsLoading(true);
    try {
      const educationData = {
        school: JSON.stringify(formData.school),
        degree: formData.degree,
        field_of_study: formData.fieldOfStudy,
        start_date: formData.startDate,
        end_date: formData.endDate,
        grade: formData.grade,
        activities: formData.activities,
        societies: formData.societies,
      };

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/education`,
        {
          ...educationData,
          user_email: userEmail,
        }
      );

      if (response.status === 200) {
        // Refresh education data
        const updatedEducation = [...education, response.data.data];
        setEducation(updatedEducation);
        setIsModalVisible(false);
        clearForm();
      }
    } catch (error) {
      console.error("Error saving education:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete education
  const deleteEducation = async (index: number) => {
    try {
      const educationToDelete = education[index];
      await axios.delete(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/education/${educationToDelete.id}`
      );
      
      const updatedEducation = education.filter((_, i) => i !== index);
      setEducation(updatedEducation);
      setShowDeleteAlert(false);
    } catch (error) {
      console.error("Error deleting education:", error);
    }
  };

  // Render search results
  const renderSearchResults = () => (
    <FlatList
      data={searchResults}
      keyExtractor={(item, index) => `${item.name || item}-${index}`}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.searchResultItem}
          onPress={() => handleSelection(item)}
        >
          <Text style={[styles.searchResultText, { color: colors.onBackground }]}>
            {item.name || item}
          </Text>
          {item.country && (
            <Text style={[styles.searchResultSubtext, { color: colors.onSurfaceVariant }]}>
              {item.country}
            </Text>
          )}
        </TouchableOpacity>
      )}
      style={styles.searchResultsList}
      showsVerticalScrollIndicator={false}
    />
  );

  // Render form step
  const renderFormStep = () => (
    <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
      {/* School Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
          School *
        </Text>
        <TouchableOpacity
          style={[styles.inputField, { borderColor: colors.outline }]}
          onPress={() => {
            setModalStep('school');
            setSearchResults([]);
            searchSchools("");
          }}
        >
          <Text style={[
            styles.inputText,
            { color: formData.school.name ? colors.onBackground : colors.onSurfaceVariant }
          ]}>
            {formData.school.name || "Select school"}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Degree Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
          Degree *
        </Text>
        <TouchableOpacity
          style={[styles.inputField, { borderColor: colors.outline }]}
          onPress={() => {
            setModalStep('degree');
            setSearchResults(defaultDegrees);
            setSearchQuery("");
          }}
        >
          <Text style={[
            styles.inputText,
            { color: formData.degree ? colors.onBackground : colors.onSurfaceVariant }
          ]}>
            {formData.degree || "Select degree"}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Field of Study Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
          Field of Study *
        </Text>
        <TouchableOpacity
          style={[styles.inputField, { borderColor: colors.outline }]}
          onPress={() => {
            setModalStep('field');
            setSearchResults(defaultFields);
            setSearchQuery("");
          }}
        >
          <Text style={[
            styles.inputText,
            { color: formData.fieldOfStudy ? colors.onBackground : colors.onSurfaceVariant }
          ]}>
            {formData.fieldOfStudy || "Select field of study"}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Start Date */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
          Start Date
        </Text>
        <TouchableOpacity
          style={[styles.inputField, { borderColor: colors.outline }]}
          onPress={() => openDatePicker('start')}
        >
          <Text style={[
            styles.inputText,
            { color: formData.startDate ? colors.onBackground : colors.onSurfaceVariant }
          ]}>
            {formData.startDate || "Select start date"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* End Date */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
          End Date
        </Text>
        <TouchableOpacity
          style={[styles.inputField, { borderColor: colors.outline }]}
          onPress={() => openDatePicker('end')}
        >
          <Text style={[
            styles.inputText,
            { color: formData.endDate ? colors.onBackground : colors.onSurfaceVariant }
          ]}>
            {formData.endDate || "Select end date"}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Grade */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
          Grade
        </Text>
        <TextInput
          style={[styles.textInput, { 
            borderColor: colors.outline,
            color: colors.onBackground,
            backgroundColor: colors.surface
          }]}
          value={formData.grade}
          onChangeText={(text) => setFormData(prev => ({ ...prev, grade: text }))}
          placeholder="Enter your grade"
          placeholderTextColor={colors.onSurfaceVariant}
        />
      </View>

      {/* Activities */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
          Activities
        </Text>
        <TextInput
          style={[styles.textArea, { 
            borderColor: colors.outline,
            color: colors.onBackground,
            backgroundColor: colors.surface
          }]}
          value={formData.activities}
          onChangeText={(text) => setFormData(prev => ({ ...prev, activities: text }))}
          placeholder="Describe your activities"
          placeholderTextColor={colors.onSurfaceVariant}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Societies */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.onBackground }]}>
          Societies
        </Text>
        <TextInput
          style={[styles.textArea, { 
            borderColor: colors.outline,
            color: colors.onBackground,
            backgroundColor: colors.surface
          }]}
          value={formData.societies}
          onChangeText={(text) => setFormData(prev => ({ ...prev, societies: text }))}
          placeholder="List societies or clubs"
          placeholderTextColor={colors.onSurfaceVariant}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: Colors.PRIMARY }]}
        onPress={saveEducation}
        disabled={isLoading || !formData.school.name || !formData.degree || !formData.fieldOfStudy}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Save Education</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // Render search step
  const renderSearchStep = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchHeader}>
        <TextInput
          style={[styles.searchInput, { 
            borderColor: colors.outline,
            color: colors.onBackground,
            backgroundColor: colors.surface
          }]}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={`Search ${modalStep}...`}
          placeholderTextColor={colors.onSurfaceVariant}
          autoFocus
        />
        {isSearching && <ActivityIndicator size="small" color={Colors.PRIMARY} />}
      </View>
      {renderSearchResults()}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.onBackground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>
          Education
        </Text>
        <TouchableOpacity onPress={openAddModal}>
          <Ionicons name="add" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {education.map((edu, index) => (
          <View key={index} style={[styles.educationCard, { backgroundColor: colors.surface }]}>
            <View style={styles.educationHeader}>
              <Text style={[styles.schoolName, { color: colors.onBackground }]}>
                {typeof edu.school === 'string' ? JSON.parse(edu.school).name : edu.school?.name}
              </Text>
              <TouchableOpacity onPress={() => openEditModal(edu, index)}>
                <Ionicons name="pencil" size={20} color={Colors.PRIMARY} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.degreeText, { color: colors.onSurfaceVariant }]}>
              {edu.degree} in {edu.field_of_study}
            </Text>
            {(edu.start_date || edu.end_date) && (
              <Text style={[styles.dateText, { color: colors.onSurfaceVariant }]}>
                {edu.start_date && format(new Date(edu.start_date), 'MMM yyyy')}
                {edu.start_date && edu.end_date && ' - '}
                {edu.end_date && format(new Date(edu.end_date), 'MMM yyyy')}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Single Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setIsModalVisible(false);
          clearForm();
        }}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                if (modalStep === 'form') {
                  setIsModalVisible(false);
                  clearForm();
                } else {
                  setModalStep('form');
                }
              }}
            >
              <Ionicons 
                name={modalStep === 'form' ? "close" : "arrow-back"} 
                size={24} 
                color={colors.onBackground} 
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.onBackground }]}>
              {modalStep === 'form' ? 'Add Education' : `Select ${modalStep}`}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {modalStep === 'form' ? renderFormStep() : renderSearchStep()}
        </SafeAreaView>
      </Modal>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={selectedDate || new Date()}
        onConfirm={handleDateConfirm}
        onCancel={() => setIsDatePickerVisible(false)}
      />

      {/* Delete Alert */}
      <CampuslyAlert
        isVisible={showDeleteAlert}
        title="Delete Education"
        message="Are you sure you want to delete this education entry?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteIndex !== null && deleteEducation(deleteIndex)}
        onCancel={() => setShowDeleteAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  educationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  schoolName: {
    fontSize: RFValue(16),
    fontWeight: '600',
    flex: 1,
  },
  degreeText: {
    fontSize: RFValue(14),
    marginBottom: 4,
  },
  dateText: {
    fontSize: RFValue(12),
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: RFValue(18),
    fontWeight: '600',
  },
  modalScrollView: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: RFValue(14),
    fontWeight: '500',
    marginBottom: 8,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  inputText: {
    fontSize: RFValue(14),
    flex: 1,
  },
  textInput: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: RFValue(14),
  },
  textArea: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: RFValue(14),
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: RFValue(16),
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    padding: 16,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: RFValue(14),
    marginRight: 12,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchResultText: {
    fontSize: RFValue(14),
    fontWeight: '500',
  },
  searchResultSubtext: {
    fontSize: RFValue(12),
    marginTop: 2,
  },
});


