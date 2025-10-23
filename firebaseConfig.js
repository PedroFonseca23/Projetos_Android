import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCXQyeh-0SGKBQLZ6bj6lvUCgFvgEWqbGw",
  authDomain: "projetoquadrosapp.firebaseapp.com",
  projectId: "projetoquadrosapp",
  storageBucket: "projetoquadrosapp.firebasestorage.app",
  messagingSenderId: "800881797083",
  appId: "1:800881797083:web:79ad72b271b84c398429fe"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig); 

// Exportar os serviços que vamos usar
export const auth = getAuth(app, );
export const db = getFirestore(app);