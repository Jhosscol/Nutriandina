// backend/services/nutritionAlgorithm.js
const Recipe = require('../models/Recipe');

class NutritionAlgorithm {
  
  // Calcular TMB (Tasa Metabólica Basal) usando la fórmula de Harris-Benedict
  calculateBMR(weight, height, age, gender) {
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  }

  // Calcular gasto calórico total según nivel de actividad
  calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
      sedentary: 1.2,      // Poco o ningún ejercicio
      light: 1.375,        // Ejercicio ligero 1-3 días/semana
      moderate: 1.55,      // Ejercicio moderado 3-5 días/semana
      active: 1.725,       // Ejercicio intenso 6-7 días/semana
      very_active: 1.9     // Ejercicio muy intenso, trabajo físico
    };
    return bmr * (activityMultipliers[activityLevel] || 1.2);
  }

  // Ajustar calorías según objetivos de salud
  adjustCaloriesForGoals(tdee, goals) {
    let calorieAdjustment = 0;
    
    if (goals.includes('weight_loss')) {
      calorieAdjustment = -500; // Déficit de 500 cal para perder ~0.5kg/semana
    } else if (goals.includes('muscle_gain')) {
      calorieAdjustment = 300; // Superávit de 300 cal para ganar masa muscular
    }
    
    return Math.round(tdee + calorieAdjustment);
  }

  // Calcular distribución de macronutrientes
  calculateMacros(dailyCalories, goals, conditions) {
    let proteinPercent = 0.25;  // 25% por defecto
    let carbPercent = 0.45;     // 45% por defecto
    let fatPercent = 0.30;      // 30% por defecto

    // Ajustar según objetivos
    if (goals.includes('muscle_gain')) {
      proteinPercent = 0.30;
      carbPercent = 0.40;
      fatPercent = 0.30;
    } else if (goals.includes('weight_loss')) {
      proteinPercent = 0.30;
      carbPercent = 0.35;
      fatPercent = 0.35;
    }

    // Ajustar según condiciones médicas
    if (conditions.includes('diabetes')) {
      carbPercent = 0.35;  // Reducir carbohidratos
      proteinPercent = 0.30;
      fatPercent = 0.35;
    }

    if (conditions.includes('highCholesterol')) {
      fatPercent = 0.25;   // Reducir grasas
      proteinPercent = 0.30;
      carbPercent = 0.45;
    }

    return {
      protein: Math.round((dailyCalories * proteinPercent) / 4), // 4 cal por gramo
      carbohydrates: Math.round((dailyCalories * carbPercent) / 4),
      fat: Math.round((dailyCalories * fatPercent) / 9), // 9 cal por gramo
      fiber: 30, // Recomendación general: 25-35g/día
      sodium: conditions.includes('hypertension') ? 1500 : 2300 // mg/día
    };
  }

  // Filtrar recetas según perfil de usuario
  async filterRecipesByProfile(userProfile) {
    const { conditions, allergies, preferences } = userProfile;
    
    const query = {
      isActive: true
    };

    // Filtrar por condiciones médicas
    if (conditions && conditions.length > 0) {
      conditions.forEach(condition => {
        const conditionMap = {
          diabetes: 'restrictions.diabetes',
          hypertension: 'restrictions.hypertension',
          highCholesterol: 'restrictions.highCholesterol',
          celiac: 'restrictions.celiac'
        };
        
        if (conditionMap[condition]) {
          query[conditionMap[condition]] = false;
        }
      });
    }

    // Filtrar por alergias
    if (allergies && allergies.length > 0) {
      query.allergens = { $nin: allergies };
    }

    // Filtrar por preferencias dietéticas
    if (preferences) {
      if (preferences.vegetarian) {
        query['diets.vegetarian'] = true;
      }
      if (preferences.vegan) {
        query['diets.vegan'] = true;
      }
    }

    const recipes = await Recipe.find(query).populate('ingredients.foodId');
    return recipes;
  }

  // Seleccionar recetas para un día específico
  selectDailyRecipes(availableRecipes, targetCalories, day) {
    const breakfast = availableRecipes.filter(r => r.category === 'desayuno');
    const lunch = availableRecipes.filter(r => r.category === 'almuerzo');
    const dinner = availableRecipes.filter(r => r.category === 'cena');
    const snacks = availableRecipes.filter(r => r.category === 'snack');

    // Distribución calórica típica
    const breakfastCalories = targetCalories * 0.25;  // 25%
    const lunchCalories = targetCalories * 0.35;      // 35%
    const dinnerCalories = targetCalories * 0.30;     // 30%
    const snackCalories = targetCalories * 0.10;      // 10%

    // Seleccionar recetas cercanas al objetivo calórico
    const selectedBreakfast = this.selectClosestRecipe(breakfast, breakfastCalories, day);
    const selectedLunch = this.selectClosestRecipe(lunch, lunchCalories, day);
    const selectedDinner = this.selectClosestRecipe(dinner, dinnerCalories, day);
    const selectedSnack = this.selectClosestRecipe(snacks, snackCalories, day);

    return {
      breakfast: selectedBreakfast,
      lunch: selectedLunch,
      dinner: selectedDinner,
      snacks: selectedSnack ? [selectedSnack] : []
    };
  }

  // Seleccionar la receta más cercana al objetivo calórico
  selectClosestRecipe(recipes, targetCalories, day) {
    if (!recipes || recipes.length === 0) return null;
    
    // Usar el día como semilla para variar la selección
    const index = day % recipes.length;
    const recipe = recipes[index];

    // Ajustar porciones para acercarse al objetivo calórico
    const servings = Math.max(1, Math.round(targetCalories / recipe.totalNutrition.calories));

    return {
      recipeId: recipe._id,
      recipeName: recipe.name,
      servings: servings,
      nutrition: {
        calories: recipe.totalNutrition.calories * servings,
        protein: recipe.totalNutrition.protein * servings,
        carbohydrates: recipe.totalNutrition.carbohydrates * servings,
        fat: recipe.totalNutrition.fat * servings
      }
    };
  }

  // Generar plan nutricional completo
  async generateNutritionPlan(userProfile, duration = 30) {
    const { age, gender, weight, height, activityLevel, conditions, allergies, preferences } = userProfile;

    // 1. Calcular necesidades calóricas
    const bmr = this.calculateBMR(weight, height, age, gender);
    const tdee = this.calculateTDEE(bmr, activityLevel);
    const dailyCalories = this.adjustCaloriesForGoals(tdee, preferences.selectedGoals || []);

    // 2. Calcular macros
    const macros = this.calculateMacros(dailyCalories, preferences.selectedGoals || [], conditions || []);

    // 3. Filtrar recetas apropiadas
    const availableRecipes = await this.filterRecipesByProfile(userProfile);

    if (availableRecipes.length < 4) {
      throw new Error('No hay suficientes recetas disponibles para tu perfil');
    }

    // 4. Generar menú diario para cada día
    const dailyMenus = [];
    const today = new Date();

    for (let day = 1; day <= duration; day++) {
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + day - 1);

      const meals = this.selectDailyRecipes(availableRecipes, dailyCalories, day);

      // Calcular nutrición total del día
      const totalNutrition = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0
      };

      if (meals.breakfast) {
        totalNutrition.calories += meals.breakfast.nutrition.calories;
        totalNutrition.protein += meals.breakfast.nutrition.protein;
        totalNutrition.carbohydrates += meals.breakfast.nutrition.carbohydrates;
        totalNutrition.fat += meals.breakfast.nutrition.fat;
      }

      if (meals.lunch) {
        totalNutrition.calories += meals.lunch.nutrition.calories;
        totalNutrition.protein += meals.lunch.nutrition.protein;
        totalNutrition.carbohydrates += meals.lunch.nutrition.carbohydrates;
        totalNutrition.fat += meals.lunch.nutrition.fat;
      }

      if (meals.dinner) {
        totalNutrition.calories += meals.dinner.nutrition.calories;
        totalNutrition.protein += meals.dinner.nutrition.protein;
        totalNutrition.carbohydrates += meals.dinner.nutrition.carbohydrates;
        totalNutrition.fat += meals.dinner.nutrition.fat;
      }

      meals.snacks.forEach(snack => {
        totalNutrition.calories += snack.nutrition.calories;
        totalNutrition.protein += snack.nutrition.protein;
        totalNutrition.carbohydrates += snack.nutrition.carbohydrates;
        totalNutrition.fat += snack.nutrition.fat;
      });

      dailyMenus.push({
        day,
        date: dayDate,
        meals,
        totalNutrition
      });
    }

    // 5. Generar listas de compras semanales
    const weeklyShoppingLists = this.generateShoppingLists(dailyMenus, duration);

    return {
      nutritionalGoals: {
        dailyCalories,
        ...macros
      },
      dailyMenus,
      weeklyShoppingLists,
      duration,
      planType: duration === 7 ? 'semanal' : 'mensual',
      startDate: today,
      endDate: new Date(today.getTime() + duration * 24 * 60 * 60 * 1000)
    };
  }

  // Generar listas de compras consolidadas por semana
  generateShoppingLists(dailyMenus, totalDays) {
    const weeksCount = Math.ceil(totalDays / 7);
    const weeklyLists = [];

    for (let week = 1; week <= weeksCount; week++) {
      const startDay = (week - 1) * 7 + 1;
      const endDay = Math.min(week * 7, totalDays);
      
      const weekMenus = dailyMenus.filter(menu => menu.day >= startDay && menu.day <= endDay);
      const ingredients = {};

      weekMenus.forEach(menu => {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          if (menu.meals[mealType] && menu.meals[mealType].recipeId) {
            // Aquí se consolidarían los ingredientes
            // Por ahora dejamos la estructura base
          }
        });

        if (menu.meals.snacks) {
          menu.meals.snacks.forEach(snack => {
            if (snack.recipeId) {
              // Consolidar ingredientes de snacks
            }
          });
        }
      });

      weeklyLists.push({
        week,
        items: [] // Aquí irían los ingredientes consolidados
      });
    }

    return weeklyLists;
  }
}

module.exports = new NutritionAlgorithm();