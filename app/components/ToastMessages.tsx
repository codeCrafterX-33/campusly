import Toast from "react-native-toast-message";

const eventRegisterMessages = [
  "🎉 You're in! Let's make this event unforgettable.",
  "🔥 Registered! Can't wait to see you there.",
  "💃 You just made the guest list!",
  "📅 Saved your spot — now don't ghost us!",
  "✅ Locked and loaded. See you at the event!",
];

const eventunRegisterMessages = [
  "😢 You dipped... hope we see you next time!",
  "🚪 Left the party early? We'll keep a seat warm.",
  "👀 Gone already? Don't be a stranger!",
  "📭 You've unregistered. But hey, the door's always open.",
  "🥲 You bounced. Respectfully.",
];

const eventDeleteMessages = [
  "🗑️ Event deleted! It's gone for good.",
  "💨 Poof! Event vanished into thin air.",
  "👋 Event has left the building!",
  "🎭 Curtains closed on that event.",
  "🚮 Event successfully trashed!",
];

export const showEventToast = (type = "register") => {
  const messages =
    type === "register"
      ? eventRegisterMessages
      : type === "unregister"
      ? eventunRegisterMessages
      : type === "deleteSuccess"
      ? eventDeleteMessages
      : eventRegisterMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  if (
    type === "register" ||
    type === "unregister" ||
    type === "deleteSuccess"
  ) {
    Toast.show({
      type: "success",
      text1: randomMessage,
      visibilityTime: 3000,
      position: "bottom",
    });
  } else if (
    type === "registerError" ||
    type === "unregisterError" ||
    type === "deleteError"
  ) {
    const errorMessages = {
      registerError: "😵 Event Registration failed!",
      unregisterError: "🧱 The leave button hit a wall.",
      deleteError: "💥 Failed to delete event!",
    };
    Toast.show({
      text1: errorMessages[type] || "Something went wrong!",
      visibilityTime: 3000,
      type: "error",
      position: "bottom",
      text2: "Please try again later.",
    });
  }
};
