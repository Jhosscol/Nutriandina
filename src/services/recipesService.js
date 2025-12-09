// Sistema de recetas con alimentos andinos

// Base de datos de recetas
export const recipesDatabase = [
  {
    id: 'rec_001',
    name: 'Bowl de Quinua con Frutas Andinas',
    category: 'breakfast',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    calories: 420,
    protein: 12,
    carbs: 68,
    fats: 8,
    fiber: 9,
    image: '🥣',
    rating: 4.8,
    reviews: 245,
    tags: ['Sin gluten', 'Vegetariano', 'Alto en proteína', 'Desayuno'],
    mainIngredients: ['quinoa_white', 'aguaymanto', 'maca'],
    goodFor: ['diabetes', 'energy', 'weight_loss'],
    ingredients: [
      { name: 'Quinua blanca', amount: 1, unit: 'taza', calories: 222 },
      { name: 'Aguaymanto', amount: 100, unit: 'g', calories: 53 },
      { name: 'Plátano', amount: 1, unit: 'unidad', calories: 105 },
      { name: 'Maca en polvo', amount: 1, unit: 'cucharada', calories: 20 },
      { name: 'Miel de abeja', amount: 1, unit: 'cucharada', calories: 64 },
      { name: 'Nueces', amount: 30, unit: 'g', calories: 196 },
      { name: 'Leche de almendras', amount: 200, unit: 'ml', calories: 30 },
    ],
    instructions: [
      'Cocina la quinua en agua hirviendo por 15-20 minutos hasta que esté suave.',
      'Escurre y deja enfriar ligeramente.',
      'En un bowl, coloca la quinua como base.',
      'Corta el plátano en rodajas y el aguaymanto por la mitad.',
      'Agrega las frutas sobre la quinua.',
      'Espolvorea la maca en polvo.',
      'Añade las nueces picadas.',
      'Rocía con miel y leche de almendras.',
      'Sirve inmediatamente y disfruta.',
    ],
    nutritionalBenefits: [
      'Proteína completa de la quinua',
      'Vitamina C del aguaymanto',
      'Energía natural de la maca',
      'Omega-3 de las nueces',
    ],
    tips: [
      'Puedes preparar la quinua la noche anterior',
      'Sustituye la miel por stevia si tienes diabetes',
      'Agrega más frutas de temporada según disponibilidad',
    ],
  },
  {
    id: 'rec_002',
    name: 'Hamburguesa de Tarwi con Kiwicha',
    category: 'lunch',
    difficulty: 'medium',
    prepTime: 30,
    cookTime: 20,
    servings: 4,
    calories: 380,
    protein: 22,
    carbs: 45,
    fats: 12,
    fiber: 11,
    image: '🍔',
    rating: 4.7,
    reviews: 189,
    tags: ['Vegano', 'Alto en proteína', 'Sin gluten', 'Almuerzo'],
    mainIngredients: ['tarwi', 'kiwicha'],
    goodFor: ['diabetes', 'cholesterol', 'muscle_gain', 'weight_loss'],
    ingredients: [
      { name: 'Tarwi cocido', amount: 2, unit: 'tazas', calories: 280 },
      { name: 'Kiwicha cocida', amount: 1, unit: 'taza', calories: 251 },
      { name: 'Cebolla picada', amount: 1, unit: 'unidad', calories: 40 },
      { name: 'Ajo picado', amount: 3, unit: 'dientes', calories: 13 },
      { name: 'Pimiento rojo', amount: 1, unit: 'unidad', calories: 37 },
      { name: 'Comino', amount: 1, unit: 'cucharadita', calories: 8 },
      { name: 'Sal marina', amount: 1, unit: 'pizca', calories: 0 },
      { name: 'Aceite de oliva', amount: 2, unit: 'cucharadas', calories: 240 },
      { name: 'Pan integral', amount: 4, unit: 'unidades', calories: 280 },
    ],
    instructions: [
      'Tritura el tarwi cocido hasta obtener una pasta gruesa.',
      'Mezcla con la kiwicha cocida.',
      'Sofríe la cebolla, ajo y pimiento picado hasta que estén dorados.',
      'Agrega el sofrito a la mezcla de tarwi y kiwicha.',
      'Añade comino y sal al gusto.',
      'Forma 4 hamburguesas con las manos.',
      'Calienta una sartén con aceite de oliva.',
      'Cocina las hamburguesas 5 minutos por cada lado.',
      'Sirve en pan integral con vegetales frescos.',
    ],
    nutritionalBenefits: [
      'Proteína vegetal completa del tarwi',
      'Calcio de la kiwicha',
      'Bajo índice glucémico',
      'Alto contenido de fibra',
    ],
    tips: [
      'Puedes congelar las hamburguesas crudas',
      'Agrega cilantro fresco para más sabor',
      'Acompaña con ensalada de yacón',
    ],
  },
  {
    id: 'rec_003',
    name: 'Batido Energético de Maca y Aguaymanto',
    category: 'snack',
    difficulty: 'easy',
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 285,
    protein: 8,
    carbs: 52,
    fats: 6,
    fiber: 7,
    image: '🥤',
    rating: 4.9,
    reviews: 412,
    tags: ['Vegano', 'Energizante', 'Post-entrenamiento', 'Rápido'],
    mainIngredients: ['maca', 'aguaymanto'],
    goodFor: ['energy', 'athletic_performance', 'immunity'],
    ingredients: [
      { name: 'Maca en polvo', amount: 2, unit: 'cucharadas', calories: 40 },
      { name: 'Aguaymanto fresco', amount: 100, unit: 'g', calories: 53 },
      { name: 'Plátano maduro', amount: 1, unit: 'unidad', calories: 105 },
      { name: 'Leche de almendras', amount: 250, unit: 'ml', calories: 37 },
      { name: 'Dátiles', amount: 3, unit: 'unidades', calories: 66 },
      { name: 'Hielo', amount: 4, unit: 'cubos', calories: 0 },
    ],
    instructions: [
      'Coloca todos los ingredientes en una licuadora.',
      'Licúa a alta velocidad durante 1-2 minutos.',
      'Verifica la consistencia y ajusta con más leche si es necesario.',
      'Sirve inmediatamente en un vaso alto.',
      'Decora con aguaymanto fresco encima.',
    ],
    nutritionalBenefits: [
      'Energía sostenida de la maca',
      'Antioxidantes del aguaymanto',
      'Potasio del plátano',
      'Recuperación muscular',
    ],
    tips: [
      'Tómalo 30 minutos antes del ejercicio',
      'Ideal para el desayuno también',
      'Puedes agregar semillas de chía',
    ],
  },
  {
    id: 'rec_004',
    name: 'Ensalada de Quinua Tricolor con Yacón',
    category: 'lunch',
    difficulty: 'easy',
    prepTime: 20,
    cookTime: 20,
    servings: 4,
    calories: 320,
    protein: 11,
    carbs: 48,
    fats: 9,
    fiber: 8,
    image: '🥗',
    rating: 4.6,
    reviews: 178,
    tags: ['Sin gluten', 'Vegetariano', 'Bajo IG', 'Diabético-friendly'],
    mainIngredients: ['quinoa_white', 'yacon'],
    goodFor: ['diabetes', 'weight_loss', 'digestive_health'],
    ingredients: [
      { name: 'Quinua tricolor', amount: 1.5, unit: 'tazas', calories: 333 },
      { name: 'Yacón rallado', amount: 1, unit: 'taza', calories: 70 },
      { name: 'Tomates cherry', amount: 200, unit: 'g', calories: 36 },
      { name: 'Pepino', amount: 1, unit: 'unidad', calories: 16 },
      { name: 'Aguacate', amount: 1, unit: 'unidad', calories: 234 },
      { name: 'Cilantro fresco', amount: 0.5, unit: 'taza', calories: 1 },
      { name: 'Limón', amount: 2, unit: 'unidades', calories: 20 },
      { name: 'Aceite de oliva', amount: 3, unit: 'cucharadas', calories: 360 },
      { name: 'Sal y pimienta', amount: 1, unit: 'al gusto', calories: 0 },
    ],
    instructions: [
      'Cocina la quinua tricolor según instrucciones del paquete.',
      'Deja enfriar completamente.',
      'Ralla el yacón finamente.',
      'Corta los tomates cherry por la mitad.',
      'Corta el pepino en cubos pequeños.',
      'Corta el aguacate en cubos.',
      'En un bowl grande, mezcla todos los ingredientes.',
      'Exprime el jugo de limón sobre la ensalada.',
      'Añade aceite de oliva, sal y pimienta.',
      'Mezcla bien y decora con cilantro fresco.',
    ],
    nutritionalBenefits: [
      'Prebióticos del yacón para salud digestiva',
      'Proteína completa de quinua',
      'Grasas saludables del aguacate',
      'Bajo índice glucémico',
    ],
    tips: [
      'El yacón se oxida rápido, agrégalo justo antes de servir',
      'Puedes agregar queso fresco para más proteína',
      'Se conserva bien en refrigeración por 2 días',
    ],
  },
  {
    id: 'rec_005',
    name: 'Sopa Andina de Cañihua y Verduras',
    category: 'dinner',
    difficulty: 'easy',
    prepTime: 15,
    cookTime: 35,
    servings: 6,
    calories: 245,
    protein: 9,
    carbs: 38,
    fats: 6,
    fiber: 7,
    image: '🍲',
    rating: 4.7,
    reviews: 156,
    tags: ['Reconfortante', 'Bajo en grasa', 'Nutritiva', 'Cena'],
    mainIngredients: ['canihua'],
    goodFor: ['hypertension', 'weight_loss', 'anemia'],
    ingredients: [
      { name: 'Cañihua', amount: 1, unit: 'taza', calories: 345 },
      { name: 'Zanahoria', amount: 3, unit: 'unidades', calories: 75 },
      { name: 'Apio', amount: 3, unit: 'tallos', calories: 18 },
      { name: 'Cebolla', amount: 2, unit: 'unidades', calories: 80 },
      { name: 'Ajo', amount: 4, unit: 'dientes', calories: 17 },
      { name: 'Papa amarilla', amount: 3, unit: 'unidades', calories: 258 },
      { name: 'Caldo de verduras', amount: 2, unit: 'litros', calories: 40 },
      { name: 'Comino', amount: 1, unit: 'cucharadita', calories: 8 },
      { name: 'Orégano', amount: 1, unit: 'cucharadita', calories: 3 },
      { name: 'Sal marina', amount: 1, unit: 'al gusto', calories: 0 },
    ],
    instructions: [
      'Lava bien la cañihua.',
      'En una olla grande, sofríe la cebolla y ajo picados.',
      'Agrega el apio y zanahoria en cubos.',
      'Añade el caldo de verduras y lleva a ebullición.',
      'Incorpora la cañihua y las papas cortadas.',
      'Agrega comino, orégano y sal.',
      'Cocina a fuego medio por 30 minutos.',
      'Rectifica la sazón.',
      'Sirve caliente con perejil fresco.',
    ],
    nutritionalBenefits: [
      'Alto contenido de hierro de la cañihua',
      'Fibra para saciedad',
      'Bajo en grasas',
      'Rico en minerales',
    ],
    tips: [
      'Puedes agregar pollo desmenuzado para más proteína',
      'Se conserva bien congelada',
      'Sirve con aguacate en rodajas',
    ],
  },
];

// Funciones para filtrar y buscar recetas
export const filterRecipesByCategory = (category) => {
  if (category === 'all') return recipesDatabase;
  return recipesDatabase.filter(recipe => recipe.category === category);
};

export const filterRecipesByHealthCondition = (condition) => {
  return recipesDatabase.filter(recipe => 
    recipe.goodFor.includes(condition)
  );
};

export const filterRecipesByDifficulty = (difficulty) => {
  return recipesDatabase.filter(recipe => recipe.difficulty === difficulty);
};

export const searchRecipes = (query) => {
  const lowerQuery = query.toLowerCase();
  return recipesDatabase.filter(recipe =>
    recipe.name.toLowerCase().includes(lowerQuery) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    recipe.ingredients.some(ing => ing.name.toLowerCase().includes(lowerQuery))
  );
};

export const getRecipesByTags = (tags) => {
  return recipesDatabase.filter(recipe =>
    tags.some(tag => recipe.tags.includes(tag))
  );
};

export const getRecommendedRecipes = (profile) => {
  const { healthConditions, goals } = profile;
  
  let recommendedRecipes = recipesDatabase;
  
  // Filtrar por condiciones de salud
  if (healthConditions.length > 0 && !healthConditions.includes('none')) {
    recommendedRecipes = recommendedRecipes.filter(recipe =>
      healthConditions.some(condition => recipe.goodFor.includes(condition))
    );
  }
  
  // Ordenar por rating
  recommendedRecipes.sort((a, b) => b.rating - a.rating);
  
  return recommendedRecipes.slice(0, 10); // Top 10
};

export const getRecipeById = (id) => {
  return recipesDatabase.find(recipe => recipe.id === id);
};

export const getPopularRecipes = () => {
  return recipesDatabase
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5);
};

export const getQuickRecipes = () => {
  return recipesDatabase.filter(recipe => 
    recipe.prepTime + recipe.cookTime <= 30
  );
};

export const getRecipesByMealTime = (mealTime) => {
  const mealTimeMap = {
    breakfast: 'breakfast',
    lunch: 'lunch',
    dinner: 'dinner',
    snack: 'snack',
  };
  
  return recipesDatabase.filter(recipe => 
    recipe.category === mealTimeMap[mealTime]
  );
};

// Calcular información nutricional total
export const calculateRecipeNutrition = (recipe) => {
  const totalNutrition = {
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fats: recipe.fats,
    fiber: recipe.fiber,
  };
  
  return totalNutrition;
};

// Ajustar porciones de receta
export const adjustRecipeServings = (recipe, newServings) => {
  const ratio = newServings / recipe.servings;
  
  const adjustedRecipe = {
    ...recipe,
    servings: newServings,
    calories: Math.round(recipe.calories * ratio),
    protein: Math.round(recipe.protein * ratio),
    carbs: Math.round(recipe.carbs * ratio),
    fats: Math.round(recipe.fats * ratio),
    fiber: Math.round(recipe.fiber * ratio),
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      amount: Math.round(ing.amount * ratio * 10) / 10,
      calories: Math.round(ing.calories * ratio),
    })),
  };
  
  return adjustedRecipe;
};

// Generar lista de compras de recetas
export const generateShoppingList = (recipes) => {
  const shoppingList = {};
  
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      if (shoppingList[ingredient.name]) {
        shoppingList[ingredient.name].amount += ingredient.amount;
      } else {
        shoppingList[ingredient.name] = {
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
        };
      }
    });
  });
  
  return Object.values(shoppingList);
};

// Obtener ingredientes andinos únicos
export const getAndeanIngredients = () => {
  const andeanIngredients = new Set();
  
  recipesDatabase.forEach(recipe => {
    recipe.mainIngredients.forEach(ing => {
      andeanIngredients.add(ing);
    });
  });
  
  return Array.from(andeanIngredients);
};

// Calcular tiempo total de preparación
export const getTotalTime = (recipe) => {
  return recipe.prepTime + recipe.cookTime;
};

// Exportar categorías disponibles
export const recipeCategories = [
  { id: 'all', name: 'Todas', icon: 'food' },
  { id: 'breakfast', name: 'Desayuno', icon: 'coffee' },
  { id: 'lunch', name: 'Almuerzo', icon: 'food-variant' },
  { id: 'dinner', name: 'Cena', icon: 'food-turkey' },
  { id: 'snack', name: 'Snacks', icon: 'food-apple' },
];

export const difficultyLevels = [
  { id: 'easy', name: 'Fácil', color: '#4CAF50' },
  { id: 'medium', name: 'Media', color: '#FFC107' },
  { id: 'hard', name: 'Difícil', color: '#F44336' },
];