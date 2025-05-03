import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const usePersistedState = (key: string, initialValue: any) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const loadStoredValue = async () => {
      const storedValue = await AsyncStorage.getItem(key);
      if (storedValue) {
        // If stored value exists, set it to state
        setState(JSON.parse(storedValue));
      } else {
        // If no value exists, set it with the initial value and store it
        await AsyncStorage.setItem(key, JSON.stringify(initialValue));
      }
    };

    loadStoredValue();
  }, []); // Run once on mount

  useEffect(() => {
    const syncStateWithStorage = async () => {
      const storedValue = await AsyncStorage.getItem(key);

      // Only update AsyncStorage if state is different from what's stored
      if (storedValue !== JSON.stringify(state)) {
        await AsyncStorage.setItem(key, JSON.stringify(state));
      }
    };

    if (state !== initialValue) {
      syncStateWithStorage();
    }
  }, [state]); // Run when state changes

  return [state, setState];
};

export default usePersistedState;
