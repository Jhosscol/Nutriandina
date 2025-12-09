// src/modules/nutrition/utils/debugToken.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugToken = async () => {
  try {
    console.log('\n🔍 === DEBUG TOKEN ===');
    
    // Intentar obtener con diferentes nombres
    const possibleKeys = [
      'userToken',
      '@userToken',
      'token',
      'authToken',
      'jwt',
      'accessToken',
      '@auth_token',
      'firebase_token'
    ];
    
    let foundToken = null;
    let foundKey = null;
    
    for (const key of possibleKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        console.log(`✅ Token encontrado con key: "${key}"`);
        console.log(`   Longitud: ${value.length} caracteres`);
        console.log(`   Primeros 50 caracteres: ${value.substring(0, 50)}...`);
        foundToken = value;
        foundKey = key;
        break;
      }
    }
    
    if (!foundToken) {
      console.log('❌ NO SE ENCONTRÓ TOKEN en ninguna de estas keys:');
      possibleKeys.forEach(key => console.log(`   - ${key}`));
      
      // Listar TODAS las keys almacenadas
      console.log('\n📋 Keys almacenadas en AsyncStorage:');
      const allKeys = await AsyncStorage.getAllKeys();
      allKeys.forEach(key => console.log(`   - ${key}`));
    } else {
      console.log(`\n✅ Usar esta key para obtener token: "${foundKey}"`);
    }
    
    console.log('=== FIN DEBUG ===\n');
    
    return { token: foundToken, key: foundKey };
  } catch (error) {
    console.error('❌ Error en debugToken:', error);
    return null;
  }
};

// Función para verificar si el token es válido
export const verifyTokenFormat = (token) => {
  if (!token) return false;
  
  // JWT tiene 3 partes separadas por puntos
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn('⚠️ Token no tiene formato JWT válido (debe tener 3 partes)');
    return false;
  }
  
  console.log('✅ Token tiene formato JWT válido');
  return true;
};