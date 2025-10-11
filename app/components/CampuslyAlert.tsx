import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../constants/Colors";

export default function CampuslyAlert({
  isVisible,
  type,
  onClose,
  messages,
  onPress,
  onPress2,
  buttonText,
  buttonText2,
  overrideDefault,
  isLoading,
  loadingText,
}: {
  isVisible: boolean;
  type: string;
  onClose: () => void;
  messages: {
    success: {
      title: string;
      message: string;
      icon: string;
    };
    error: {
      title: string;
      message: string;
      icon: string;
    };
  };
  onPress?: () => void;
  onPress2?: () => void;
  buttonText?: string;
  buttonText2?: string;
  overrideDefault?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}) {
  const isSuccess = type === "success";

  // Fun loading texts for different scenarios
  const getLoadingText = () => {
    if (loadingText) return loadingText;

    const funLoadingTexts = [
      "Hold on tight! 🚀",
      "Magic in progress ✨",
      "Almost there! 🎯",
      "Working my magic 🪄",
      "Just a sec! ⚡",
      "Processing... 🎪",
      "Loading awesome! 🌟",
      "Getting it done! 💪",
      "Almost ready! 🎉",
      "Preparing greatness! 🏆",
    ];

    return funLoadingTexts[Math.floor(Math.random() * funLoadingTexts.length)];
  };

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[styles.container, isSuccess ? styles.success : styles.error]}
        >
          <Text style={styles.icon}>
            {isSuccess ? messages.success.icon : messages.error.icon}
          </Text>
          <Text style={styles.title}>
            {isSuccess ? messages.success.title : messages.error.title}
          </Text>
          <Text style={styles.message}>
            {isSuccess ? messages.success.message : messages.error.message}
          </Text>

          <View style={overrideDefault && styles.overridecontainer}>
            <TouchableOpacity
              style={[
                isSuccess ? styles.button : styles.buttonError,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={
                isLoading
                  ? undefined
                  : onPress && buttonText === "Continue"
                  ? onPress
                  : overrideDefault && buttonText
                  ? onPress
                  : onClose
              }
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading
                  ? getLoadingText()
                  : isSuccess
                  ? buttonText
                  : overrideDefault && buttonText
                  ? buttonText
                  : "Try again"}
              </Text>
            </TouchableOpacity>

            {buttonText2 && !isLoading && (
              <TouchableOpacity
                style={styles.button}
                onPress={onPress2 && buttonText2 ? onPress2 : onClose}
              >
                <Text style={styles.buttonText}>{buttonText2}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  overridecontainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },

  success: {
    borderLeftWidth: 6,
    borderLeftColor: Colors.PRIMARY, // Campusly green
  },
  error: {
    borderLeftWidth: 6,
    borderLeftColor: "#EF4444", // Red
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonError: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  buttonTextError: {
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
