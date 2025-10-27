// firebaseConfig.js
import { initializeApp } from "firebase/app";
// Importe getAuth e initializeAuth
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Importe o AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyCXQyeh-0SGKBQLZ6bj6lvUCgFvgEWqbGw", // Mantenha suas credenciais seguras
  authDomain: "projetoquadrosapp.firebaseapp.com",
  projectId: "projetoquadrosapp",
  storageBucket: "projetoquadrosapp.firebasestorage.app",
  messagingSenderId: "800881797083",
  appId: "1:800881797083:web:79ad72b271b84c398429fe"
};

const app = initializeApp(firebaseConfig);

// Inicialize o Auth com persistência
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

export { auth, db }; // Exporte auth e db
