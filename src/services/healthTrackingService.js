// Servicio de seguimiento de salud
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clase principal de seguimiento de salud
export class HealthTracker {
  
  // Registrar comida consumida
  static async logMeal(mealData) {
    try {
      const meals = await this.getMeals();
      
      const newMeal = {
        id: `MEAL-${Date.now()}`,
        ...mealData,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
      };
      
      meals.push(newMeal);
      await AsyncStorage.setItem('health_meals', JSON.stringify(meals));
      
      // Actualizar métricas diarias
      await this.updateDailyMetrics(newMeal.date);
      
      return newMeal;
    } catch (error) {
      console.error('Error logging meal:', error);
      throw error;
    }
  }

  // Obtener comidas registradas
  static async getMeals(startDate = null, endDate = null) {
    try {
      const mealsData = await AsyncStorage.getItem('health_meals');
      let meals = mealsData ? JSON.parse(mealsData) : [];
      
      if (startDate && endDate) {
        meals = meals.filter(meal => {
          const mealDate = new Date(meal.date);
          return mealDate >= new Date(startDate) && mealDate <= new Date(endDate);
        });
      }
      
      return meals;
    } catch (error) {
      console.error('Error loading meals:', error);
      return [];
    }
  }

  // Registrar agua consumida
  static async logWater(amount) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const waterLog = await this.getWaterLog(today);
      
      const newEntry = {
        amount,
        timestamp: new Date().toISOString(),
      };
      
      waterLog.entries.push(newEntry);
      waterLog.total += amount;
      
      await AsyncStorage.setItem(`water_log_${today}`, JSON.stringify(waterLog));
      
      return waterLog;
    } catch (error) {
      console.error('Error logging water:', error);
      throw error;
    }
  }

  // Obtener registro de agua
  static async getWaterLog(date) {
    try {
      const logData = await AsyncStorage.getItem(`water_log_${date}`);
      
      if (logData) {
        return JSON.parse(logData);
      }
      
      return {
        date,
        total: 0,
        target: 2.5, // Litros por defecto
        entries: [],
      };
    } catch (error) {
      console.error('Error loading water log:', error);
      return { date, total: 0, target: 2.5, entries: [] };
    }
  }

  // Registrar peso
  static async logWeight(weight, notes = '') {
    try {
      const weights = await this.getWeightHistory();
      
      const newEntry = {
        id: `WEIGHT-${Date.now()}`,
        weight,
        notes,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      };
      
      weights.push(newEntry);
      await AsyncStorage.setItem('weight_history', JSON.stringify(weights));
      
      return newEntry;
    } catch (error) {
      console.error('Error logging weight:', error);
      throw error;
    }
  }

  // Obtener historial de peso
  static async getWeightHistory(days = 30) {
    try {
      const weightsData = await AsyncStorage.getItem('weight_history');
      let weights = weightsData ? JSON.parse(weightsData) : [];
      
      // Filtrar últimos N días
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      weights = weights.filter(w => new Date(w.date) >= cutoffDate);
      weights.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return weights;
    } catch (error) {
      console.error('Error loading weight history:', error);
      return [];
    }
  }

  // Registrar presión arterial
  static async logBloodPressure(systolic, diastolic, heartRate = null, notes = '') {
    try {
      const readings = await this.getBloodPressureHistory();
      
      const newReading = {
        id: `BP-${Date.now()}`,
        systolic,
        diastolic,
        heartRate,
        notes,
        category: this.classifyBloodPressure(systolic, diastolic),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      };
      
      readings.push(newReading);
      await AsyncStorage.setItem('blood_pressure_history', JSON.stringify(readings));
      
      return newReading;
    } catch (error) {
      console.error('Error logging blood pressure:', error);
      throw error;
    }
  }

  // Clasificar presión arterial según AHA
  static classifyBloodPressure(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) {
      return { level: 'normal', label: 'Normal', color: '#4CAF50' };
    } else if (systolic < 130 && diastolic < 80) {
      return { level: 'elevated', label: 'Elevada', color: '#FFC107' };
    } else if (systolic < 140 || diastolic < 90) {
      return { level: 'stage1', label: 'Hipertensión Etapa 1', color: '#FF9800' };
    } else if (systolic >= 140 || diastolic >= 90) {
      return { level: 'stage2', label: 'Hipertensión Etapa 2', color: '#F44336' };
    } else if (systolic >= 180 || diastolic >= 120) {
      return { level: 'crisis', label: 'Crisis Hipertensiva', color: '#B71C1C' };
    }
    return { level: 'unknown', label: 'Desconocido', color: '#9E9E9E' };
  }

  // Obtener historial de presión arterial
  static async getBloodPressureHistory(days = 30) {
    try {
      const readingsData = await AsyncStorage.getItem('blood_pressure_history');
      let readings = readingsData ? JSON.parse(readingsData) : [];
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      readings = readings.filter(r => new Date(r.date) >= cutoffDate);
      readings.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return readings;
    } catch (error) {
      console.error('Error loading blood pressure history:', error);
      return [];
    }
  }

  // Registrar glucosa en sangre
  static async logBloodGlucose(glucose, mealContext = 'fasting', notes = '') {
    try {
      const readings = await this.getBloodGlucoseHistory();
      
      const newReading = {
        id: `GLUCOSE-${Date.now()}`,
        glucose,
        mealContext, // fasting, before_meal, after_meal, bedtime
        notes,
        category: this.classifyBloodGlucose(glucose, mealContext),
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      };
      
      readings.push(newReading);
      await AsyncStorage.setItem('blood_glucose_history', JSON.stringify(readings));
      
      return newReading;
    } catch (error) {
      console.error('Error logging blood glucose:', error);
      throw error;
    }
  }

  // Clasificar glucosa en sangre
  static classifyBloodGlucose(glucose, context) {
    if (context === 'fasting') {
      if (glucose < 70) {
        return { level: 'low', label: 'Baja', color: '#FF9800' };
      } else if (glucose <= 100) {
        return { level: 'normal', label: 'Normal', color: '#4CAF50' };
      } else if (glucose <= 125) {
        return { level: 'prediabetes', label: 'Prediabetes', color: '#FFC107' };
      } else {
        return { level: 'diabetes', label: 'Diabetes', color: '#F44336' };
      }
    } else if (context === 'after_meal') {
      if (glucose < 70) {
        return { level: 'low', label: 'Baja', color: '#FF9800' };
      } else if (glucose < 140) {
        return { level: 'normal', label: 'Normal', color: '#4CAF50' };
      } else if (glucose < 200) {
        return { level: 'prediabetes', label: 'Prediabetes', color: '#FFC107' };
      } else {
        return { level: 'high', label: 'Alta', color: '#F44336' };
      }
    }
    return { level: 'unknown', label: 'Desconocido', color: '#9E9E9E' };
  }

  // Obtener historial de glucosa
  static async getBloodGlucoseHistory(days = 30) {
    try {
      const readingsData = await AsyncStorage.getItem('blood_glucose_history');
      let readings = readingsData ? JSON.parse(readingsData) : [];
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      readings = readings.filter(r => new Date(r.date) >= cutoffDate);
      readings.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return readings;
    } catch (error) {
      console.error('Error loading blood glucose history:', error);
      return [];
    }
  }

  // Actualizar métricas diarias
  static async updateDailyMetrics(date) {
    try {
      const meals = await this.getMeals(date, date);
      
      const metrics = {
        date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        mealsCount: meals.length,
      };
      
      meals.forEach(meal => {
        metrics.calories += meal.calories || 0;
        metrics.protein += meal.protein || 0;
        metrics.carbs += meal.carbs || 0;
        metrics.fats += meal.fats || 0;
        metrics.fiber += meal.fiber || 0;
      });
      
      await AsyncStorage.setItem(`daily_metrics_${date}`, JSON.stringify(metrics));
      
      return metrics;
    } catch (error) {
      console.error('Error updating daily metrics:', error);
      throw error;
    }
  }

  // Obtener métricas diarias
  static async getDailyMetrics(date) {
    try {
      const metricsData = await AsyncStorage.getItem(`daily_metrics_${date}`);
      
      if (metricsData) {
        return JSON.parse(metricsData);
      }
      
      // Si no existen, calcularlas
      return await this.updateDailyMetrics(date);
    } catch (error) {
      console.error('Error loading daily metrics:', error);
      return null;
    }
  }

  // Obtener métricas semanales
  static async getWeeklyMetrics() {
    try {
      const metrics = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayMetrics = await this.getDailyMetrics(dateStr);
        metrics.push({
          date: dateStr,
          dayName: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()],
          ...dayMetrics,
        });
      }
      
      return metrics;
    } catch (error) {
      console.error('Error loading weekly metrics:', error);
      return [];
    }
  }

  // Calcular progreso hacia objetivos
  static async calculateProgress(userProfile) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const metrics = await this.getDailyMetrics(today);
      const waterLog = await this.getWaterLog(today);
      
      const targetCalories = userProfile.targetCalories || 2000;
      const targetProtein = userProfile.targetProtein || 100;
      const targetCarbs = userProfile.targetCarbs || 250;
      const targetFats = userProfile.targetFats || 70;
      const targetWater = userProfile.targetWater || 2.5;
      
      return {
        calories: {
          current: metrics?.calories || 0,
          target: targetCalories,
          percentage: Math.min(((metrics?.calories || 0) / targetCalories) * 100, 100),
        },
        protein: {
          current: metrics?.protein || 0,
          target: targetProtein,
          percentage: Math.min(((metrics?.protein || 0) / targetProtein) * 100, 100),
        },
        carbs: {
          current: metrics?.carbs || 0,
          target: targetCarbs,
          percentage: Math.min(((metrics?.carbs || 0) / targetCarbs) * 100, 100),
        },
        fats: {
          current: metrics?.fats || 0,
          target: targetFats,
          percentage: Math.min(((metrics?.fats || 0) / targetFats) * 100, 100),
        },
        water: {
          current: waterLog.total,
          target: targetWater,
          percentage: Math.min((waterLog.total / targetWater) * 100, 100),
        },
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      return null;
    }
  }

  // Generar reporte de salud
  static async generateHealthReport(days = 30) {
    try {
      const weightHistory = await this.getWeightHistory(days);
      const bpHistory = await this.getBloodPressureHistory(days);
      const glucoseHistory = await this.getBloodGlucoseHistory(days);
      
      const report = {
        period: `${days} días`,
        generatedAt: new Date().toISOString(),
        weight: this.analyzeWeightTrend(weightHistory),
        bloodPressure: this.analyzeBloodPressureTrend(bpHistory),
        bloodGlucose: this.analyzeBloodGlucoseTrend(glucoseHistory),
        recommendations: [],
      };
      
      // Agregar recomendaciones basadas en tendencias
      if (report.weight.trend === 'increasing' && report.weight.change > 2) {
        report.recommendations.push({
          type: 'weight',
          message: 'Tu peso ha aumentado. Considera ajustar tu plan nutricional.',
          priority: 'medium',
        });
      }
      
      if (report.bloodPressure.avgCategory?.level === 'stage1' || 
          report.bloodPressure.avgCategory?.level === 'stage2') {
        report.recommendations.push({
          type: 'blood_pressure',
          message: 'Tu presión arterial está elevada. Consulta con tu médico.',
          priority: 'high',
        });
      }
      
      if (report.bloodGlucose.avgCategory?.level === 'prediabetes' ||
          report.bloodGlucose.avgCategory?.level === 'diabetes') {
        report.recommendations.push({
          type: 'blood_glucose',
          message: 'Tus niveles de glucosa requieren atención. Consulta con un especialista.',
          priority: 'high',
        });
      }
      
      return report;
    } catch (error) {
      console.error('Error generating health report:', error);
      return null;
    }
  }

  // Analizar tendencia de peso
  static analyzeWeightTrend(weightHistory) {
    if (weightHistory.length < 2) {
      return { trend: 'insufficient_data', change: 0 };
    }
    
    const firstWeight = weightHistory[0].weight;
    const lastWeight = weightHistory[weightHistory.length - 1].weight;
    const change = lastWeight - firstWeight;
    
    let trend;
    if (Math.abs(change) < 0.5) {
      trend = 'stable';
    } else if (change > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }
    
    const average = weightHistory.reduce((sum, w) => sum + w.weight, 0) / weightHistory.length;
    
    return {
      trend,
      change: Math.abs(change),
      average: Math.round(average * 10) / 10,
      first: firstWeight,
      last: lastWeight,
      entries: weightHistory.length,
    };
  }

  // Analizar tendencia de presión arterial
  static analyzeBloodPressureTrend(bpHistory) {
    if (bpHistory.length === 0) {
      return { trend: 'insufficient_data' };
    }
    
    const avgSystolic = bpHistory.reduce((sum, bp) => sum + bp.systolic, 0) / bpHistory.length;
    const avgDiastolic = bpHistory.reduce((sum, bp) => sum + bp.diastolic, 0) / bpHistory.length;
    
    return {
      avgSystolic: Math.round(avgSystolic),
      avgDiastolic: Math.round(avgDiastolic),
      avgCategory: this.classifyBloodPressure(avgSystolic, avgDiastolic),
      readings: bpHistory.length,
      lastReading: bpHistory[bpHistory.length - 1],
    };
  }

  // Analizar tendencia de glucosa
  static analyzeBloodGlucoseTrend(glucoseHistory) {
    if (glucoseHistory.length === 0) {
      return { trend: 'insufficient_data' };
    }
    
    const avgGlucose = glucoseHistory.reduce((sum, g) => sum + g.glucose, 0) / glucoseHistory.length;
    
    return {
      avgGlucose: Math.round(avgGlucose),
      avgCategory: this.classifyBloodGlucose(avgGlucose, 'fasting'),
      readings: glucoseHistory.length,
      lastReading: glucoseHistory[glucoseHistory.length - 1],
    };
  }
}

export default HealthTracker;