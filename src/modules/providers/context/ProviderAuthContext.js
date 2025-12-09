// src/modules/providers/context/ProviderAuthContext.js
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../../config/firebase';

const ProviderAuthContext = createContext({});

export const ProviderAuthProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔵 ProviderAuthContext - Usuario detectado:', user?.uid);
      
      if (user) {
        try {
          // IMPORTANTE: Buscar SOLO en la colección 'providers'
          const providerDoc = await getDoc(doc(db, 'providers', user.uid));
          
          console.log('🔵 Documento de proveedor existe:', providerDoc.exists());
          
          if (providerDoc.exists()) {
            const providerData = providerDoc.data();
            console.log('🔵 Provider Profile:', providerData);
            console.log('🔵 isProfileComplete:', providerData.isProfileComplete);
            
            setProvider(user);
            setProviderProfile(providerData);
          } else {
            // El usuario NO es proveedor
            console.log('🔵 Usuario NO es proveedor');
            setProvider(null);
            setProviderProfile(null);
          }
        } catch (error) {
          console.error('❌ Error al cargar perfil de proveedor:', error);
          setProvider(null);
          setProviderProfile(null);
        }
      } else {
        console.log('🔵 No hay usuario autenticado');
        setProvider(null);
        setProviderProfile(null);
      }
      
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const refreshProviderProfile = async () => {
    if (provider) {
      try {
        const providerDoc = await getDoc(doc(db, 'providers', provider.uid));
        if (providerDoc.exists()) {
          setProviderProfile(providerDoc.data());
        }
      } catch (error) {
        console.error('Error al refrescar perfil:', error);
      }
    }
  };

  const value = {
    provider,
    providerProfile,
    initializing,
    loading,
    setLoading,
    refreshProviderProfile,
  };

  return (
    <ProviderAuthContext.Provider value={value}>
      {children}
    </ProviderAuthContext.Provider>
  );
};

export const useProviderAuth = () => {
  const context = useContext(ProviderAuthContext);
  if (!context) {
    throw new Error('useProviderAuth debe usarse dentro de ProviderAuthProvider');
  }
  return context;
};