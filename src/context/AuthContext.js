import { createContext, useContext, useEffect, useState } from 'react';
// import FirebaseAuthService from '../services/firebase/authService';
import { MockAuthService } from '../services/mockDataService';

const AuthContext = createContext({});

// MODO DE DESARROLLO: Usar mock data sin Firebase
const USE_MOCK_DATA = true; // Cambiar a false cuando Firebase esté configurado

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (USE_MOCK_DATA) {
        // Modo Mock: Cargar de AsyncStorage
        const mockUser = await MockAuthService.getCurrentUser();
        if (mockUser) {
          setUser(mockUser);
          setIsAuthenticated(true);
        }
      } else {
        // Modo Firebase: Usar listener de Firebase
        // const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
        //   if (firebaseUser) {
        //     const result = await FirebaseAuthService.getUserData(firebaseUser.uid);
        //     if (result.success) {
        //       setUser(result.user);
        //       setIsAuthenticated(true);
        //     }
        //   } else {
        //     setUser(null);
        //     setIsAuthenticated(false);
        //   }
        // });
        // return () => unsubscribe();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };


  const signIn = async (email, password) => {
    try {
      const AuthService = USE_MOCK_DATA ? MockAuthService : FirebaseAuthService;
      const result = await AuthService.signIn(email, password);
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (userData) => {
    try {
      const AuthService = USE_MOCK_DATA ? MockAuthService : FirebaseAuthService;
      const { email, password, name } = userData;
      const result = await AuthService.signUp(email, password, { name });
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const AuthService = USE_MOCK_DATA ? MockAuthService : FirebaseAuthService;
      const result = await AuthService.signOut();
      if (result.success) {
        setUser(null);
        setIsAuthenticated(false);
      }
      return result;
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const AuthService = USE_MOCK_DATA ? MockAuthService : FirebaseAuthService;
      const result = await AuthService.updateUserProfile(updates);
      if (result.success) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateHealthProfile = async (healthProfile) => {
    try {
      const AuthService = USE_MOCK_DATA ? MockAuthService : FirebaseAuthService;
      const result = await AuthService.updateHealthProfile(healthProfile);
      if (result.success) {
        setUser({ ...user, healthProfile, profileComplete: true });
      }
      return result;
    } catch (error) {
      console.error('Update health profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (email) => {
    try {
      const AuthService = USE_MOCK_DATA ? MockAuthService : FirebaseAuthService;
      return await AuthService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    updateHealthProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};