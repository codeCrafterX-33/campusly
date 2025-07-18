import Toast from "react-native-toast-message";

const eventRegisterMessages = [
  "🎉 You’re in! Let’s make this event unforgettable.",
  "🔥 Registered! Can’t wait to see you there.",
  "💃 You just made the guest list!",
  "📅 Saved your spot — now don’t ghost us!",
  "✅ Locked and loaded. See you at the event!",
];

const eventunRegisterMessages = [
  "😢 You dipped... hope we see you next time!",
  "🚪 Left the party early? We’ll keep a seat warm.",
  "👀 Gone already? Don’t be a stranger!",
  "📭 You’ve unregistered. But hey, the door’s always open.",
  "🥲 You bounced. Respectfully.",
];

export const showEventToast = (type = "register") => {
  const messages =
    type === "register" ? eventRegisterMessages : eventunRegisterMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  if (type === "register" || type === "unregister") {
    Toast.show({
      type: "success",
      text1: randomMessage,
      visibilityTime: 3000,
      position: "bottom",
    });
  } else if (type === "registerError" || type === "unregisterError") {
    const errorMessages = {
      registerError: "😵 Event Registration failed!",
      unregisterError: "🧱 The leave button hit a wall.",
    };
    Toast.show({
      text1:
        type === "registerError"
          ? errorMessages.registerError
          : errorMessages.unregisterError,
      visibilityTime: 3000,
      type: "error",
      position: "bottom",
      text2: "Please try again later.",
    });
  }
};
