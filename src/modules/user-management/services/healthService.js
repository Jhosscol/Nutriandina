// modules/user-management/services/healthService.js
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { FOOD_ALLERGIES } from '../constants/allergies';
import { DIETARY_RESTRICTIONS, HEALTH_CONDITIONS } from '../constants/healthConditions';
import storageService from './storageService';

class HealthService {
  // ===== GUARDAR DATOS DE SALUD COMPLETOS =====
  async saveHealthData(uid, healthData) {
    try {
      const healthRef = doc(db, 'health_data', uid);
      const dataToSave = {
        ...healthData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(healthRef, dataToSave);
      
      // Guardar localmente
      await storageService.saveHealthData(healthData);

      return { success: true, healthData: dataToSave };
    } catch (error) {
      console.error('Error saving health data:', error);
      
      // Si falla, guardar solo localmente
      await storageService.saveHealthData({ ...healthData, needsSync: true });
      
      return { 
        success: false, 
        error: error.message,
        savedLocally: true 
      };
    }
  }

  // ===== ACTUALIZAR DATOS DE SALUD =====
  async updateHealthData(uid, updates) {
    try {
      const healthRef = doc(db, 'health_data', uid);
      await updateDoc(healthRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      await storageService.updateHealthData(updates);

      return { success: true };
    } catch (error) {
      console.error('Error updating health data:', error);
      await storageService.updateHealthData({ ...updates, needsSync: true });
      return { success: false, error: error.message, savedLocally: true };
    }
  }

  // ===== PROCESAR CUESTIONARIO DE SALUD =====
  processHealthQuestionnaire(questionnaireData) {
    const {
      basicInfo,
      conditions,
      allergies,
      preferences
    } = questionnaireData;

    // Calcular restricciones dietéticas basadas en condiciones
    const dietaryRestrictions = this.calculateDietaryRestrictions(conditions);

    // Calcular métricas requeridas
    const requiredMetrics = this.calculateRequiredMetrics(conditions);

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(
      conditions,
      allergies,
      preferences
    );

    // Calcular nivel de riesgo
    const riskLevel = this.calculateRiskLevel(conditions, basicInfo);

    return {
      basicInfo,
      conditions,
      allergies,
      preferences,
      dietaryRestrictions,
      requiredMetrics,
      recommendations,
      riskLevel,
      processedAt: new Date().toISOString()
    };
  }

  // ===== CALCULAR RESTRICCIONES DIETÉTICAS =====
  calculateDietaryRestrictions(conditions) {
    const restrictions = new Set();

    conditions.forEach(conditionId => {
      const condition = HEALTH_CONDITIONS.find(c => c.id === conditionId);
      if (condition && condition.dietaryRestrictions) {
        condition.dietaryRestrictions.forEach(r => restrictions.add(r));
      }
    });

    return Array.from(restrictions).map(restrictionId => ({
      id: restrictionId,
      ...DIETARY_RESTRICTIONS[restrictionId]
    }));
  }

  // ===== CALCULAR MÉTRICAS REQUERIDAS =====
  calculateRequiredMetrics(conditions) {
    const metrics = new Set(['weight', 'height', 'bmi']); // Métricas básicas siempre

    conditions.forEach(conditionId => {
      const condition = HEALTH_CONDITIONS.find(c => c.id === conditionId);
      if (condition && condition.requiresMonitoring) {
        condition.requiresMonitoring.forEach(m => metrics.add(m));
      }
    });

    return Array.from(metrics);
  }

  // ===== GENERAR RECOMENDACIONES =====
  generateRecommendations(conditions, allergies, preferences) {
    const recommendations = [];

    // Recomendaciones basadas en condiciones
    if (conditions.includes('diabetes_type2') || conditions.includes('prediabetes')) {
      recommendations.push({
        type: 'nutrition',
        priority: 'high',
        title: 'Control de Carbohidratos',
        description: 'Prioriza granos andinos como quinua y kiwicha que tienen bajo índice glucémico',
        icon: 'nutrition'
      });
    }

    if (conditions.includes('hypertension')) {
      recommendations.push({
        type: 'nutrition',
        priority: 'high',
        title: 'Reducir Sodio',
        description: 'Usa sal de Maras en pequeñas cantidades y aumenta potasio con papas andinas',
        icon: 'alert-circle'
      });
    }

    if (conditions.includes('anemia')) {
      recommendations.push({
        type: 'nutrition',
        priority: 'high',
        title: 'Aumentar Hierro',
        description: 'Consume regularmente quinua, tarwi y sangre de pollo con limón para mejor absorción',
        icon: 'water'
      });
    }

    // Recomendaciones basadas en alergias
    if (allergies.includes('gluten') || allergies.includes('wheat')) {
      recommendations.push({
        type: 'nutrition',
        priority: 'high',
        title: 'Alternativas sin Gluten',
        description: 'Usa harinas de quinua, amaranto, papa y yuca como sustitutos',
        icon: 'food'
      });
    }

    // Recomendaciones generales
    recommendations.push({
      type: 'lifestyle',
      priority: 'medium',
      title: 'Hidratación',
      description: 'Mantén una buena hidratación con 2-3 litros de agua al día',
      icon: 'water'
    });

    recommendations.push({
      type: 'lifestyle',
      priority: 'medium',
      title: 'Actividad Física',
      description: 'Realiza al menos 30 minutos de actividad física moderada diariamente',
      icon: 'walk'
    });

    return recommendations;
  }

  // ===== CALCULAR NIVEL DE RIESGO =====
  calculateRiskLevel(conditions, basicInfo) {
    let riskScore = 0;

    // Condiciones de alto riesgo
    const highRiskConditions = [
      'diabetes_type1', 
      'diabetes_type2', 
      'hypertension', 
      'kidney_disease',
      'obesity'
    ];
    
    highRiskConditions.forEach(condition => {
      if (conditions.includes(condition)) riskScore += 2;
    });

    // Condiciones de riesgo medio
    const mediumRiskConditions = [
      'prediabetes', 
      'cholesterol', 
      'fatty_liver',
      'thyroid_hyper',
      'thyroid_hypo'
    ];
    
    mediumRiskConditions.forEach(condition => {
      if (conditions.includes(condition)) riskScore += 1;
    });

    // Factores adicionales
    if (basicInfo.age > 60) riskScore += 1;
    if (basicInfo.smoker) riskScore += 2;
    if (basicInfo.alcohol === 'frequent') riskScore += 1;

    // Determinar nivel
    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  // ===== VALIDAR COMPATIBILIDAD DE ALIMENTOS =====
  validateFoodCompatibility(foodItem, userHealthData) {
    const incompatibilities = [];

    // Verificar alergias
    if (userHealthData.allergies) {
      userHealthData.allergies.forEach(allergyId => {
        const allergy = FOOD_ALLERGIES.find(a => a.id === allergyId);
        if (allergy && foodItem.allergens?.includes(allergyId)) {
          incompatibilities.push({
            type: 'allergy',
            severity: allergy.severity,
            reason: `Contiene ${allergy.name}`,
            alternatives: allergy.alternatives
          });
        }
      });
    }

    // Verificar restricciones dietéticas
    if (userHealthData.dietaryRestrictions) {
      userHealthData.dietaryRestrictions.forEach(restriction => {
        if (foodItem.restrictions?.includes(restriction.id)) {
          incompatibilities.push({
            type: 'restriction',
            severity: 'medium',
            reason: restriction.description
          });
        }
      });
    }

    return {
      isCompatible: incompatibilities.length === 0,
      incompatibilities
    };
  }

  // ===== GENERAR PERFIL NUTRICIONAL PARA MÓDULO 2 =====
  generateNutritionalProfile(healthData, userProfile) {
    return {
      userId: userProfile.uid,
      age: userProfile.age,
      gender: userProfile.gender,
      activityLevel: userProfile.activityLevel,
      
      // Condiciones médicas
      conditions: healthData.conditions,
      
      // Restricciones
      allergies: healthData.allergies,
      dietaryRestrictions: healthData.dietaryRestrictions.map(r => r.id),
      
      // Preferencias
      preferences: {
        vegetarian: healthData.preferences?.vegetarian || false,
        vegan: healthData.preferences?.vegan || false,
        dislikes: healthData.preferences?.dislikes || [],
        favorites: healthData.preferences?.favorites || []
      },
      
      // Métricas actuales
      currentWeight: userProfile.currentWeight,
      targetWeight: userProfile.targetWeight,
      height: userProfile.height,
      bmi: userProfile.bmi,
      
      // Objetivos
      goals: healthData.goals || [],
      
      // Requerimientos nutricionales calculados
      dailyCalories: this.calculateDailyCalories(userProfile, healthData),
      macronutrients: this.calculateMacronutrients(userProfile, healthData),
      
      // Metadata
      generatedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // ===== CALCULAR CALORÍAS DIARIAS =====
  calculateDailyCalories(userProfile, healthData) {
    // Fórmula de Harris-Benedict
    const { age, gender, height, currentWeight } = userProfile;
    
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * age);
    }

    // Factor de actividad
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    const tdee = bmr * (activityFactors[userProfile.activityLevel] || 1.2);

    // Ajustar según objetivo
    if (healthData.goals?.includes('weight_loss')) {
      return Math.round(tdee - 500); // Déficit de 500 cal
    } else if (healthData.goals?.includes('weight_gain')) {
      return Math.round(tdee + 300); // Superávit de 300 cal
    }

    return Math.round(tdee);
  }

  // ===== CALCULAR MACRONUTRIENTES =====
  calculateMacronutrients(userProfile, healthData) {
    const calories = this.calculateDailyCalories(userProfile, healthData);
    
    // Distribución por defecto
    let proteinPercent = 0.25;
    let carbPercent = 0.45;
    let fatPercent = 0.30;

    // Ajustar según condiciones
    if (healthData.conditions?.includes('diabetes_type2')) {
      carbPercent = 0.35; // Reducir carbohidratos
      proteinPercent = 0.30;
      fatPercent = 0.35;
    }

    if (healthData.goals?.includes('muscle_gain')) {
      proteinPercent = 0.35; // Aumentar proteína
      carbPercent = 0.40;
      fatPercent = 0.25;
    }

    return {
      protein: Math.round((calories * proteinPercent) / 4), // 4 cal/g
      carbs: Math.round((calories * carbPercent) / 4),
      fat: Math.round((calories * fatPercent) / 9), // 9 cal/g
      fiber: 25 // gramos recomendados
    };
  }
}

export default new HealthService();