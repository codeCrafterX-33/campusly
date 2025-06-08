import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const usePersistedState = (key: string, initialValue: any, ttl: number) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);

          // Check if timestamp and value exist
          if (parsed?.timestamp && parsed?.value !== undefined) {
            const now = Date.now();

            // If not expired, use the cached value
            if (now - parsed.timestamp < ttl) {
              setState(parsed.value);
              return;
            }
          }

          // Expired or invalid → clear and set initial
          await AsyncStorage.removeItem(key);
          await AsyncStorage.setItem(
            key,
            JSON.stringify({ value: initialValue, timestamp: Date.now() })
          );
        } else {
          // No value stored yet
          await AsyncStorage.setItem(
            key,
            JSON.stringify({ value: initialValue, timestamp: Date.now() })
          );
        }
      } catch (e) {
        console.error("AsyncStorage load error:", e);
      }
    };

    loadStoredValue();
  }, []);

  useEffect(() => {
    const syncStateWithStorage = async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        const currentData = JSON.stringify({
          value: state,
          timestamp: Date.now(),
        });

        if (!stored || stored !== currentData) {
          await AsyncStorage.setItem(key, currentData);
        }
      } catch (e) {
        console.error("AsyncStorage save error:", e);
      }
    };

    if (state !== initialValue) {
      syncStateWithStorage();
    }
  }, [state]);

  return [state, setState];
};

export default usePersistedState;
