import { useCallback } from "react";
import { ViewToken } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { usePreloaderContext } from "../context/PreloaderContext";

export const useViewableItemsPreloader = () => {
  const { preloadUserData, userData } = useContext(AuthContext);
  const { preloadedItems } = usePreloaderContext();

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      console.log(
        "Viewable items changed:",
        viewableItems.length,
        "items visible"
      );
      viewableItems.forEach((item) => {
        if (item.item?.user_id && item.item.user_id !== userData?.id) {
          const userId = item.item.user_id;

          // Only preload if not already preloaded
          if (!preloadedItems.current.has(userId)) {
            preloadedItems.current.add(userId);
            console.log("Adding visible user to preload queue:", userId);

            // LinkedIn-style: Immediate preload for visible users
            preloadUserData(userId, "high"); // High priority for visible items
          } else {
            console.log("User already preloaded, skipping:", userId);
          }
        }
      });
    },
    [preloadUserData, userData?.id]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 30, // Item is considered visible when 30% is shown (more aggressive)
    minimumViewTime: 50, // Minimum time item must be visible (ms) - faster detection
  };

  return {
    onViewableItemsChanged,
    viewabilityConfig,
  };
};
