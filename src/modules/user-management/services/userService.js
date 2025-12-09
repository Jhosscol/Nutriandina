// modules/user-management/services/userService.js
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../../config/firebase';
import storageService from './storageService';

class UserService {
  // ===== CREAR PERFIL DE USUARIO =====
  async createUserProfile(uid, profileData) {
    try {
      const userRef = doc(db, 'users', uid);
      const profile = {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isProfileComplete: false
      };

      await setDoc(userRef, profile);
      
      // Guardar también localmente
      await storageService.saveUserProfile({ uid, ...profile });

      return { success: true, profile };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== OBTENER PERFIL DE USUARIO =====
  async getUserProfile(uid) {
    try {
      // Primero intentar obtener de cache local
      const localProfile = await storageService.getUserProfile();
      if (localProfile && localProfile.uid === uid) {
        return { success: true, profile: localProfile, source: 'cache' };
      }

      // Si no está en cache, obtener de Firestore
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const profile = { uid, ...docSnap.data() };
        
        // Guardar en cache
        await storageService.saveUserProfile(profile);
        
        return { success: true, profile, source: 'server' };
      }

      return { success: false, error: 'Perfil no encontrado' };
    } catch (error) {
      console.error('Error getting profile:', error);
      
      // Si hay error de red, intentar obtener de cache
      const localProfile = await storageService.getUserProfile();
      if (localProfile) {
        return { success: true, profile: localProfile, source: 'offline' };
      }

      return { success: false, error: error.message };
    }
  }

  // ===== ACTUALIZAR PERFIL DE USUARIO =====
  async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(db, 'users', uid);
      const dataToUpdate = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, dataToUpdate);
      
      // Actualizar cache local
      await storageService.updateUserProfile(updates);

      return { success: true, updates };
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Si hay error, guardar solo localmente para sincronizar después
      await storageService.updateUserProfile({ ...updates, needsSync: true });
      
      return { 
        success: false, 
        error: error.message,
        savedLocally: true 
      };
    }
  }

  // ===== COMPLETAR PERFIL (después del cuestionario) =====
  async completeProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        isProfileComplete: true,
        profileCompletedAt: serverTimestamp()
      });

      await storageService.updateUserProfile({ 
        isProfileComplete: true,
        profileCompletedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error completing profile:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== SUBIR FOTO DE PERFIL =====
  async uploadProfilePhoto(uid, imageUri) {
    try {
      // Convertir URI a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Crear referencia en Storage
      const photoRef = ref(storage, `users/${uid}/profile.jpg`);
      
      // Subir imagen
      await uploadBytes(photoRef, blob);
      
      // Obtener URL de descarga
      const photoURL = await getDownloadURL(photoRef);

      // Actualizar perfil con nueva URL
      await this.updateUserProfile(uid, { photoURL });

      return { success: true, photoURL };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== ELIMINAR CUENTA =====
  async deleteUserAccount(uid) {
    try {
      // Aquí deberías implementar la lógica completa de eliminación
      // incluyendo datos de salud, métricas, etc.
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        isDeleted: true,
        deletedAt: serverTimestamp()
      });

      // Limpiar cache local
      await storageService.clear();

      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== SINCRONIZAR DATOS LOCALES CON SERVIDOR =====
  async syncLocalData(uid) {
    try {
      const profile = await storageService.getUserProfile();
      
      if (profile && profile.needsSync) {
        const { needsSync, ...dataToSync } = profile;
        await this.updateUserProfile(uid, dataToSync);
        await storageService.updateUserProfile({ needsSync: false });
      }

      return { success: true };
    } catch (error) {
      console.error('Error syncing data:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== OBTENER ESTADÍSTICAS DEL USUARIO =====
  async getUserStats(uid) {
    try {
      // Esto podría expandirse para obtener estadísticas más complejas
      const profile = await this.getUserProfile(uid);
      const goals = await storageService.getGoals();
      const metrics = await storageService.getMetrics();

      return {
        success: true,
        stats: {
          profileComplete: profile.profile?.isProfileComplete || false,
          activeGoals: goals.filter(g => g.isActive).length,
          totalMetrics: Object.keys(metrics).length,
          memberSince: profile.profile?.createdAt
        }
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== EXPORTAR DATOS DEL USUARIO (GDPR compliance) =====
  async exportUserData(uid) {
    try {
      const profile = await this.getUserProfile(uid);
      const healthData = await storageService.getHealthData();
      const metrics = await storageService.getMetrics();
      const goals = await storageService.getGoals();

      const exportData = {
        profile: profile.profile,
        healthData,
        metrics,
        goals,
        exportedAt: new Date().toISOString()
      };

      return { success: true, data: exportData };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new UserService();