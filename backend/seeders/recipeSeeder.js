// backend/seeders/recipeSeeder.js
const Recipe = require('../models/Recipe');
const Food = require('../models/Food');

// Esta función debe ejecutarse DESPUÉS del seeder de alimentos
const seedRecipes = async () => {
  try {
    // Obtener IDs de los alimentos necesarios
    const quinua = await Food.findOne({ name: 'Quinua' });
    const kiwicha = await Food.findOne({ name: 'Kiwicha (Amaranto)' });
    const papa = await Food.findOne({ name: 'Papa nativa' });
    const oca = await Food.findOne({ name: 'Oca' });
    const tarwi = await Food.findOne({ name: 'Tarwi (Chocho)' });
    const habas = await Food.findOne({ name: 'Habas' });
    const aguaymanto = await Food.findOne({ name: 'Aguaymanto' });
    const trucha = await Food.findOne({ name: 'Trucha' });
    const cuy = await Food.findOne({ name: 'Cuy' });
    const quesoFresco = await Food.findOne({ name: 'Queso fresco' });
    const sachaInchi = await Food.findOne({ name: 'Sacha inchi' });
    const maca = await Food.findOne({ name: 'Maca' });
    const camuCamu = await Food.findOne({ name: 'Camu Camu' });
    const yacon = await Food.findOne({ name: 'Yacón' });
    const olluco = await Food.findOne({ name: 'Olluco' });

    const andineRecipes = [
      // DESAYUNO 1: Bowl de Quinua con Aguaymanto
      {
        name: 'Bowl de Quinua con Aguaymanto y Maca',
        description: 'Desayuno energético y nutritivo con superalimentos andinos',
        category: 'desayuno',
        mealType: 'plato_principal',
        ingredients: [
          { foodId: quinua._id, quantity: 60, unit: 'g', name: 'Quinua' },
          { foodId: aguaymanto._id, quantity: 50, unit: 'g', name: 'Aguaymanto' },
          { foodId: sachaInchi._id, quantity: 15, unit: 'g', name: 'Sacha inchi' },
          { foodId: maca._id, quantity: 10, unit: 'g', name: 'Maca en polvo' }
        ],
        totalNutrition: {
          calories: 385,
          protein: 14.5,
          carbohydrates: 52,
          fiber: 8.2,
          fat: 12,
          sodium: 5
        },
        servings: 1,
        instructions: [
          { step: 1, description: 'Cocinar la quinua en agua durante 15 minutos hasta que esté suave' },
          { step: 2, description: 'Dejar enfriar la quinua' },
          { step: 3, description: 'Servir en un bowl y agregar aguaymanto fresco' },
          { step: 4, description: 'Espolvorear maca en polvo y semillas de sacha inchi' },
          { step: 5, description: 'Agregar un toque de miel o endulzante natural si deseas' }
        ],
        prepTime: 5,
        cookTime: 15,
        difficulty: 'facil',
        restrictions: {
          diabetes: false,
          hypertension: false,
          highCholesterol: false,
          celiac: false
        },
        allergens: ['frutos_secos'],
        diets: { vegetarian: true, vegan: true },
        healthGoals: ['energy', 'muscle_gain', 'immunity'],
        region: 'sierra',
        tags: ['desayuno', 'superalimentos', 'sin_gluten', 'vegano']
      },

      // DESAYUNO 2: Batido de Camu Camu
      {
        name: 'Batido Energético de Camu Camu y Kiwicha',
        description: 'Batido refrescante cargado de vitamina C',
        category: 'desayuno',
        mealType: 'bebida',
        ingredients: [
          { foodId: camuCamu._id, quantity: 30, unit: 'g', name: 'Camu Camu' },
          { foodId: kiwicha._id, quantity: 40, unit: 'g', name: 'Kiwicha cocida' },
          { foodId: aguaymanto._id, quantity: 40, unit: 'g', name: 'Aguaymanto' }
        ],
        totalNutrition: {
          calories: 215,
          protein: 7.8,
          carbohydrates: 38,
          fiber: 5.5,
          fat: 3.5,
          sodium: 3
        },
        servings: 1,
        instructions: [
          { step: 1, description: 'Cocinar previamente la kiwicha y dejar enfriar' },
          { step: 2, description: 'Licuar todos los ingredientes con agua o leche vegetal' },
          { step: 3, description: 'Agregar hielo al gusto' },
          { step: 4, description: 'Endulzar con stevia o miel si deseas' }
        ],
        prepTime: 5,
        cookTime: 5,
        difficulty: 'facil',
        restrictions: {
          diabetes: false,
          hypertension: false,
          highCholesterol: false,
          celiac: false
        },
        allergens: [],
        diets: { vegetarian: true, vegan: true },
        healthGoals: ['immunity', 'energy', 'digestion'],
        region: 'selva',
        tags: ['batido', 'vitamina_c', 'rapido', 'vegano']
      },

      // ALMUERZO 1: Trucha al Horno con Papas Nativas
      {
        name: 'Trucha al Horno con Papas Nativas y Hierbas',
        description: 'Plato tradicional andino saludable y delicioso',
        category: 'almuerzo',
        mealType: 'plato_principal',
        ingredients: [
          { foodId: trucha._id, quantity: 200, unit: 'g', name: 'Trucha' },
          { foodId: papa._id, quantity: 250, unit: 'g', name: 'Papa nativa' },
          { foodId: oca._id, quantity: 100, unit: 'g', name: 'Oca' }
        ],
        totalNutrition: {
          calories: 492,
          protein: 47,
          carbohydrates: 58,
          fiber: 6.8,
          fat: 8.5,
          sodium: 116
        },
        servings: 1,
        instructions: [
          { step: 1, description: 'Limpiar y sazonar la trucha con sal, pimienta y limón' },
          { step: 2, description: 'Cortar las papas y ocas en rodajas' },
          { step: 3, description: 'Colocar las papas y ocas en una bandeja de horno con un poco de aceite' },
          { step: 4, description: 'Poner la trucha encima de las papas' },
          { step: 5, description: 'Hornear a 180°C durante 25-30 minutos' },
          { step: 6, description: 'Decorar con hierbas frescas como huacatay o perejil' }
        ],
        prepTime: 15,
        cookTime: 30,
        difficulty: 'media',
        restrictions: {
          diabetes: false,
          hypertension: false,
          highCholesterol: false,
          celiac: false
        },
        allergens: ['pescado'],
        diets: { vegetarian: false, vegan: false },
        healthGoals: ['heart_health', 'muscle_gain', 'weight_loss'],
        region: 'sierra',
        tags: ['almuerzo', 'omega3', 'proteina', 'bajo_en_grasa']
      },

      // ALMUERZO 2: Guiso de Quinua con Tarwi
      {
        name: 'Guiso Andino de Quinua con Tarwi y Verduras',
        description: 'Plato vegetariano completo en proteínas',
        category: 'almuerzo',
        mealType: 'plato_principal',
        ingredients: [
          { foodId: quinua._id, quantity: 80, unit: 'g', name: 'Quinua' },
          { foodId: tarwi._id, quantity: 60, unit: 'g', name: 'Tarwi' },
          { foodId: papa._id, quantity: 150, unit: 'g', name: 'Papa nativa' },
          { foodId: olluco._id, quantity: 80, unit: 'g', name: 'Olluco' }
        ],
        totalNutrition: {
          calories: 648,
          protein: 44,
          carbohydrates: 96,
          fiber: 20,
          fat: 14,
          sodium: 22
        },
        servings: 1,
        instructions: [
          { step: 1, description: 'Remojar el tarwi la noche anterior y cambiar el agua varias veces' },
          { step: 2, description: 'Cocinar la quinua en caldo vegetal' },
          { step: 3, description: 'En una olla aparte, cocinar las papas y ollucos cortados en cubos' },
          { step: 4, description: 'Agregar el tarwi cocido' },
          { step: 5, description: 'Mezclar todo con la quinua' },
          { step: 6, description: 'Sazonar con ají amarillo, comino y culantro' }
        ],
        prepTime: 20,
        cookTime: 35,
        difficulty: 'media',
        restrictions: {
          diabetes: false,
          hypertension: false,
          highCholesterol: false,
          celiac: false
        },
        allergens: [],
        diets: { vegetarian: true, vegan: true },
        healthGoals: ['muscle_gain', 'heart_health', 'digestion', 'energy'],
        region: 'sierra',
        tags: ['vegetariano', 'vegano', 'proteina_completa', 'sin_gluten']
      },

      // ALMUERZO 3: Saltado de Cuy
      {
        name: 'Saltado de Cuy con Papas Andinas',
        description: 'Plato tradicional alto en proteína y bajo en grasa',
        category: 'almuerzo',
        mealType: 'plato_principal',
        ingredients: [
          { foodId: cuy._id, quantity: 180, unit: 'g', name: 'Cuy' },
          { foodId: papa._id, quantity: 200, unit: 'g', name: 'Papa nativa' },
          { foodId: oca._id, quantity: 80, unit: 'g', name: 'Oca' }
        ],
        totalNutrition: {
          calories: 456,
          protein: 41,
          carbohydrates: 56,
          fiber: 6.2,
          fat: 5.5,
          sodium: 138
        },
        servings: 1,
        instructions: [
          { step: 1, description: 'Cortar el cuy en presas y sazonar' },
          { step: 2, description: 'Freír las papas y ocas en bastones hasta dorar' },
          { step: 3, description: 'Saltear el cuy en una sartén con cebolla y tomate' },
          { step: 4, description: 'Agregar las papas fritas al saltado' },
          { step: 5, description: 'Sazonar con ají amarillo, sillao y vinagre' },
          { step: 6, description: 'Servir caliente con arroz o ensalada' }
        ],
        prepTime: 20,
        cookTime: 25,
        difficulty: 'media',
        restrictions: {
          diabetes: false,
          hypertension: false,
          highCholesterol: false,
          celiac: false
        },
        allergens: [],
        diets: { vegetarian: false, vegan: false },
        healthGoals: ['muscle_gain', 'weight_loss', 'energy'],
        region: 'sierra',
        tags: ['tradicional', 'proteina_magra', 'bajo_en_grasa']
      },

      // CENA 1: Sopa de Habas
      {
        name: 'Sopa Nutritiva de Habas con Quinua',
        description: 'Sopa reconfortante y completa nutricionalmente',
        category: 'cena',
        mealType: 'plato_principal',
        ingredients: [
          { foodId: habas._id, quantity: 100, unit: 'g', name: 'Habas' },
          { foodId: quinua._id, quantity: 40, unit: 'g', name: 'Quinua' },
          { foodId: papa._id, quantity: 120, unit: 'g', name: 'Papa nativa' },
          { foodId: quesoFresco._id, quantity: 30, unit: 'g', name: 'Queso fresco' }
        ],
        totalNutrition: {
          calories: 485,
          protein: 32,
          carbohydrates: 71,
          fiber: 18,
          fat: 10,
          sodium: 111
        },
        servings: 1,
        instructions: [
          { step: 1, description: 'Cocinar las habas previamente remojadas hasta que estén suaves' },
          { step: 2, description: 'Agregar las papas cortadas en cubos' },
          { step: 3, description: 'Añadir la quinua lavada' },
          { step: 4, description: 'Condimentar con ajo, comino y hierbas' },
          { step: 5, description: 'Cocinar por 20 minutos más' },
          { step: 6, description: 'Servir caliente con queso fresco desmenuzado encima' }
        ],
        prepTime: 15,
        cookTime: 40,
        difficulty: 'facil',
        restrictions: {
          diabetes: false,
          hypertension: true,
          highCholesterol: true,
          celiac: false
        },
        allergens: ['lactosa'],
        diets: { vegetarian: true, vegan: false },
        healthGoals: ['digestion', 'heart_health', 'muscle_gain'],
        region: 'sierra',
        tags: ['sopa', 'reconfortante', 'alto_en_fibra']
      },

      // CENA 2: Ensalada de Quinua
      {
        name: 'Ensalada Fresca de Quinua con Aguaymanto',
        description: 'Ensalada ligera y nutritiva perfecta para la cena',
        category: 'cena',
        mealType: 'plato_principal',
        ingredients: [
          { foodId: quinua._id, quantity: 70, unit: 'g', name: 'Quinua' },
          { foodId: aguaymanto._id, quantity: 60, unit: 'g', name: 'Aguaymanto' },
          { foodId: quesoFresco._id, quantity: 40, unit: 'g', name: 'Queso fresco' },
          { foodId: sachaInchi._id, quantity: 10, unit: 'g', name: 'Sacha inchi' }
        ],
        totalNutrition: {
          calories: 469,
          protein: 22,
          carbohydrates: 52,
          fiber: 9,
          fat: 18,
          sodium: 105
        },
        servings: 1,
        instructions: [
          { step: 1, description: 'Cocinar la quinua y dejar enfriar completamente' },
          { step: 2, description: 'Cortar el aguaymanto en mitades' },
          { step: 3, description: 'Desmenuzar el queso fresco' },
          { step: 4, description: 'Mezclar todos los ingredientes' },
          { step: 5, description: 'Aliñar con limón, aceite de oliva y sal' },
          { step: 6, description: 'Espolvorear semillas de sacha inchi' }
        ],
        prepTime: 10,
        cookTime: 15,
        difficulty: 'facil',
        restrictions: {
          diabetes: false,
          hypertension: true,
          highCholesterol: true,
          celiac: false
        },
        allergens: ['lactosa', 'frutos_secos'],
        diets: { vegetarian: true, vegan: false },
        healthGoals: ['weight_loss', 'heart_health', 'digestion'],
        region: 'sierra',
        tags: ['ensalada', 'ligero', 'fresco', 'sin_gluten']
      },

      // SNACK 1: Chips de Yacón
      {
        name: 'Chips Crujientes de Yacón',
        description: 'Snack saludable y bajo en calorías',
        category: 'snack',
        mealType: 'acompañamiento',
        ingredients: [
          { foodId: yacon._id, quantity: 150, unit: 'g', name: 'Yacón' }
        ],
        totalNutrition: {
          calories: 48,
          protein: 0.8,
          carbohydrates: 10.5,
          fiber: 3,
          fat: 0.2,
          sodium: 2
        },
        servings: 1,
        instructions: [
          { step: 1, description: 'Lavar y pelar el yacón' },
          { step: 2, description: 'Cortar en rodajas muy finas con mandolina' },
          { step: 3, description: 'Colocar en bandeja de horno con papel manteca' },
          { step: 4, description: 'Rociar ligeramente con aceite en spray' },
          { step: 5, description: 'Hornear a 150°C por 25-30 minutos hasta que estén crujientes' },
          { step: 6, description: 'Salar al gusto y dejar enfriar' }
        ],
        prepTime: 10,
        cookTime: 30,
        difficulty: 'facil',
        restrictions: {
          diabetes: false,
          hypertension: false,
          highCholesterol: false,
          celiac: false
        },
        allergens: [],
        diets: { vegetarian: true, vegan: true },
        healthGoals: ['weight_loss', 'diabetes_control', 'digestion'],
        region: 'sierra',
        tags: ['snack', 'bajo_en_calorias', 'prebiotico', 'vegano']
      },

      // SNACK 2: Bolitas energéticas
      {
        name: 'Bolitas Energéticas de Kiwicha y Maca',
        description: 'Snack energético perfecto pre o post ejercicio',
        category: 'snack',
        mealType: 'acompañamiento',
        ingredients: [
          { foodId: kiwicha._id, quantity: 50, unit: 'g', name: 'Kiwicha' },
          { foodId: maca._id, quantity: 15, unit: 'g', name: 'Maca en polvo' },
          { foodId: sachaInchi._id, quantity: 20, unit: 'g', name: 'Sacha inchi' }
        ],
        totalNutrition: {
          calories: 350,
          protein: 13,
          carbohydrates: 43,
          fiber: 5,
          fat: 15,
          sodium: 5
        },
        servings: 4,
        instructions: [
          { step: 1, description: 'Cocinar la kiwicha y dejar enfriar' },
          { step: 2, description: 'Triturar las semillas de sacha inchi' },
          { step: 3, description: 'Mezclar kiwicha, maca, sacha inchi con un poco de miel' },
          { step: 4, description: 'Formar bolitas pequeñas con las manos' },
          { step: 5, description: 'Refrigerar por 30 minutos antes de consumir' }
        ],
        prepTime: 15,
        cookTime: 10,
        difficulty: 'facil',
        restrictions: {
          diabetes: false,
          hypertension: false,
          highCholesterol: false,
          celiac: false
        },
        allergens: ['frutos_secos'],
        diets: { vegetarian: true, vegan: true },
        healthGoals: ['energy', 'muscle_gain', 'immunity'],
        region: 'sierra',
        tags: ['snack', 'energetico', 'superalimentos', 'sin_gluten']
      },

      // POSTRE: Mazamorra de Kiwicha
      {
        name: 'Mazamorra Morada de Kiwicha con Aguaymanto',
        description: 'Postre tradicional andino con un toque nutritivo',
        category: 'postre',
        mealType: 'postre',
        ingredients: [
          { foodId: kiwicha._id, quantity: 40, unit: 'g', name: 'Kiwicha' },
          { foodId: aguaymanto._id, quantity: 50, unit: 'g', name: 'Aguaymanto' }
        ],
        totalNutrition: {
          calories: 175,
          protein: 6.5,
          carbohydrates: 31.5,
          fiber: 5.1,
          fat: 3.2,
          sodium: 2
        },
        servings: 1,
        instructions: [
          { step: 1, description: 'Cocinar la kiwicha en leche o leche vegetal' },
          { step: 2, description: 'Agregar canela y clavo de olor' },
          { step: 3, description: 'Endulzar con stevia o panela' },
          { step: 4, description: 'Cocinar hasta que espese' },
          { step: 5, description: 'Servir en copas y decorar con aguaymanto fresco' },
          { step: 6, description: 'Refrigerar si deseas consumir frío' }
        ],
        prepTime: 5,
        cookTime: 20,
        difficulty: 'facil',
        restrictions: {
          diabetes: false,
          hypertension: false,
          highCholesterol: false,
          celiac: false
        },
        allergens: [],
        diets: { vegetarian: true, vegan: true },
        healthGoals: ['digestion', 'immunity'],
        region: 'sierra',
        tags: ['postre', 'tradicional', 'sin_gluten', 'antioxidante']
      }
    ];

    // Eliminar recetas existentes
    await Recipe.deleteMany({});
    console.log('✅ Recetas existentes eliminadas');

    // Insertar nuevas recetas
    const recipes = await Recipe.insertMany(andineRecipes);
    console.log(`✅ ${recipes.length} recetas andinas insertadas correctamente`);
    
    return recipes;
  } catch (error) {
    console.error('❌ Error al insertar recetas:', error);
    throw error;
  }
};

module.exports = { seedRecipes };