// Servicio de autenticación con Firebase
import {
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    FacebookAuthProvider,
    GoogleAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updateEmail,
    updatePassword,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { authWithPersistence as auth, db } from '../../config/firebase';

export class FirebaseAuthService {
  
  // Registrar nuevo usuario con email y contraseña
  static async signUp(email, password, userData) {
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      
      const user = userCredential.user;
      
      // 2. Actualizar perfil con nombre
      await updateProfile(user, {
        displayName: userData.name,
      });
      
      // 3. Crear documento de usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        name: userData.name,
        createdAt: new Date().toISOString(),
        profileComplete: false,
        subscription: 'free',
        healthProfile: null,
        preferences: {
          notifications: true,
          emailUpdates: true,
          language: 'es',
        },
        stats: {
          daysActive: 0,
          recipesCompleted: 0,
          mealsLogged: 0,
          ordersCount: 0,
        },
      });
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: userData.name,
          profileComplete: false,
        },
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Iniciar sesión con email y contraseña
  static async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const user = userCredential.user;
      
      // Obtener datos adicionales del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          ...userData,
        },
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Iniciar sesión con Google
  static async signInWithGoogle(googleCredential) {
    try {
      const credential = GoogleAuthProvider.credential(googleCredential);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      // Verificar si es nuevo usuario
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Crear perfil para nuevo usuario
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          profileComplete: false,
          subscription: 'free',
          authProvider: 'google',
        });
      }
      
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          ...userData,
        },
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Iniciar sesión con Facebook
  static async signInWithFacebook(facebookCredential) {
    try {
      const credential = FacebookAuthProvider.credential(facebookCredential);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          profileComplete: false,
          subscription: 'free',
          authProvider: 'facebook',
        });
      }
      
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          ...userData,
        },
      };
    } catch (error) {
      console.error('Facebook sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Cerrar sesión
  static async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Recuperar contraseña
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Se ha enviado un correo para restablecer tu contraseña',
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Actualizar perfil de usuario
  static async updateUserProfile(updates) {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }
      
      // Actualizar en Firebase Auth si hay cambios de nombre
      if (updates.name) {
        await updateProfile(user, {
          displayName: updates.name,
        });
      }
      
      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Actualizar perfil de salud
  static async updateHealthProfile(healthProfile) {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }
      
      await updateDoc(doc(db, 'users', user.uid), {
        healthProfile: healthProfile,
        profileComplete: true,
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Update health profile error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Cambiar email
  static async changeEmail(newEmail, currentPassword) {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }
      
      // Re-autenticar usuario
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Cambiar email
      await updateEmail(user, newEmail);
      
      // Actualizar en Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        email: newEmail,
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Change email error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Cambiar contraseña
  static async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return { success: false, error: 'No hay usuario autenticado' };
      }
      
      // Re-autenticar usuario
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      
      // Cambiar contraseña
      await updatePassword(user, newPassword);
      
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Obtener usuario actual
  static getCurrentUser() {
    return auth.currentUser;
  }
  
  // Obtener datos completos del usuario
  static async getUserData(uid = null) {
    try {
      const userId = uid || auth.currentUser?.uid;
      
      if (!userId) {
        return { success: false, error: 'No hay usuario autenticado' };
      }
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return {
          success: true,
          user: userDoc.data(),
        };
      } else {
        return {
          success: false,
          error: 'Usuario no encontrado',
        };
      }
    } catch (error) {
      console.error('Get user data error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }
  
  // Listener de cambios de autenticación
  static onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }
  
  // Obtener mensajes de error legibles
  static getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/requires-recent-login': 'Por seguridad, inicia sesión nuevamente',
    };
    
    return errorMessages[errorCode] || 'Ha ocurrido un error. Intenta nuevamente';
  }
}

export default FirebaseAuthService;