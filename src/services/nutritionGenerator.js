// Servicio para generar planes nutricionales personalizados

// Base de datos de alimentos andinos con información nutricional
const andeanFoods = {
  grains: [
    {
      id: 'quinoa_white',
      name: 'Quinua Blanca',
      category: 'grains',
      calories: 120,
      protein: 4.4,
      carbs: 21.3,
      fats: 1.9,
      fiber: 2.8,
      glycemicIndex: 53,
      benefits: ['Proteína completa', 'Sin gluten', 'Rico en minerales'],
      goodFor: ['diabetes', 'celiac', 'weight_loss'],
    },
    {
      id: 'kiwicha',
      name: 'Kiwicha',
      category: 'grains',
      calories: 102,
      protein: 3.8,
      carbs: 19,
      fats: 1.6,
      fiber: 2.1,
      glycemicIndex: 35,
      benefits: ['Alto en calcio', 'Sin gluten', 'Antioxidantes'],
      goodFor: ['hypertension', 'diabetes', 'bone_health'],
    },
    {
      id: 'canihua',
      name: 'Cañihua',
      category: 'grains',
      calories: 115,
      protein: 4.2,
      carbs: 20.5,
      fats: 2.1,
      fiber: 3.2,
      glycemicIndex: 40,
      benefits: ['Alto en hierro', 'Proteína de calidad', 'Antioxidantes'],
      goodFor: ['anemia', 'diabetes', 'energy'],
    },
  ],
  legumes: [
    {
      id: 'tarwi',
      name: 'Tarwi',
      category: 'legumes',
      calories: 140,
      protein: 11.5,
      carbs: 15.3,
      fats: 4.2,
      fiber: 7.1,
      glycemicIndex: 25,
      benefits: ['Muy alto en proteína', 'Bajo índice glucémico', 'Saciante'],
      goodFor: ['diabetes', 'cholesterol', 'weight_loss', 'muscle_gain'],
    },
  ],
  roots: [
    {
      id: 'maca',
      name: 'Maca',
      category: 'roots',
      calories: 91,
      protein: 2.2,
      carbs: 20,
      fats: 0.6,
      fiber: 2.2,
      glycemicIndex: 50,
      benefits: ['Energizante', 'Adaptógeno', 'Mejora rendimiento'],
      goodFor: ['energy', 'hormonal_balance', 'athletic_performance'],
    },
    {
      id: 'yacon',
      name: 'Yacón',
      category: 'roots',
      calories: 35,
      protein: 0.4,
      carbs: 7.8,
      fats: 0.1,
      fiber: 1.5,
      glycemicIndex: 15,
      benefits: ['Prebiótico', 'Bajo en calorías', 'Regula azúcar en sangre'],
      goodFor: ['diabetes', 'weight_loss', 'digestive_health'],
    },
  ],
  vegetables: [
    {
      id: 'spinach',
      name: 'Espinaca',
      category: 'vegetables',
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fats: 0.4,
      fiber: 2.2,
      glycemicIndex: 15,
      benefits: ['Rico en hierro', 'Antioxidantes', 'Bajo en calorías'],
      goodFor: ['anemia', 'hypertension', 'weight_loss'],
    },
  ],
  fruits: [
    {
      id: 'aguaymanto',
      name: 'Aguaymanto',
      category: 'fruits',
      calories: 53,
      protein: 1.9,
      carbs: 11.2,
      fats: 0.7,
      fiber: 4.9,
      glycemicIndex: 30,
      benefits: ['Alto en vitamina C', 'Antioxidantes', 'Antiinflamatorio'],
      goodFor: ['immunity', 'diabetes', 'cholesterol'],
    },
  ],
};

// Cálculo de requerimientos calóricos según Harris-Benedict
export const calculateDailyCalories = (profile) => {
  const { age, gender, weight, height, activityLevel, goals } = profile;
  
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // Factores de actividad
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

  // Ajustes según objetivos
  let targetCalories = tdee;
  if (goals.includes('lose_weight')) {
    targetCalories = tdee - 500; // Déficit de 500 cal
  } else if (goals.includes('gain_weight')) {
    targetCalories = tdee + 500; // Superávit de 500 cal
  }

  return Math.round(targetCalories);
};

// Cálculo de macronutrientes
export const calculateMacros = (calories, healthConditions, goals) => {
  let proteinPercent = 0.25; // 25% default
  let carbsPercent = 0.45; // 45% default
  let fatsPercent = 0.30; // 30% default

  // Ajustes para diabetes
  if (healthConditions.includes('diabetes')) {
    proteinPercent = 0.30;
    carbsPercent = 0.35;
    fatsPercent = 0.35;
  }

  // Ajustes para colesterol alto
  if (healthConditions.includes('cholesterol')) {
    proteinPercent = 0.25;
    carbsPercent = 0.50;
    fatsPercent = 0.25;
  }

  // Ajustes para hipertensión
  if (healthConditions.includes('hypertension')) {
    proteinPercent = 0.20;
    carbsPercent = 0.50;
    fatsPercent = 0.30;
  }

  // Ajustes para objetivos
  if (goals.includes('gain_weight') || goals.includes('muscle_gain')) {
    proteinPercent = 0.35;
    carbsPercent = 0.40;
    fatsPercent = 0.25;
  }

  return {
    protein: Math.round((calories * proteinPercent) / 4), // 4 cal/g
    carbs: Math.round((calories * carbsPercent) / 4), // 4 cal/g
    fats: Math.round((calories * fatsPercent) / 9), // 9 cal/g
  };
};

// Seleccionar alimentos apropiados según condiciones de salud
export const selectFoodsForConditions = (healthConditions) => {
  const allFoods = [
    ...andeanFoods.grains,
    ...andeanFoods.legumes,
    ...andeanFoods.roots,
    ...andeanFoods.vegetables,
    ...andeanFoods.fruits,
  ];

  if (healthConditions.includes('none') || healthConditions.length === 0) {
    return allFoods;
  }

  // Filtrar alimentos buenos para las condiciones específicas
  const recommendedFoods = allFoods.filter(food => {
    return healthConditions.some(condition => 
      food.goodFor.includes(condition)
    );
  });

  return recommendedFoods.length > 0 ? recommendedFoods : allFoods;
};

// Generar plan de comidas diario
export const generateDailyMealPlan = (profile) => {
  const { healthConditions, goals } = profile;
  const targetCalories = calculateDailyCalories(profile);
  const macros = calculateMacros(targetCalories, healthConditions, goals);
  
  // Distribución de calorías por comida
  const calorieDistribution = {
    breakfast: 0.25, // 25%
    snack1: 0.10, // 10%
    lunch: 0.35, // 35%
    snack2: 0.10, // 10%
    dinner: 0.20, // 20%
  };

  const recommendedFoods = selectFoodsForConditions(healthConditions);

  const meals = [
    {
      id: 1,
      type: 'Desayuno',
      time: '08:00 AM',
      targetCalories: Math.round(targetCalories * calorieDistribution.breakfast),
      foods: selectMealFoods(recommendedFoods, 'breakfast', healthConditions),
    },
    {
      id: 2,
      type: 'Snack Mañana',
      time: '11:00 AM',
      targetCalories: Math.round(targetCalories * calorieDistribution.snack1),
      foods: selectMealFoods(recommendedFoods, 'snack', healthConditions),
    },
    {
      id: 3,
      type: 'Almuerzo',
      time: '01:00 PM',
      targetCalories: Math.round(targetCalories * calorieDistribution.lunch),
      foods: selectMealFoods(recommendedFoods, 'lunch', healthConditions),
    },
    {
      id: 4,
      type: 'Snack Tarde',
      time: '04:00 PM',
      targetCalories: Math.round(targetCalories * calorieDistribution.snack2),
      foods: selectMealFoods(recommendedFoods, 'snack', healthConditions),
    },
    {
      id: 5,
      type: 'Cena',
      time: '07:00 PM',
      targetCalories: Math.round(targetCalories * calorieDistribution.dinner),
      foods: selectMealFoods(recommendedFoods, 'dinner', healthConditions),
    },
  ];

  return {
    date: new Date().toISOString(),
    targetCalories,
    macros,
    meals,
    waterIntake: calculateWaterIntake(profile.weight),
  };
};

// Seleccionar alimentos para cada comida
const selectMealFoods = (foods, mealType, conditions) => {
  // Lógica simplificada - en producción, esto sería más sofisticado
  const grains = foods.filter(f => f.category === 'grains');
  const legumes = foods.filter(f => f.category === 'legumes');
  const roots = foods.filter(f => f.category === 'roots');

  if (mealType === 'breakfast') {
    return [
      grains[Math.floor(Math.random() * grains.length)],
      roots[0], // Maca para energía
    ];
  } else if (mealType === 'lunch') {
    return [
      grains[Math.floor(Math.random() * grains.length)],
      legumes[0],
    ];
  } else if (mealType === 'dinner') {
    return [
      grains[Math.floor(Math.random() * grains.length)],
    ];
  } else {
    // Snacks
    return [roots[Math.floor(Math.random() * roots.length)]];
  }
};

// Calcular ingesta de agua recomendada
const calculateWaterIntake = (weight) => {
  // 35ml por kg de peso corporal
  return Math.round((weight * 35) / 1000 * 10) / 10; // Litros
};

// Generar plan semanal
export const generateWeeklyPlan = (profile) => {
  const weekPlan = [];
  
  for (let i = 0; i < 7; i++) {
    const dayPlan = generateDailyMealPlan(profile);
    dayPlan.dayOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][i];
    weekPlan.push(dayPlan);
  }
  
  return weekPlan;
};

// Validar si el plan cumple con restricciones médicas
export const validatePlanForConditions = (plan, conditions) => {
  const warnings = [];
  
  if (conditions.includes('diabetes')) {
    const avgGlycemicIndex = calculateAverageGI(plan);
    if (avgGlycemicIndex > 55) {
      warnings.push('Índice glucémico promedio alto. Considera más alimentos de bajo IG.');
    }
  }
  
  if (conditions.includes('hypertension')) {
    warnings.push('Recuerda limitar el consumo de sal a menos de 5g diarios.');
  }
  
  if (conditions.includes('cholesterol')) {
    warnings.push('Evita grasas saturadas y trans. Prioriza grasas saludables.');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
  };
};

const calculateAverageGI = (plan) => {
  // Cálculo simplificado del índice glucémico promedio
  let totalGI = 0;
  let count = 0;
  
  plan.meals.forEach(meal => {
    meal.foods.forEach(food => {
      totalGI += food.glycemicIndex;
      count++;
    });
  });
  
  return count > 0 ? totalGI / count : 50;
};

// Obtener recomendaciones personalizadas
export const getPersonalizedRecommendations = (profile) => {
  const recommendations = [];
  
  if (profile.healthConditions.includes('diabetes')) {
    recommendations.push({
      title: 'Control de Glucosa',
      description: 'Prioriza alimentos de bajo índice glucémico como quinua, kiwicha y yacón.',
      icon: 'water-alert',
      priority: 'high',
    });
  }
  
  if (profile.healthConditions.includes('hypertension')) {
    recommendations.push({
      title: 'Control de Presión',
      description: 'Reduce el consumo de sal y aumenta alimentos ricos en potasio.',
      icon: 'heart-pulse',
      priority: 'high',
    });
  }
  
  if (profile.healthConditions.includes('cholesterol')) {
    recommendations.push({
      title: 'Colesterol Saludable',
      description: 'Incluye tarwi y quinua, ricos en fibra soluble que ayuda a reducir el colesterol.',
      icon: 'blood-bag',
      priority: 'medium',
    });
  }
  
  if (profile.goals.includes('lose_weight')) {
    recommendations.push({
      title: 'Pérdida de Peso',
      description: 'Mantén un déficit calórico moderado y prioriza alimentos saciantes como el tarwi.',
      icon: 'trending-down',
      priority: 'medium',
    });
  }
  
  if (profile.goals.includes('energy')) {
    recommendations.push({
      title: 'Más Energía',
      description: 'La maca es un excelente energizante natural. Consúmela en las mañanas.',
      icon: 'lightning-bolt',
      priority: 'medium',
    });
  }
  
  return recommendations;
};

// Exportar base de datos de alimentos para uso en otros componentes
export { andeanFoods };
