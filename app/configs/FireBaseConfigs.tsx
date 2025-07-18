// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//@ts-ignore
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4AlQNksrW4UT0qokXJpdmuc7CukyP0ZU",
  authDomain: "project-2025-9466f.firebaseapp.com",
  projectId: "project-2025-9466f",
  storageBucket: "project-2025-9466f.firebasestorage.app",
  messagingSenderId: "48815603803",
  appId: "1:48815603803:web:fcf85700e972392343bf7e",
  measurementId: "G-D363JCQB0Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
// const analytics = getAnalytics(app);
