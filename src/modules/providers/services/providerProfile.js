// src/modules/providers/services/providerProfile.js
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { cloudinaryService } from '../../../services/cloudinaryService';

export const providerProfileService = {
  async completeProfile(providerId, profileData) {
    try {
      const providerRef = doc(db, 'providers', providerId);
      
      await updateDoc(providerRef, {
        ownerName: profileData.ownerName,
        phone: profileData.phone,
        address: {
          street: profileData.address.street,
          city: profileData.address.city,
          region: profileData.address.region,
          postalCode: profileData.address.postalCode
        },
        description: profileData.description,
        isProfileComplete: true
      });

      return { success: true };
    } catch (error) {
      console.error('Error al completar perfil:', error);
      return { success: false, error: error.message };
    }
  },

  async updateProfile(providerId, updates) {
    try {
      const providerRef = doc(db, 'providers', providerId);
      await updateDoc(providerRef, updates);
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return { success: false, error: error.message };
    }
  },

  async uploadLogo(providerId, imageUri) {
    try {
      console.log('📸 Subiendo logo del proveedor:', providerId);

      // Subir a Cloudinary
      const result = await cloudinaryService.uploadImage(
        imageUri, 
        `providers/${providerId}`
      );

      if (result.success) {
        // Guardar URL en Firestore
        await updateDoc(doc(db, 'providers', providerId), {
          logo: result.url
        });

        console.log('✅ Logo guardado en Firestore');
        return { success: true, url: result.url };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Error al subir logo:', error);
      return { success: false, error: error.message };
    }
  },

  async getProfile(providerId) {
    try {
      const providerDoc = await getDoc(doc(db, 'providers', providerId));
      
      if (providerDoc.exists()) {
        return { success: true, data: providerDoc.data() };
      } else {
        return { success: false, error: 'Proveedor no encontrado' };
      }
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return { success: false, error: error.message };
    }
  },

  async getStatistics(providerId) {
    try {
      const providerDoc = await getDoc(doc(db, 'providers', providerId));
      
      if (providerDoc.exists()) {
        const data = providerDoc.data();
        
        return {
          success: true,
          stats: {
            totalSales: data.totalSales || 0,
            rating: data.rating || 0,
            totalProducts: 0,
            pendingOrders: 0,
          }
        };
      }
      
      return { success: false, error: 'Proveedor no encontrado' };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { success: false, error: error.message };
    }
  }
};