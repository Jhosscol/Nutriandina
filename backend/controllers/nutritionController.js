// backend/controllers/nutritionController.js
const NutritionPlan = require('../models/NutritionPlan');
const Recipe = require('../models/Recipe');
const Food = require('../models/Food');
const mongoose = require('mongoose');

// Importar o definir el modelo de perfil de salud
// Ajusta según tu estructura
const PerfilSalud = mongoose.model('perfiles_salud');

// ============= UTILIDADES =============

/**
 * Calcula los objetivos nutricionales basados en el perfil de salud
 */
const calculateNutritionalGoals = (profile) => {
  const weight = profile.peso;
  const height = profile.altura;
  const age = profile.edad;
  const gender = profile.genero;
  const activityLevel = profile.nivelActividad;
  
  // Calcular TMB (Tasa Metabólica Basal) usando fórmula de Harris-Benedict
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // Factores de actividad
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const activityFactor = activityFactors[activityLevel] || 1.2;
  const dailyCalories = Math.round(bmr * activityFactor);
  
  // Ajustar según objetivos
  let calorieAdjustment = 0;
  if (profile.preferencias?.objetivosSalud) {
    const goals = profile.preferencias.objetivosSalud;
    if (goals.includes('weight_loss') || goals.includes('perder_peso')) {
      calorieAdjustment = -500;
    } else if (goals.includes('muscle_gain') || goals.includes('ganar_musculo')) {
      calorieAdjustment = 300;
    }
  }
  
  const adjustedCalories = dailyCalories + calorieAdjustment;
  
  return {
    dailyCalories: adjustedCalories,
    protein: Math.round((adjustedCalories * 0.25) / 4),
    carbohydrates: Math.round((adjustedCalories * 0.50) / 4),
    fat: Math.round((adjustedCalories * 0.25) / 9),
    fiber: 30,
    sodium: 2300
  };
};

/**
 * Filtra recetas según el perfil del usuario
 */
const filterRecipesByProfile = (recipes, profile) => {
  return recipes.filter(recipe => {
    // Filtrar por alergias
    if (profile.alergiasAlimentarias?.length > 0) {
      const hasAllergen = recipe.allergens?.some(allergen => 
        profile.alergiasAlimentarias.includes(allergen)
      );
      if (hasAllergen) return false;
    }
    
    // Filtrar por preferencias vegetarianas/veganas
    if (profile.preferencias?.vegetariano && !recipe.isVegetarian) {
      return false;
    }
    if (profile.preferencias?.vegano && !recipe.isVegan) {
      return false;
    }
    
    // Filtrar alimentos que no le gustan
    if (profile.preferencias?.alimentosEvitar?.length > 0) {
      const hasDislikedFood = recipe.ingredients?.some(ing => 
        profile.preferencias.alimentosEvitar.some(dislike => 
          ing.foodName?.toLowerCase().includes(dislike.toLowerCase())
        )
      );
      if (hasDislikedFood) return false;
    }
    
    return true;
  });
};

/**
 * Selecciona una receta aleatoria de una categoría
 */
const selectRandomRecipe = (recipes, mealType, usedRecipes = new Set()) => {
  const availableRecipes = recipes.filter(r => 
    r.mealType === mealType && !usedRecipes.has(r._id.toString())
  );
  
  if (availableRecipes.length === 0) {
    const allRecipes = recipes.filter(r => r.mealType === mealType);
    if (allRecipes.length === 0) return null;
    return allRecipes[Math.floor(Math.random() * allRecipes.length)];
  }
  
  return availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
};

/**
 * Genera menús diarios
 */
const generateDailyMenus = async (duration, nutritionalGoals, profile) => {
  const allRecipes = await Recipe.find({ isActive: true });
  const suitableRecipes = filterRecipesByProfile(allRecipes, profile);
  
  if (suitableRecipes.length < 3) {
    throw new Error('No hay suficientes recetas disponibles para tu perfil.');
  }
  
  const dailyMenus = [];
  const usedRecipes = new Set();
  const startDate = new Date();
  
  for (let day = 1; day <= duration; day++) {
    if (day % 7 === 1) usedRecipes.clear();
    
    const breakfast = selectRandomRecipe(suitableRecipes, 'breakfast', usedRecipes);
    const lunch = selectRandomRecipe(suitableRecipes, 'lunch', usedRecipes);
    const dinner = selectRandomRecipe(suitableRecipes, 'dinner', usedRecipes);
    
    if (breakfast) usedRecipes.add(breakfast._id.toString());
    if (lunch) usedRecipes.add(lunch._id.toString());
    if (dinner) usedRecipes.add(dinner._id.toString());
    
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + (day - 1));
    
    const dayMenu = {
      day,
      date: dayDate,
      meals: {
        breakfast: breakfast ? {
          recipeId: breakfast._id,
          recipeName: breakfast.name,
          servings: 1,
          nutrition: {
            calories: breakfast.totalNutrition?.calories || 0,
            protein: breakfast.totalNutrition?.protein || 0,
            carbohydrates: breakfast.totalNutrition?.carbohydrates || 0,
            fat: breakfast.totalNutrition?.fat || 0
          }
        } : null,
        lunch: lunch ? {
          recipeId: lunch._id,
          recipeName: lunch.name,
          servings: 1,
          nutrition: {
            calories: lunch.totalNutrition?.calories || 0,
            protein: lunch.totalNutrition?.protein || 0,
            carbohydrates: lunch.totalNutrition?.carbohydrates || 0,
            fat: lunch.totalNutrition?.fat || 0
          }
        } : null,
        dinner: dinner ? {
          recipeId: dinner._id,
          recipeName: dinner.name,
          servings: 1,
          nutrition: {
            calories: dinner.totalNutrition?.calories || 0,
            protein: dinner.totalNutrition?.protein || 0,
            carbohydrates: dinner.totalNutrition?.carbohydrates || 0,
            fat: dinner.totalNutrition?.fat || 0
          }
        } : null,
        snacks: []
      }
    };
    
    dayMenu.totalNutrition = {
      calories: 
        (dayMenu.meals.breakfast?.nutrition.calories || 0) +
        (dayMenu.meals.lunch?.nutrition.calories || 0) +
        (dayMenu.meals.dinner?.nutrition.calories || 0),
      protein: 
        (dayMenu.meals.breakfast?.nutrition.protein || 0) +
        (dayMenu.meals.lunch?.nutrition.protein || 0) +
        (dayMenu.meals.dinner?.nutrition.protein || 0),
      carbohydrates: 
        (dayMenu.meals.breakfast?.nutrition.carbohydrates || 0) +
        (dayMenu.meals.lunch?.nutrition.carbohydrates || 0) +
        (dayMenu.meals.dinner?.nutrition.carbohydrates || 0),
      fat: 
        (dayMenu.meals.breakfast?.nutrition.fat || 0) +
        (dayMenu.meals.lunch?.nutrition.fat || 0) +
        (dayMenu.meals.dinner?.nutrition.fat || 0),
      fiber: 0
    };
    
    dailyMenus.push(dayMenu);
  }
  
  return dailyMenus;
};

/**
 * Genera listas de compras semanales
 */
const generateShoppingLists = async (dailyMenus, duration) => {
  const weeksCount = Math.ceil(duration / 7);
  const shoppingLists = [];
  
  for (let week = 1; week <= weeksCount; week++) {
    const startDay = (week - 1) * 7 + 1;
    const endDay = Math.min(week * 7, duration);
    
    const weekMenus = dailyMenus.filter(menu => 
      menu.day >= startDay && menu.day <= endDay
    );
    
    const ingredientsMap = new Map();
    
    for (const menu of weekMenus) {
      const meals = [menu.meals.breakfast, menu.meals.lunch, menu.meals.dinner];
      
      for (const meal of meals) {
        if (!meal?.recipeId) continue;
        
        try {
          const recipe = await Recipe.findById(meal.recipeId);
          
          if (recipe?.ingredients) {
            for (const ingredient of recipe.ingredients) {
              const foodId = ingredient.foodId?.toString();
              const foodName = ingredient.foodName;
              
              if (foodId && foodName) {
                if (ingredientsMap.has(foodId)) {
                  const existing = ingredientsMap.get(foodId);
                  existing.totalQuantity += ingredient.quantity * (meal.servings || 1);
                } else {
                  ingredientsMap.set(foodId, {
                    foodId,
                    foodName,
                    totalQuantity: ingredient.quantity * (meal.servings || 1),
                    unit: ingredient.unit || 'g',
                    category: ingredient.category || 'Otros'
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('Error procesando receta:', error);
        }
      }
    }
    
    shoppingLists.push({
      week,
      items: Array.from(ingredientsMap.values())
    });
  }
  
  return shoppingLists;
};

// ============= CONTROLADORES =============

/**
 * Generar plan nutricional personalizado
 */
exports.generateNutritionPlan = async (req, res) => {
  try {
    const { duration = 30 } = req.body;
    const userId = req.user.uid; // Firebase UID
    
    console.log('🟢 Generando plan para usuario:', userId);
    
    // Verificar plan activo existente
    const existingPlan = await NutritionPlan.findOne({ 
      userId, 
      status: 'active' 
    });
    
    if (existingPlan) {
      return res.status(400).json({ 
        error: 'Ya tienes un plan activo. Cancélalo primero.' 
      });
    }
    
    // Obtener perfil de salud
    const healthProfile = await PerfilSalud.findOne({ userId });
    
    if (!healthProfile) {
      return res.status(404).json({ 
        error: 'Debes completar tu perfil de salud antes de generar un plan.' 
      });
    }
    
    console.log('✅ Perfil de salud encontrado');
    
    // Calcular objetivos nutricionales
    const nutritionalGoals = calculateNutritionalGoals(healthProfile);
    console.log('✅ Objetivos calculados:', nutritionalGoals);
    
    // Generar menús diarios
    console.log('📝 Generando menús...');
    const dailyMenus = await generateDailyMenus(duration, nutritionalGoals, healthProfile);
    console.log(`✅ ${dailyMenus.length} menús generados`);
    
    // Generar listas de compras
    console.log('🛒 Generando listas de compras...');
    const shoppingLists = await generateShoppingLists(dailyMenus, duration);
    console.log(`✅ ${shoppingLists.length} listas generadas`);
    
    // Crear el plan
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
    
    const plan = await NutritionPlan.create({
      userId,
      userProfile: {
        age: healthProfile.edad,
        gender: healthProfile.genero,
        weight: healthProfile.peso,
        height: healthProfile.altura,
        bmi: healthProfile.imc,
        activityLevel: healthProfile.nivelActividad,
        smoker: healthProfile.fumador,
        conditions: healthProfile.condicionesSalud || [],
        allergies: healthProfile.alergiasAlimentarias || [],
        preferences: healthProfile.preferencias || {}
      },
      nutritionalGoals,
      planType: duration === 7 ? 'semanal' : 'mensual',
      duration,
      startDate,
      endDate,
      dailyMenus,
      weeklyShoppingLists: shoppingLists,
      status: 'active',
      progress: {
        completedDays: 0,
        adherence: 0
      }
    });
    
    console.log('🎉 Plan creado:', plan._id);
    
    res.status(201).json({
      success: true,
      message: 'Plan generado exitosamente',
      data: plan
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: error.message 
    });
  }
};

/**
 * Obtener plan activo
 */
exports.getActivePlan = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const plan = await NutritionPlan.findOne({ 
      userId, 
      status: 'active' 
    });
    
    if (!plan) {
      return res.status(404).json({ 
        error: 'No tienes un plan activo' 
      });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener menú de un día específico
 */
exports.getDailyMenu = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { day } = req.params;
    
    const plan = await NutritionPlan.findOne({ userId, status: 'active' });
    
    if (!plan) {
      return res.status(404).json({ error: 'No hay plan activo' });
    }
    
    const menu = plan.dailyMenus.find(m => m.day === parseInt(day));
    
    if (!menu) {
      return res.status(404).json({ error: 'Menú no encontrado' });
    }
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Marcar día como completado
 */
exports.markDayCompleted = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { day } = req.params;
    
    const plan = await NutritionPlan.findOne({ userId, status: 'active' });
    
    if (!plan) {
      return res.status(404).json({ error: 'No hay plan activo' });
    }
    
    plan.progress.completedDays += 1;
    plan.progress.adherence = (plan.progress.completedDays / plan.duration) * 100;
    
    await plan.save();
    
    res.json({ 
      success: true, 
      progress: plan.progress 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Agregar esta función en backend/controllers/nutritionController.js

exports.unmarkDayCompleted = async (req, res) => {
  try {
    const { day } = req.params;
    const userId = req.user._id;

    // Buscar el plan activo del usuario
    const plan = await NutritionPlan.findOne({ 
      userId, 
      status: 'active' 
    });

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        message: 'No se encontró un plan activo' 
      });
    }

    const dayNumber = parseInt(day);

    // Validar que el día esté en el rango del plan
    if (dayNumber < 1 || dayNumber > plan.duration) {
      return res.status(400).json({ 
        success: false,
        message: `El día debe estar entre 1 y ${plan.duration}` 
      });
    }

    // Verificar si el día está en la lista de completados
    if (!plan.progress.completedDaysList || !plan.progress.completedDaysList.includes(dayNumber)) {
      return res.status(400).json({ 
        success: false,
        message: 'Este día no está marcado como completado' 
      });
    }

    // Remover el día de la lista de completados
    plan.progress.completedDaysList = plan.progress.completedDaysList.filter(
      d => d !== dayNumber
    );

    // Decrementar contador de días completados
    if (plan.progress.completedDays > 0) {
      plan.progress.completedDays -= 1;
    }

    // Recalcular adherencia
    const totalDays = plan.duration;
    plan.progress.adherence = plan.progress.completedDays > 0 
      ? (plan.progress.completedDays / totalDays) * 100 
      : 0;

    // Guardar cambios
    await plan.save();

    res.json({
      success: true,
      message: 'Día desmarcado exitosamente',
      data: {
        day: dayNumber,
        progress: {
          completedDays: plan.progress.completedDays,
          adherence: plan.progress.adherence,
          completedDaysList: plan.progress.completedDaysList
        }
      }
    });

  } catch (error) {
    console.error('Error al desmarcar día:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al desmarcar el día',
      error: error.message 
    });
  }
};
/**
 * Obtener lista de compras semanal
 */
exports.getWeeklyShoppingList = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { week } = req.params;
    
    const plan = await NutritionPlan.findOne({ userId, status: 'active' });
    
    if (!plan) {
      return res.status(404).json({ error: 'No hay plan activo' });
    }
    
    const shoppingList = plan.weeklyShoppingLists.find(
      list => list.week === parseInt(week)
    );
    
    if (!shoppingList) {
      return res.json({ week: parseInt(week), items: [] });
    }
    
    res.json(shoppingList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todas las recetas
 */
/**
 * Obtener todas las recetas
 */
exports.getAllRecipes = async (req, res) => {
  try {
    console.log('📖 Obteniendo recetas...');
    
    // Obtener recetas SIN populate para evitar errores de ObjectId
    const recipes = await Recipe.find({ isActive: true })
      .select('-__v') // Excluir campo __v
      .lean(); // Convertir a objetos JS planos (más rápido)
    
    console.log(`✅ ${recipes.length} recetas encontradas`);
    
    res.json(recipes);
  } catch (error) {
    console.error('❌ Error al obtener recetas:', error);
    res.status(500).json({ 
      error: 'Error al obtener recetas',
      message: error.message 
    });
  }
};

/**
 * Obtener receta por ID
 */
/**
 * Obtener receta por ID
 */
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📖 Buscando receta:', id);
    
    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('❌ ID inválido:', id);
      return res.status(400).json({ 
        error: 'ID de receta inválido',
        message: 'El formato del ID no es correcto' 
      });
    }
    
    // Buscar sin populate
    const recipe = await Recipe.findById(id).lean();
    
    if (!recipe) {
      console.error('❌ Receta no encontrada:', id);
      return res.status(404).json({ 
        error: 'Receta no encontrada',
        message: 'No existe una receta con ese ID'
      });
    }
    
    console.log('✅ Receta encontrada:', recipe.name);
    res.json(recipe);
  } catch (error) {
    console.error('❌ Error al obtener receta:', error);
    res.status(500).json({ 
      error: 'Error al obtener documento',
      message: error.message 
    });
  }
};

/**
 * Ajustar porciones de receta
 */
exports.adjustRecipeServings = async (req, res) => {
  try {
    const { servings } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }
    
    const multiplier = servings / recipe.servings;
    
    const adjusted = {
      ...recipe.toObject(),
      servings,
      totalNutrition: {
        calories: Math.round(recipe.totalNutrition.calories * multiplier),
        protein: Math.round(recipe.totalNutrition.protein * multiplier * 10) / 10,
        carbohydrates: Math.round(recipe.totalNutrition.carbohydrates * multiplier * 10) / 10,
        fat: Math.round(recipe.totalNutrition.fat * multiplier * 10) / 10
      },
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        quantity: Math.round(ing.quantity * multiplier * 10) / 10
      }))
    };
    
    res.json(adjusted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todos los alimentos
 */
exports.getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Calculadora nutricional
 */
exports.calculateNutrition = async (req, res) => {
  try {
    const { items } = req.body;
    
    let total = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sodium: 0
    };
    
    for (const item of items) {
      const food = await Food.findById(item.foodId);
      if (food) {
        const multiplier = item.quantity / 100;
        total.calories += food.nutritionalInfo.calories * multiplier;
        total.protein += food.nutritionalInfo.protein * multiplier;
        total.carbohydrates += food.nutritionalInfo.carbohydrates * multiplier;
        total.fat += food.nutritionalInfo.fat * multiplier;
        total.fiber += (food.nutritionalInfo.fiber || 0) * multiplier;
        total.sodium += (food.nutritionalInfo.sodium || 0) * multiplier;
      }
    }
    
    Object.keys(total).forEach(key => {
      total[key] = Math.round(total[key] * 10) / 10;
    });
    
    res.json(total);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};