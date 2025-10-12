import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Image,
  Dimensions,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../configs/FireBaseConfigs";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import axios from "axios";
import Colors from "../../constants/Colors";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { options } from "../../configs/CloudinaryConfig";
import { uploadToCloudinary } from "../../util/uploadToCloudinary";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [profileCreated, setProfileCreated] = useState(false);
  const { setUserData } = useContext(AuthContext);

  // Animation for hourglass
  const hourglassRotation = useSharedValue(0);

  useEffect(() => {
    // Only start animation when we're in step 6 and profile is not created yet
    if (currentStep === 6 && !profileCreated) {
      hourglassRotation.value = withRepeat(
        withTiming(360, { duration: 2000 }),
        -1,
        false
      );
    } else {
      // Stop animation when not needed
      hourglassRotation.value = 0;
    }
  }, [currentStep, profileCreated]);

  const animatedHourglassStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${hourglassRotation.value}deg` }],
    };
  });

  const steps = [
    { id: 1, title: "Personal Info", subtitle: "Let's get to know you! 🎓" },
    { id: 2, title: "Email", subtitle: "Your campus connection 📧" },
    { id: 3, title: "Username", subtitle: "Pick your unique handle 🎯" },
    { id: 4, title: "Password", subtitle: "Keep it secret, keep it safe 🔐" },
    { id: 5, title: "Profile Photo", subtitle: "Show your campus style 📸" },
  ];

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim())
          newErrors.firstName =
            "Oops! We need your first name to get started! 😊";
        if (!formData.lastName.trim())
          newErrors.lastName = "Don't forget your last name! 📝";
        break;
      case 2:
        if (!formData.email.trim()) newErrors.email = "Email is required! 📧";
        else if (!formData.email.includes("@"))
          newErrors.email = "That doesn't look like a valid email! 🤔";
        break;
      case 3:
        if (!formData.username.trim())
          newErrors.username = "Username is required! 🎯";
        else if (formData.username.length < 3)
          newErrors.username = "Username must be at least 3 characters! 📏";
        else if (usernameAvailable === false)
          newErrors.username =
            "Oops! This username is already taken! Try typing a different one or pick from our awesome suggestions below! 🎯";
        break;
      case 4:
        if (!formData.password) newErrors.password = "Password is required! 🔐";
        else if (formData.password.length < 6)
          newErrors.password = "Password needs to be at least 6 characters! 💪";
        if (!formData.confirmPassword)
          newErrors.confirmPassword = "Please confirm your password! 🔄";
        else if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "Passwords don't match! Try again! 🔍";
        break;
      case 5:
        if (!formData.profileImage)
          newErrors.profileImage = "Don't forget your profile pic! 📸";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
        // If moving to step 6, start the profile creation process
        if (currentStep === 5) {
          // Move to step 6 first, then start profile creation
          setTimeout(() => {
            handleSignUp();
          }, 100);
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
      // Clear username error when input is too short
      setErrors((prev) => ({ ...prev, username: "" }));
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/user/check-username/${username}`
      );

      setUsernameAvailable(response.data.available);
      setUsernameSuggestions(response.data.suggestions || []);

      // Clear username error when username becomes available
      if (response.data.available) {
        setErrors((prev) => ({ ...prev, username: "" }));
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, profileImage: result.assets[0].uri });
      console.log(formData.profileImage);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    console.log(formData);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;

      // Create user with Firebase Auth
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Upload image and get URL
      const imageUrl = await uploadToCloudinary(
        formData.profileImage,
        "image",
        "profile-images"
      );

      // Send user data to backend
      console.log("Sending user data to backend:", {
        name: fullName,
        email: formData.email,
        username: formData.username,
        image: imageUrl,
      });

      const result = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/user`,
        {
          name: fullName,
          email: formData.email,
          username: formData.username,
          image: imageUrl,
        }
      );

      console.log("Backend response:", result.status, result.data);

      if (result.status === 201) {
        console.log("User created successfully, fetching user data...");
        const userData = await axios.get(
          `${process.env.EXPO_PUBLIC_SERVER_URL}/user/${formData.email}`
        );
        console.log("User data fetched:", userData.data);
        setUserData(userData.data.data[0]);
        setProfileCreated(true);
      }
    } catch (error: any) {
      console.error("Sign up error:", error);

      if (error.code === "auth/email-already-in-use") {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Email already in use, please sign in",
        });
      } else if (error.response?.status === 500) {
        const errorMessage =
          error.response?.data?.error || "Unknown server error";
        console.error("Server error details:", error.response?.data);
        Toast.show({
          type: "error",
          text1: "Server Error",
          text2: `Server error: ${errorMessage}`,
        });
      } else if (error.response?.status === 400) {
        Toast.show({
          type: "error",
          text1: "Invalid Data",
          text2: "Please check your information and try again.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Something went wrong",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View
            entering={SlideInRight.duration(500)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>
              Hey there, future campus star! 🌟
            </Text>
            <Text style={styles.stepSubtitle}>
              What should we call you? Your name will help other students
              connect with you!
            </Text>

            <View style={styles.nameContainer}>
              <View style={styles.nameInputContainer}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  placeholder="Your awesome first name"
                  value={formData.firstName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, firstName: text })
                  }
                  placeholderTextColor="#9CA3AF"
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={styles.nameInputContainer}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  placeholder="Your legendary last name"
                  value={formData.lastName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, lastName: text })
                  }
                  placeholderTextColor="#9CA3AF"
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            entering={SlideInRight.duration(500)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>
              Ready to join the campus crew? 📧
            </Text>
            <Text style={styles.stepSubtitle}>
              Drop your email so we can keep you in the loop about all the epic
              campus events!
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="your.email@university.edu"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View
            entering={SlideInRight.duration(500)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Choose your unique handle! 🎯</Text>
            <Text style={styles.stepSubtitle}>
              Pick a username that represents you on campus! Make it memorable
              and fun!
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.usernameContainer}>
                <TextInput
                  style={[
                    styles.usernameInput,
                    errors.username && styles.inputError,
                    usernameAvailable === true && styles.usernameAvailable,
                    usernameAvailable === false && styles.usernameTaken,
                  ]}
                  placeholder="Choose your unique username"
                  value={formData.username}
                  onChangeText={(text) => {
                    const cleanUsername = text.replace(/[^a-zA-Z0-9_]/g, "");
                    setFormData({ ...formData, username: cleanUsername });

                    // Clear error immediately when user starts typing
                    if (errors.username) {
                      setErrors((prev) => ({ ...prev, username: "" }));
                    }

                    // Reset availability state when user changes input
                    setUsernameAvailable(null);
                    setUsernameSuggestions([]);

                    // Debounce the API call
                    setTimeout(() => {
                      if (cleanUsername.length >= 3) {
                        checkUsernameAvailability(cleanUsername.toLowerCase());
                      }
                    }, 500);
                  }}
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
                {isCheckingUsername && (
                  <View style={styles.checkingIndicator}>
                    <Text style={styles.checkingText}>🔍</Text>
                  </View>
                )}
                {usernameAvailable === true && (
                  <View style={styles.availabilityIndicator}>
                    <Text style={styles.availableText}>✅</Text>
                  </View>
                )}
                {usernameAvailable === false && (
                  <View style={styles.availabilityIndicator}>
                    <Text style={styles.takenText}>❌</Text>
                  </View>
                )}
              </View>
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
              {usernameAvailable === true && (
                <Text style={styles.successText}>
                  Great choice! This username is available on Campusly! 🎉
                </Text>
              )}
              {usernameAvailable === false && (
                <View style={styles.takenContainer}>
                  <Text style={styles.takenMessage}>
                    🚫 Oops! That username's already taken.
                  </Text>
                  <Text style={styles.takenSubtext}>
                    No stress — try another or tap one of the cool options below
                    😎
                  </Text>
                </View>
              )}
              {usernameSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>
                    {usernameAvailable === false
                      ? "🎯 Handpicked alternatives just for you:"
                      : "💡 Or try these cool suggestions:"}
                  </Text>
                  {usernameSuggestions.map((suggestion, index) => (
                    <Pressable
                      key={index}
                      style={styles.suggestionButton}
                      onPress={() => {
                        setFormData({ ...formData, username: suggestion });
                        checkUsernameAvailability(suggestion);
                      }}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View
            entering={SlideInRight.duration(500)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>
              Time to lock down your account! 🔐
            </Text>
            <Text style={styles.stepSubtitle}>
              Create a password that's as strong as your study game 💪
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.passwordInputContainer,
                  errors.password && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Make it memorable but secure!"
                  value={formData.password}
                  onChangeText={(text) =>
                    setFormData({ ...formData, password: text })
                  }
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9CA3AF"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </Pressable>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.passwordInputContainer,
                  errors.confirmPassword && styles.inputError,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Double-check that password!"
                  value={formData.confirmPassword}
                  onChangeText={(text) =>
                    setFormData({ ...formData, confirmPassword: text })
                  }
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#9CA3AF"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeButtonText}>
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </Text>
                </Pressable>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View
            entering={SlideInRight.duration(500)}
            style={styles.stepContainer}
          >
            <Text style={styles.stepTitle}>Show off your campus vibe! 📸</Text>
            <Text style={styles.stepSubtitle}>
              Let other students see the awesome person behind the profile!
            </Text>

            <View style={styles.imageContainer}>
              {formData.profileImage ? (
                <Image
                  source={{ uri: formData.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>📷</Text>
                </View>
              )}

              <Pressable style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.imageButtonText}>
                  {formData.profileImage
                    ? "Switch it up! 🔄"
                    : "Pick your best shot! 📷"}
                </Text>
              </Pressable>

              {errors.profileImage && (
                <Text style={styles.errorText}>{errors.profileImage}</Text>
              )}
            </View>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View
            entering={FadeIn.duration(1000)}
            style={styles.stepContainer}
          >
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>
                {profileCreated
                  ? "Welcome to Campusly!"
                  : "Creating your profile..."}
              </Text>
              <Text style={styles.successSubtitle}>
                {profileCreated
                  ? "Your campus adventure is about to begin! Get ready to connect with students, discover events, and make memories that last a lifetime! 😊"
                  : "Just a moment while we set up your awesome campus profile..."}
              </Text>

              {profileCreated && (
                <Animated.View
                  entering={FadeInUp.duration(800).delay(500)}
                  style={styles.successButtonContainer}
                >
                  <Pressable
                    style={styles.successButton}
                    onPress={() => {
                      // Set authenticated state and navigate to main app
                      navigation.navigate("Landing");
                    }}
                  >
                    <LinearGradient
                      colors={["#2A9D8F", "#4ECDC4"]}
                      style={styles.successButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.successButtonText}>
                        Take me to Campusly! 🎓
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  <View style={styles.verificationContainer}>
                    <Text style={styles.verificationTitle}>
                      🎓 Want to unlock all Campusly features?
                    </Text>
                    <Text style={styles.verificationSubtitle}>
                      Verify your student status to enjoy the full benefits of
                      Campusly!
                    </Text>
                    <Pressable
                      style={styles.verificationButton}
                      onPress={() => {
                        // Navigate to student verification modal
                        navigation.navigate("VerificationScreen");
                      }}
                    >
                      <LinearGradient
                        colors={["#4ECDC4", "#2A9D8F"]}
                        style={styles.verificationButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.verificationButtonText}>
                          Verify Student Status 🎓
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </Animated.View>
              )}

              {!profileCreated && (
                <Animated.View
                  entering={FadeIn.duration(500)}
                  style={styles.loadingContainer}
                >
                  <Animated.Text
                    style={[styles.loadingText, animatedHourglassStyle]}
                  >
                    ⏳
                  </Animated.Text>
                  <Text style={styles.loadingMessage}>
                    Setting up your campus profile...
                  </Text>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#2A9D8F", "#FFFFFF", "#2A9D8F"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              {/* Progress Indicator - Hide on step 6 (success screen) */}
              {currentStep !== 6 && (
                <Animated.View
                  entering={FadeInDown.duration(800)}
                  style={styles.progressContainer}
                >
                  <View style={styles.progressBar}>
                    {steps.map((step, index) => (
                      <View
                        key={step.id}
                        style={[
                          styles.progressDot,
                          currentStep >= step.id && styles.progressDotActive,
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.progressText}>
                    Step {currentStep} of {steps.length}
                  </Text>
                </Animated.View>
              )}

              {/* Step Content */}
              {renderStepContent()}

              {/* Navigation Buttons - Hide on step 6 (success screen) */}
              {currentStep !== 6 && (
                <Animated.View
                  entering={FadeInUp.duration(800).delay(400)}
                  style={styles.buttonContainer}
                >
                  <View style={styles.buttonRow}>
                    {currentStep > 1 && (
                      <Pressable style={styles.backButton} onPress={prevStep}>
                        <Text style={styles.backButtonText}>Back</Text>
                      </Pressable>
                    )}

                    <Pressable
                      style={[
                        styles.nextButton,
                        currentStep === 1 && styles.nextButtonFull,
                      ]}
                      onPress={nextStep}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={["#2A9D8F", "#4ECDC4"]}
                        style={styles.nextButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.nextButtonText}>
                          {isLoading
                            ? "Creating your campus profile... 🚀"
                            : currentStep === 5
                            ? "Create Profile! 🎉"
                            : "Next step! ➡️"}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.signInLink}
                    onPress={() => navigation.navigate("SignIn")}
                  >
                    <Text style={styles.signInText}>
                      Already part of the campus crew? Sign in here! 👋
                    </Text>
                  </Pressable>
                </Animated.View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  progressBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(42, 157, 143, 0.3)",
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: "white",
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 14,
    color: "#2A9D8F",
    fontWeight: "600",
  },
  stepContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2A9D8F",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 18,
    color: "#4A5568",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 26,
  },
  nameContainer: {
    flexDirection: "column",
    gap: 16,
  },
  nameInputContainer: {
    marginBottom: 0,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2A9D8F",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "rgba(42, 157, 143, 0.2)",
    color: "#1F2937",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(42, 157, 143, 0.2)",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeButtonText: {
    fontSize: 20,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(42, 157, 143, 0.2)",
  },
  usernameInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  usernameAvailable: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  usernameTaken: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  checkingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  checkingText: {
    fontSize: 16,
  },
  availabilityIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  availableText: {
    fontSize: 16,
  },
  takenText: {
    fontSize: 16,
  },
  successText: {
    color: "#10B981",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
  takenContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  takenMessage: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  takenSubtext: {
    color: "#EF4444",
    fontSize: 12,
    opacity: 0.8,
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2A9D8F",
    marginBottom: 8,
  },
  suggestionButton: {
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(42, 157, 143, 0.2)",
  },
  suggestionText: {
    color: "#2A9D8F",
    fontSize: 14,
    fontWeight: "500",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 20,
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2A9D8F",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 18,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
  },
  successButtonContainer: {
    width: "100%",
    alignItems: "center",
  },
  successButton: {
    width: "100%",
    borderRadius: 25,
    shadowColor: "#2A9D8F",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 40,
  },
  loadingMessage: {
    fontSize: 16,
    color: "#4A5568",
    marginTop: 12,
    textAlign: "center",
  },
  verificationContainer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: "rgba(42, 157, 143, 0.05)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(42, 157, 143, 0.2)",
    width: "100%",
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2A9D8F",
    textAlign: "center",
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  verificationButton: {
    borderRadius: 12,
    shadowColor: "#2A9D8F",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  verificationButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  verificationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(42, 157, 143, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(42, 157, 143, 0.3)",
    borderStyle: "dashed",
  },
  placeholderText: {
    fontSize: 48,
  },
  imageButton: {
    backgroundColor: "#2A9D8F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  imageButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#2A9D8F",
    backgroundColor: "transparent",
  },
  backButtonText: {
    color: "#2A9D8F",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
    borderRadius: 25,
    shadowColor: "#2A9D8F",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonFull: {
    marginLeft: 0,
  },
  nextButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  signInLink: {
    alignItems: "center",
    paddingVertical: 16,
  },
  signInText: {
    color: "#2A9D8F",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
