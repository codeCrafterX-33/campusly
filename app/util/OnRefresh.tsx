import { useCallback } from "react";
import { Vibration } from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";

export const OnRefresh = async ({
  setRefreshing,
  setShowCheckmark,
  getFunction,
  route,
}: {
  setRefreshing: (refreshing: boolean) => void;
  setShowCheckmark: (showCheckmark: boolean) => void;
  getFunction: () => Promise<number>;
  route: any;
}) => {
  setRefreshing(true);

  try {
    const status = await getFunction();

    if (status === 200) {
      // Trigger success vibration
      Vibration.vibrate(100);
      setTimeout(() => {
        setRefreshing(false);
        setShowCheckmark(true);
      }, 2000);
    }
  } catch (error) {
    console.log(error);
    Toast.show({
      text1: `Couldn't refresh ${route}`,
      text2: "Please check your internet or try again later.",
      type: "error",
      position: "bottom",
    });
    setRefreshing(false);
  }
};
