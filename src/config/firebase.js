// src/config/firebase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD7r4anODFPuOe6nRShw3VdARi_AOZYCLs",
  authDomain: "nutriandina-cded5.firebaseapp.com",
  projectId: "nutriandina-cded5",
  storageBucket: "nutriandina-cded5.firebasestorage.app",
  messagingSenderId: "5920027802",
  appId: "1:5920027802:web:1d15eac5c1b72f44cc1b23",
  measurementId: "G-NVDFMMJ3D1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia para React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar otros servicios
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, 'southamerica-east1');

// Exportar todo
export { app, auth, db, functions, storage };
