// modules/user-management/context/HealthDataContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { HEALTH_METRICS } from '../constants/metrics';
import healthService from '../services/healthService';
import storageService from '../services/storageService';
import { useAuth } from './AuthContext';


const HealthDataContext = createContext({});

export const HealthDataProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos de salud al montar o cuando cambie el usuario
  useEffect(() => {
    if (user) {
      loadHealthData();
      loadMetrics();
      loadGoals();
    } else {
      setHealthData(null);
      setMetrics({});
      setGoals([]);
    }
  }, [user]);

  // ===== DATOS DE SALUD =====
  const loadHealthData = async () => {
    try {
      const data = await storageService.getHealthData();
      setHealthData(data);
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

  const saveHealthData = async (data) => {
    try {
      setLoading(true);
      
      // Procesar datos del cuestionario
      const processedData = healthService.processHealthQuestionnaire(data);
      
      // Guardar en Firestore y localmente
      const result = await healthService.saveHealthData(user.uid, processedData);
      
      if (result.success || result.savedLocally) {
        setHealthData(processedData);
        return { success: true, data: processedData };
      }
      
      return result;
    } catch (error) {
      console.error('Error saving health data:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateHealthData = async (updates) => {
    try {
      setLoading(true);
      const result = await healthService.updateHealthData(user.uid, updates);
      
      if (result.success || result.savedLocally) {
        setHealthData(prev => ({ ...prev, ...updates }));
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ===== MÉTRICAS =====
  const loadMetrics = async () => {
    try {
      const allMetrics = await storageService.getMetrics();
      setMetrics(allMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const addMetric = async (metricType, value, timestamp) => {
    try {
      await storageService.saveMetric(metricType, value, timestamp);
      await loadMetrics();
      
      // Si es peso o altura, recalcular IMC
      if (metricType === 'weight' || metricType === 'height') {
        await calculateAndSaveBMI();
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getMetricHistory = async (metricType, days = 30) => {
    try {
      const allMetrics = await storageService.getMetrics(metricType);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return allMetrics.filter(m => new Date(m.timestamp) >= cutoffDate);
    } catch (error) {
      console.error('Error getting metric history:', error);
      return [];
    }
  };

  const getLatestMetric = async (metricType) => {
    try {
      return await storageService.getLatestMetric(metricType);
    } catch (error) {
      console.error('Error getting latest metric:', error);
      return null;
    }
  };

  const deleteMetric = async (metricType, metricId) => {
    try {
      await storageService.deleteMetric(metricType, metricId);
      await loadMetrics();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ===== CALCULAR IMC =====
  const calculateAndSaveBMI = async () => {
    try {
      const weight = await storageService.getLatestMetric('weight');
      const height = await storageService.getLatestMetric('height');
      
      if (weight && height) {
        const bmi = HEALTH_METRICS.bmi.calculation(weight.value, height.value);
        await addMetric('bmi', parseFloat(bmi.toFixed(1)), new Date().toISOString());
      }
    } catch (error) {
      console.error('Error calculating BMI:', error);
    }
  };

  // ===== OBJETIVOS =====
  const loadGoals = async () => {
    try {
      const allGoals = await storageService.getGoals();
      setGoals(allGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const addGoal = async (goalData) => {
    try {
      const newGoal = await storageService.addGoal(goalData);
      await loadGoals();
      return { success: true, goal: newGoal };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateGoal = async (goalId, updates) => {
    try {
      const updatedGoal = await storageService.updateGoal(goalId, updates);
      await loadGoals();
      return { success: true, goal: updatedGoal };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await storageService.deleteGoal(goalId);
      await loadGoals();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const toggleGoalStatus = async (goalId) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        await updateGoal(goalId, { isActive: !goal.isActive });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ===== PERFIL NUTRICIONAL PARA MÓDULO 2 =====
  const generateNutritionalProfile = () => {
    if (!healthData || !userProfile) {
      return null;
    }
    
    return healthService.generateNutritionalProfile(healthData, userProfile);
  };

  // ===== VALIDACIÓN DE COMPATIBILIDAD =====
  const validateFoodCompatibility = (foodItem) => {
    if (!healthData) {
      return { isCompatible: true, incompatibilities: [] };
    }
    
    return healthService.validateFoodCompatibility(foodItem, healthData);
  };

  // ===== ESTADÍSTICAS =====
  const getHealthStats = () => {
    return {
      totalConditions: healthData?.conditions?.length || 0,
      totalAllergies: healthData?.allergies?.length || 0,
      totalRestrictions: healthData?.dietaryRestrictions?.length || 0,
      activeGoals: goals.filter(g => g.isActive).length,
      totalMetrics: Object.keys(metrics).length,
      riskLevel: healthData?.riskLevel || 'low'
    };
  };

  const value = {
    healthData,
    metrics,
    goals,
    loading,
    
    // Funciones de datos de salud
    saveHealthData,
    updateHealthData,
    loadHealthData,
    
    // Funciones de métricas
    addMetric,
    getMetricHistory,
    getLatestMetric,
    deleteMetric,
    loadMetrics,
    
    // Funciones de objetivos
    addGoal,
    updateGoal,
    deleteGoal,
    toggleGoalStatus,
    loadGoals,
    
    // Utilidades
    generateNutritionalProfile,
    validateFoodCompatibility,
    getHealthStats
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};

// Hook personalizado
export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  
  if (!context) {
    throw new Error('useHealthData debe ser usado dentro de un HealthDataProvider');
  }
  
  return context;
};

export default HealthDataContext;