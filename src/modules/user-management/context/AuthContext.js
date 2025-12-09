// modules/user-management/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        await loadUserProfile(authUser.uid);
      } else {
        setUserProfile(null);
      }
      
      if (initializing) {
        setInitializing(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [initializing]);

  // Cargar perfil del usuario
  const loadUserProfile = async (uid) => {
    try {
      const result = await userService.getUserProfile(uid);
      if (result.success) {
        setUserProfile(result.profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  // Registrar nuevo usuario
  const register = async (email, password, displayName) => {
    console.log('🟢 =================================');
    console.log('🟢 AuthContext: register() llamado');
    console.log('🟢 =================================');
    console.log('📧 Email:', email);
    console.log('👤 DisplayName:', displayName);
    
    try {
      setLoading(true);
      
      console.log('🟢 Llamando a authService.register()...');
      const result = await authService.register(email, password, displayName);
      
      console.log('📦 Resultado de authService:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ authService.register() exitoso');
        console.log('🟢 Creando perfil en Firestore...');
        console.log('🆔 UID:', result.user.uid);
        
        try {
          const profileResult = await userService.createUserProfile(result.user.uid, {
            email: result.user.email,
            displayName: result.user.displayName,
            emailVerified: result.user.emailVerified
          });
          
          console.log('📦 Resultado de createUserProfile:', JSON.stringify(profileResult, null, 2));
          
          if (!profileResult.success) {
            console.warn('⚠️ createUserProfile falló pero el usuario fue creado en Auth');
          }
        } catch (profileError) {
          console.error('💥 Error creando perfil en Firestore:', profileError);
          // No retornamos error aquí porque el usuario YA fue creado en Auth
        }
      } else {
        console.log('❌ authService.register() falló:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('💥 =================================');
      console.error('💥 AuthContext: Error capturado');
      console.error('💥 =================================');
      console.error('💥 Error:', error);
      console.error('💥 Message:', error.message);
      console.error('💥 Stack:', error.stack);
      
      return { 
        success: false, 
        error: error.message || 'Error desconocido en el registro' 
      };
    } finally {
      setLoading(false);
      console.log('🟢 =================================');
      console.log('🟢 AuthContext: register() finalizado');
      console.log('🟢 =================================');
    }
  };

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      setLoading(true);
      const result = await authService.logout();
      
      if (result.success) {
        setUser(null);
        setUserProfile(null);
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Recuperar contraseña
  const resetPassword = async (email) => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Actualizar perfil
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      
      if (updates.displayName || updates.photoURL) {
        await authService.updateUserProfile({
          displayName: updates.displayName,
          photoURL: updates.photoURL
        });
      }
      
      const result = await userService.updateUserProfile(user.uid, updates);
      
      if (result.success) {
        await loadUserProfile(user.uid);
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Subir foto de perfil
  const uploadProfilePhoto = async (imageUri) => {
    try {
      setLoading(true);
      const result = await userService.uploadProfilePhoto(user.uid, imageUri);
      
      if (result.success) {
        await updateProfile({ photoURL: result.photoURL });
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Recargar perfil
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  // Verificar si el perfil está completo
  const isProfileComplete = () => {
    return userProfile?.isProfileComplete === true;
  };

  // Sincronizar datos
  const syncData = async () => {
    if (user) {
      try {
        await userService.syncLocalData(user.uid);
        await loadUserProfile(user.uid);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
    return { success: false, error: 'No user logged in' };
  };

  const value = {
    user,
    userProfile,
    loading,
    initializing,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    uploadProfilePhoto,
    refreshProfile,
    isProfileComplete,
    syncData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;