// modules/user-management/utils/calculations.js
import { BMI_CATEGORIES } from '../constants/metrics';

// ===== CALCULAR IMC =====
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  return parseFloat(bmi.toFixed(1));
};

// ===== OBTENER CATEGORÍA DE IMC =====
export const getBMICategory = (bmi) => {
  if (!bmi) return null;
  
  for (const [key, category] of Object.entries(BMI_CATEGORIES)) {
    if (bmi >= category.min && bmi <= category.max) {
      return {
        key,
        ...category
      };
    }
  }
  
  return null;
};

// ===== CALCULAR PESO IDEAL =====
export const calculateIdealWeight = (height, gender) => {
  if (!height) return null;
  
  const heightInMeters = height / 100;
  
  // Fórmula de Lorentz
  let idealWeight;
  if (gender === 'male') {
    idealWeight = heightInMeters * 100 - 100 - ((heightInMeters * 100 - 150) / 4);
  } else {
    idealWeight = heightInMeters * 100 - 100 - ((heightInMeters * 100 - 150) / 2);
  }
  
  return parseFloat(idealWeight.toFixed(1));
};

// ===== CALCULAR RANGO DE PESO SALUDABLE =====
export const calculateHealthyWeightRange = (height) => {
  if (!height) return null;
  
  const heightInMeters = height / 100;
  const minBMI = 18.5;
  const maxBMI = 24.9;
  
  const minWeight = minBMI * heightInMeters * heightInMeters;
  const maxWeight = maxBMI * heightInMeters * heightInMeters;
  
  return {
    min: parseFloat(minWeight.toFixed(1)),
    max: parseFloat(maxWeight.toFixed(1))
  };
};

// ===== CALCULAR TMB (Tasa Metabólica Basal) =====
export const calculateBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age || !gender) return null;
  
  let bmr;
  
  // Fórmula de Harris-Benedict revisada
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  return Math.round(bmr);
};

// ===== CALCULAR TDEE (Gasto Energético Total Diario) =====
export const calculateTDEE = (bmr, activityLevel) => {
  if (!bmr) return null;
  
  const activityMultipliers = {
    sedentary: 1.2,      // Poco o ningún ejercicio
    light: 1.375,        // Ejercicio ligero 1-3 días/semana
    moderate: 1.55,      // Ejercicio moderado 3-5 días/semana
    active: 1.725,       // Ejercicio intenso 6-7 días/semana
    veryActive: 1.9      // Ejercicio muy intenso, trabajo físico
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
};

// ===== CALCULAR CALORÍAS PARA OBJETIVO =====
export const calculateCaloriesForGoal = (tdee, goal) => {
  if (!tdee) return null;
  
  const adjustments = {
    weight_loss: -500,      // Déficit de 500 cal (perder ~0.5kg/semana)
    weight_loss_fast: -750, // Déficit de 750 cal (perder ~0.75kg/semana)
    weight_maintain: 0,     // Mantener peso
    weight_gain: 300,       // Superávit de 300 cal (ganar ~0.25kg/semana)
    muscle_gain: 500        // Superávit de 500 cal (ganar masa muscular)
  };
  
  const adjustment = adjustments[goal] || 0;
  return Math.round(tdee + adjustment);
};

// ===== CALCULAR MACRONUTRIENTES =====
export const calculateMacros = (calories, goal, conditions = []) => {
  if (!calories) return null;
  
  let proteinPercent = 0.30;  // 30% proteína
  let carbPercent = 0.40;     // 40% carbohidratos
  let fatPercent = 0.30;      // 30% grasas
  
  // Ajustar según objetivo
  if (goal === 'muscle_gain') {
    proteinPercent = 0.35;
    carbPercent = 0.40;
    fatPercent = 0.25;
  } else if (goal === 'weight_loss') {
    proteinPercent = 0.35;
    carbPercent = 0.35;
    fatPercent = 0.30;
  }
  
  // Ajustar según condiciones médicas
  if (conditions.includes('diabetes_type2') || conditions.includes('prediabetes')) {
    carbPercent = 0.30;  // Reducir carbohidratos
    proteinPercent = 0.35;
    fatPercent = 0.35;
  }
  
  return {
    protein: Math.round((calories * proteinPercent) / 4), // 4 cal/g
    carbs: Math.round((calories * carbPercent) / 4),
    fat: Math.round((calories * fatPercent) / 9),         // 9 cal/g
    fiber: 25 // gramos recomendados al día
  };
};

// ===== CALCULAR AGUA DIARIA RECOMENDADA =====
export const calculateDailyWater = (weight, activityLevel) => {
  if (!weight) return null;
  
  // Fórmula básica: 30-35ml por kg de peso
  let baseWater = weight * 0.033; // 33ml por kg
  
  // Ajustar según actividad
  const activityAdjustment = {
    sedentary: 0,
    light: 0.3,
    moderate: 0.5,
    active: 0.7,
    veryActive: 1.0
  };
  
  const adjustment = activityAdjustment[activityLevel] || 0;
  const totalWater = baseWater + adjustment;
  
  return parseFloat(totalWater.toFixed(1));
};

// ===== CALCULAR ÍNDICE CINTURA-CADERA =====
export const calculateWaistToHipRatio = (waist, hip) => {
  if (!waist || !hip) return null;
  
  const ratio = waist / hip;
  return parseFloat(ratio.toFixed(2));
};

// ===== EVALUAR RIESGO POR CINTURA =====
export const evaluateWaistRisk = (waist, gender) => {
  if (!waist || !gender) return null;
  
  const risks = {
    male: {
      low: 94,
      high: 102
    },
    female: {
      low: 80,
      high: 88
    }
  };
  
  const genderRisks = risks[gender] || risks.female;
  
  if (waist < genderRisks.low) {
    return { level: 'low', label: 'Bajo Riesgo', color: '#4CAF50' };
  } else if (waist < genderRisks.high) {
    return { level: 'medium', label: 'Riesgo Moderado', color: '#FF9800' };
  } else {
    return { level: 'high', label: 'Alto Riesgo', color: '#F44336' };
  }
};

// ===== CALCULAR EDAD MÁXIMA DEL CORAZÓN =====
export const calculateMaxHeartRate = (age) => {
  if (!age) return null;
  return 220 - age;
};

// ===== CALCULAR ZONAS DE FRECUENCIA CARDÍACA =====
export const calculateHeartRateZones = (age) => {
  const maxHR = calculateMaxHeartRate(age);
  
  if (!maxHR) return null;
  
  return {
    resting: { min: 60, max: 100, label: 'Reposo' },
    warmup: { 
      min: Math.round(maxHR * 0.5), 
      max: Math.round(maxHR * 0.6), 
      label: 'Calentamiento (50-60%)' 
    },
    fatBurn: { 
      min: Math.round(maxHR * 0.6), 
      max: Math.round(maxHR * 0.7), 
      label: 'Quema de Grasa (60-70%)' 
    },
    cardio: { 
      min: Math.round(maxHR * 0.7), 
      max: Math.round(maxHR * 0.85), 
      label: 'Cardio (70-85%)' 
    },
    peak: { 
      min: Math.round(maxHR * 0.85), 
      max: maxHR, 
      label: 'Máximo (85-100%)' 
    }
  };
};

// ===== CALCULAR PROGRESO HACIA OBJETIVO =====
export const calculateProgress = (current, initial, target) => {
  if (!current || !initial || !target) return 0;
  
  const totalChange = target - initial;
  const currentChange = current - initial;
  
  if (totalChange === 0) return 100;
  
  const progress = (currentChange / totalChange) * 100;
  return Math.max(0, Math.min(100, progress)); // Entre 0 y 100
};

// ===== ESTIMAR TIEMPO PARA OBJETIVO DE PESO =====
export const estimateTimeToGoal = (currentWeight, targetWeight, weeklyRate = 0.5) => {
  if (!currentWeight || !targetWeight) return null;
  
  const totalWeightChange = Math.abs(targetWeight - currentWeight);
  const weeks = Math.ceil(totalWeightChange / weeklyRate);
  
  return {
    weeks,
    months: Math.ceil(weeks / 4),
    days: weeks * 7,
    isGain: targetWeight > currentWeight
  };
};

// ===== CALCULAR PORCENTAJE DE GRASA CORPORAL (estimado) =====
export const estimateBodyFat = (bmi, age, gender) => {
  if (!bmi || !age || !gender) return null;
  
  // Fórmula de Deurenberg
  let bodyFat;
  if (gender === 'male') {
    bodyFat = (1.20 * bmi) + (0.23 * age) - 16.2;
  } else {
    bodyFat = (1.20 * bmi) + (0.23 * age) - 5.4;
  }
  
  return parseFloat(Math.max(0, bodyFat).toFixed(1));
};

// ===== CALCULAR RIESGO CARDIOVASCULAR (simplificado) =====
export const calculateCardiovascularRisk = (data) => {
  const { age, gender, smoker, diabetes, hypertension, cholesterol, bmi } = data;
  
  let riskScore = 0;
  
  // Edad
  if (age > 65) riskScore += 3;
  else if (age > 55) riskScore += 2;
  else if (age > 45) riskScore += 1;
  
  // Género (hombres tienen mayor riesgo)
  if (gender === 'male') riskScore += 1;
  
  // Fumador
  if (smoker) riskScore += 3;
  
  // Condiciones
  if (diabetes) riskScore += 2;
  if (hypertension) riskScore += 2;
  if (cholesterol) riskScore += 1;
  
  // IMC
  if (bmi > 30) riskScore += 2;
  else if (bmi > 25) riskScore += 1;
  
  // Clasificar riesgo
  if (riskScore >= 8) return { level: 'high', label: 'Alto', color: '#F44336' };
  if (riskScore >= 5) return { level: 'medium', label: 'Moderado', color: '#FF9800' };
  return { level: 'low', label: 'Bajo', color: '#4CAF50' };
};