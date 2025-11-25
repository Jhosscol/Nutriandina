// Configuración de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase (obtener de Firebase Console)
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

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'southamerica-east1'); // Región São Paulo

// Configurar persistencia para React Native
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getReactNativePersistence,
    initializeAuth
} from 'firebase/auth';

// Reemplazar auth con persistencia
export const authWithPersistence = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;