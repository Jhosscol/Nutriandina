// modules/user-management/services/storageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_PROFILE: '@nutriandina:user_profile',
  HEALTH_DATA: '@nutriandina:health_data',
  METRICS: '@nutriandina:metrics',
  GOALS: '@nutriandina:goals',
  PREFERENCES: '@nutriandina:preferences',
  QUESTIONNAIRE_PROGRESS: '@nutriandina:questionnaire_progress'
};

class StorageService {
  // ===== MÉTODOS GENERALES =====
  async set(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  }

  async get(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // ===== PERFIL DE USUARIO =====
  async saveUserProfile(profile) {
    return await this.set(STORAGE_KEYS.USER_PROFILE, {
      ...profile,
      updatedAt: new Date().toISOString()
    });
  }

  async getUserProfile() {
    return await this.get(STORAGE_KEYS.USER_PROFILE);
  }

  async updateUserProfile(updates) {
    const currentProfile = await this.getUserProfile();
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return await this.saveUserProfile(updatedProfile);
  }

  // ===== DATOS DE SALUD =====
  async saveHealthData(healthData) {
    return await this.set(STORAGE_KEYS.HEALTH_DATA, {
      ...healthData,
      updatedAt: new Date().toISOString()
    });
  }

  async getHealthData() {
    return await this.get(STORAGE_KEYS.HEALTH_DATA);
  }

  async updateHealthData(updates) {
    const currentData = await this.getHealthData();
    const updatedData = {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return await this.saveHealthData(updatedData);
  }

  // ===== MÉTRICAS =====
  async saveMetric(metricType, value, timestamp = new Date().toISOString()) {
    const metrics = await this.get(STORAGE_KEYS.METRICS) || {};
    
    if (!metrics[metricType]) {
      metrics[metricType] = [];
    }

    metrics[metricType].push({
      value,
      timestamp,
      id: `${metricType}_${Date.now()}`
    });

    // Mantener solo los últimos 100 registros por métrica
    if (metrics[metricType].length > 100) {
      metrics[metricType] = metrics[metricType].slice(-100);
    }

    return await this.set(STORAGE_KEYS.METRICS, metrics);
  }

  async getMetrics(metricType = null) {
    const metrics = await this.get(STORAGE_KEYS.METRICS) || {};
    return metricType ? metrics[metricType] || [] : metrics;
  }

  async getLatestMetric(metricType) {
    const metrics = await this.getMetrics(metricType);
    return metrics.length > 0 ? metrics[metrics.length - 1] : null;
  }

  async deleteMetric(metricType, metricId) {
    const metrics = await this.get(STORAGE_KEYS.METRICS) || {};
    
    if (metrics[metricType]) {
      metrics[metricType] = metrics[metricType].filter(m => m.id !== metricId);
      return await this.set(STORAGE_KEYS.METRICS, metrics);
    }
    
    return false;
  }

  // ===== OBJETIVOS =====
  async saveGoals(goals) {
    return await this.set(STORAGE_KEYS.GOALS, {
      goals,
      updatedAt: new Date().toISOString()
    });
  }

  async getGoals() {
    const data = await this.get(STORAGE_KEYS.GOALS);
    return data ? data.goals : [];
  }

  async addGoal(goal) {
    const goals = await this.getGoals();
    const newGoal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    goals.push(newGoal);
    await this.saveGoals(goals);
    return newGoal;
  }

  async updateGoal(goalId, updates) {
    const goals = await this.getGoals();
    const index = goals.findIndex(g => g.id === goalId);
    
    if (index !== -1) {
      goals[index] = {
        ...goals[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.saveGoals(goals);
      return goals[index];
    }
    
    return null;
  }

  async deleteGoal(goalId) {
    const goals = await this.getGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    return await this.saveGoals(filteredGoals);
  }

  // ===== PREFERENCIAS =====
  async savePreferences(preferences) {
    return await this.set(STORAGE_KEYS.PREFERENCES, preferences);
  }

  async getPreferences() {
    return await this.get(STORAGE_KEYS.PREFERENCES) || {
      notifications: {
        enabled: true,
        reminders: true,
        healthTips: true,
        newRecipes: true
      },
      language: 'es',
      theme: 'light'
    };
  }

  // ===== PROGRESO DEL CUESTIONARIO =====
  async saveQuestionnaireProgress(step, data) {
    const progress = await this.get(STORAGE_KEYS.QUESTIONNAIRE_PROGRESS) || {};
    progress[step] = {
      ...data,
      completedAt: new Date().toISOString()
    };
    return await this.set(STORAGE_KEYS.QUESTIONNAIRE_PROGRESS, progress);
  }

  async getQuestionnaireProgress() {
    return await this.get(STORAGE_KEYS.QUESTIONNAIRE_PROGRESS);
  }

  async clearQuestionnaireProgress() {
    return await this.remove(STORAGE_KEYS.QUESTIONNAIRE_PROGRESS);
  }

  // ===== SINCRONIZACIÓN =====
  async needsSync() {
    // Verificar si hay datos locales que no se han sincronizado con el servidor
    const profile = await this.getUserProfile();
    return profile && !profile.synced;
  }

  async markAsSynced(dataType) {
    // Marcar datos como sincronizados
    const key = STORAGE_KEYS[dataType.toUpperCase()];
    if (key) {
      const data = await this.get(key);
      if (data) {
        data.synced = true;
        data.lastSyncAt = new Date().toISOString();
        await this.set(key, data);
      }
    }
  }
}

export default new StorageService();
export { STORAGE_KEYS };
