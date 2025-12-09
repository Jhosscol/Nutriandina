// modules/user-management/services/authService.js
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '../../../config/firebase';

class AuthService {
  // ===== REGISTRO CON EMAIL =====
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar perfil con nombre
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Enviar email de verificación
      await sendEmailVerification(user);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        message: 'Cuenta creada exitosamente. Por favor verifica tu email.'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // ===== LOGIN CON EMAIL =====
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL
        }
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // ===== CERRAR SESIÓN =====
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error al cerrar sesión'
      };
    }
  }

  // ===== RECUPERAR CONTRASEÑA =====
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Se ha enviado un email para restablecer tu contraseña'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // ===== REENVIAR EMAIL DE VERIFICACIÓN =====
  async resendVerificationEmail() {
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        return {
          success: true,
          message: 'Email de verificación enviado'
        };
      }
      return {
        success: false,
        error: 'Email ya verificado o usuario no encontrado'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // ===== OBTENER USUARIO ACTUAL =====
  getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      };
    }
    return null;
  }

  // ===== ACTUALIZAR PERFIL =====
  async updateUserProfile(updates) {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, updates);
        return {
          success: true,
          user: this.getCurrentUser()
        };
      }
      return {
        success: false,
        error: 'Usuario no encontrado'
      };
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  // ===== OBSERVER DE AUTENTICACIÓN =====
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified
        });
      } else {
        callback(null);
      }
    });
  }

  // ===== MANEJO DE ERRORES =====
  handleAuthError(error) {
    let message = 'Ha ocurrido un error';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Este email ya está registrado';
        break;
      case 'auth/invalid-email':
        message = 'Email inválido';
        break;
      case 'auth/operation-not-allowed':
        message = 'Operación no permitida';
        break;
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/user-disabled':
        message = 'Usuario deshabilitado';
        break;
      case 'auth/user-not-found':
        message = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta';
        break;
      case 'auth/too-many-requests':
        message = 'Demasiados intentos. Intenta más tarde';
        break;
      case 'auth/network-request-failed':
        message = 'Error de conexión. Verifica tu internet';
        break;
      case 'auth/invalid-credential':
        message = 'Credenciales inválidas. Verifica tu email y contraseña';
        break;
      default:
        message = error.message || 'Error desconocido';
    }

    return {
      success: false,
      error: message,
      code: error.code
    };
  }

  // ===== VALIDACIONES =====
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    return password.length >= 6;
  }

  validateDisplayName(name) {
    return name && name.trim().length >= 2;
  }
}

export default new AuthService();