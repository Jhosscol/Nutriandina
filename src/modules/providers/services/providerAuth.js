// src/modules/providers/services/providerAuth.js
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc, // ← ASEGÚRATE QUE ESTÉ AQUÍ
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { auth, db } from '../../../config/firebase';

export const providerAuthService = {
  async register(email, password, businessName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'providers', user.uid), {
        uid: user.uid,
        email: email,
        businessName: businessName,
        userType: 'provider',
        ownerName: '',
        phone: '',
        address: {
          street: '',
          city: '',
          region: '',
          postalCode: ''
        },
        description: '',
        logo: '',
        isVerified: false,
        rating: 0,
        totalSales: 0,
        isProfileComplete: false,
        createdAt: serverTimestamp()
      });

      return { success: true, user };
    } catch (error) {
      console.error('Error en registro de proveedor:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  },

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verificar que el usuario sea proveedor
      const providerDoc = await getDoc(doc(db, 'providers', userCredential.user.uid));
      
      if (!providerDoc.exists()) {
        await signOut(auth);
        return { 
          success: false, 
          error: 'Este usuario no está registrado como proveedor' 
        };
      }

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Error en login de proveedor:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  },

  async logout() {
    try {
      await signOut(auth);
      // El listener en ProviderAuthContext detectará esto y actualizará el estado
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, error: error.message };
    }
  },

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code) 
      };
    }
  },

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este correo',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    };

    return errorMessages[errorCode] || 'Ha ocurrido un error. Intenta nuevamente';
  }
};