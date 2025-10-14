import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Colors from "../../constants/Colors";
import axios from "axios";
import CampuslyAlert from "../../components/CampuslyAlert";
import { AuthContext } from "../../context/AuthContext";

const OTP_LENGTH = 6;

const OTPVerificationScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { userData, getUser } = useContext(AuthContext);

  const { email } = route.params; // Or phone, whatever you sent OTP to
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [activeInput, setActiveInput] = useState(0);
  const [resendTimer, setResendTimer] = useState(60);
  const [isFocusedIndex, setIsFocusedIndex] = useState<number | null>(null);
  const inputsRef = useRef<TextInput[]>([]);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState("Verify");
  const [onPress, setOnPress] = useState<() => void>(() => {});

  const messages = {
    success: {
      icon: "🏅",
      title: "You're Verified! 🎉",
      message:
        "Your school email is on point! You’ve earned your Campusly badge and unlocked full access. Time to explore, connect, and shine! 🔑",
    },
    error: {
      icon: "🤔",
      title: "Hmm... Something’s Wrong",
      message:
        "That OTP doesn’t match. Are you sure you entered the correct OTP? Try again, smarty! 🎓",
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
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1); // ensure single character
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const code = otp.join("");

    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/otp/verify-otp`,
        { SchoolEmail: email, UserEmail: userData?.email, OTP: code }
      );

      console.log("✅ Success:", response.data);

      // Refetch user data to get updated verification status
      getUser();

      setAlertMessage({ ...alertMessage, success: { ...messages.success } });
      setIsAlertVisible(true);
      setAlertType("success");
      setOnPress(() => () => navigation.replace("DrawerNavigator"));
    } catch (err: any) {
      // Here’s where your backend messages come through
      if (err.response) {
        console.log("❌ Backend said:", err.response.data);

        if (err.response.data.message === "Too many failed attempts") {
          setAlertMessage({
            ...alertMessage,
            error: {
              ...messages.error,
              message: "Too many failed attempts. Please try again later.",
            },
          });
        } else if (err.response.data.message === "OTP expired") {
          setResendTimer(60);
          setAlertMessage({
            ...alertMessage,
            error: {
              ...messages.error,
              message: "OTP expired. Please resend the OTP.",
            },
          });
        } else if (err.response.data.message === "Invalid OTP") {
          setAlertMessage({
            ...alertMessage,
            error: {
              ...messages.error,
              message: "Invalid OTP. Please try again.",
            },
          });
        }

        setIsAlertVisible(true);
        setAlertType("error");
      } else {
        console.error("⚠️ Unexpected error:", err);
      }
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    if (resendTimer > 0) return;
    // call backend to resend OTP
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/otp/send-otp`,
      { SchoolEmail: email }
    );
    if (response.status === 200) {
      setResendTimer(60);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the 6-digit code</Text>
      <Text style={styles.subtitle}>Sent to {email}</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref: any) => (inputsRef.current[index] = ref)}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={[
              styles.otpInput,
              isFocusedIndex === index && { borderColor: Colors.PRIMARY },
            ]}
            onFocus={() => setIsFocusedIndex(index)}
            onBlur={() => setIsFocusedIndex(null)}
          />
        ))}
      </View>
      <TouchableOpacity
        onPress={handleSubmit}
        style={[
          styles.submitButton,
          otp.some((d) => !d) && styles.disabledButton,
        ]}
        disabled={otp.some((d) => !d)}
      >
        <Text style={styles.submitText}>
          {loading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
        <Text style={[styles.resendText, resendTimer > 0 && { opacity: 0.5 }]}>
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
        </Text>
      </TouchableOpacity>
      <CampuslyAlert
        isVisible={isAlertVisible}
        type={alertType}
        onClose={() => setIsAlertVisible(false)}
        messages={alertMessage}
        buttonText={alertType === "success" ? "Continue" : "Try again"}
        onPress={alertType === "success" ? onPress : () => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  otpInput: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    width: 40,
    height: 50,
    textAlign: "center",
    fontSize: 20,
    borderRadius: 6,
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 6,
  },
  disabledButton: { backgroundColor: Colors.PRIMARY + "80" },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  resendText: { marginTop: 20, color: Colors.PRIMARY },
});

export default OTPVerificationScreen;
