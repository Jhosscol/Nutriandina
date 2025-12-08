// backend/seeders/foodSeeder.js
const Food = require('../models/Food');

const andineFoods = [
  // CEREALES ANDINOS
  {
    name: 'Quinua',
    category: 'cereal',
    region: 'sierra',
    nutritionalInfo: {
      calories: 368,
      protein: 14.1,
      carbohydrates: 64.2,
      fiber: 7.0,
      fat: 6.1,
      saturatedFat: 0.7,
      sugar: 3.5,
      sodium: 5,
      iron: 4.6,
      calcium: 47,
      vitaminC: 0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Superalimento andino rico en proteínas completas',
    benefits: ['Proteína completa', 'Rico en fibra', 'Sin gluten', 'Alto en hierro'],
    season: ['todo_el_año']
  },
  {
    name: 'Kiwicha (Amaranto)',
    category: 'cereal',
    region: 'sierra',
    nutritionalInfo: {
      calories: 371,
      protein: 13.6,
      carbohydrates: 65.2,
      fiber: 6.7,
      fat: 7.0,
      saturatedFat: 1.5,
      sugar: 2.1,
      sodium: 4,
      iron: 7.6,
      calcium: 159,
      vitaminC: 4.2
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Grano andino nutritivo y energético',
    benefits: ['Alto en calcio', 'Rico en hierro', 'Sin gluten', 'Proteína de calidad'],
    season: ['todo_el_año']
  },
  {
    name: 'Cañihua',
    category: 'cereal',
    region: 'sierra',
    nutritionalInfo: {
      calories: 350,
      protein: 15.3,
      carbohydrates: 60.5,
      fiber: 8.0,
      fat: 4.3,
      saturatedFat: 0.5,
      sugar: 2.0,
      sodium: 3,
      iron: 15.0,
      calcium: 120,
      vitaminC: 0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Cereal andino de alto valor proteico',
    benefits: ['Muy alto en hierro', 'Sin gluten', 'Alto contenido de fibra'],
    season: ['todo_el_año']
  },

  // TUBÉRCULOS ANDINOS
  {
    name: 'Papa nativa',
    category: 'tuberculo',
    region: 'sierra',
    nutritionalInfo: {
      calories: 77,
      protein: 2.0,
      carbohydrates: 17.5,
      fiber: 2.2,
      fat: 0.1,
      saturatedFat: 0,
      sugar: 0.8,
      sodium: 6,
      iron: 0.8,
      calcium: 12,
      vitaminC: 19.7
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Tubérculo base de la alimentación andina',
    benefits: ['Rico en vitamina C', 'Fuente de energía', 'Bajo en grasa'],
    season: ['todo_el_año']
  },
  {
    name: 'Oca',
    category: 'tuberculo',
    region: 'sierra',
    nutritionalInfo: {
      calories: 61,
      protein: 1.0,
      carbohydrates: 13.3,
      fiber: 1.8,
      fat: 0.6,
      saturatedFat: 0,
      sugar: 4.5,
      sodium: 3,
      iron: 1.6,
      calcium: 22,
      vitaminC: 48.0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Tubérculo andino dulce y nutritivo',
    benefits: ['Muy alto en vitamina C', 'Bajo en calorías', 'Rico en hierro'],
    season: ['abril', 'mayo', 'junio', 'julio']
  },
  {
    name: 'Olluco',
    category: 'tuberculo',
    region: 'sierra',
    nutritionalInfo: {
      calories: 70,
      protein: 2.0,
      carbohydrates: 14.0,
      fiber: 2.8,
      fat: 0.3,
      saturatedFat: 0,
      sugar: 1.2,
      sodium: 4,
      iron: 1.0,
      calcium: 20,
      vitaminC: 15.0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Tubérculo andino versátil',
    benefits: ['Rico en fibra', 'Vitamina C', 'Bajo en grasa'],
    season: ['marzo', 'abril', 'mayo', 'junio']
  },
  {
    name: 'Mashua',
    category: 'tuberculo',
    region: 'sierra',
    nutritionalInfo: {
      calories: 52,
      protein: 1.5,
      carbohydrates: 9.8,
      fiber: 2.0,
      fat: 0.7,
      saturatedFat: 0,
      sugar: 2.0,
      sodium: 5,
      iron: 1.0,
      calcium: 12,
      vitaminC: 77.5
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Tubérculo medicinal andino',
    benefits: ['Muy alto en vitamina C', 'Propiedades medicinales', 'Bajo en calorías'],
    season: ['mayo', 'junio', 'julio']
  },

  // LEGUMBRES
  {
    name: 'Tarwi (Chocho)',
    category: 'legumbre',
    region: 'sierra',
    nutritionalInfo: {
      calories: 386,
      protein: 44.3,
      carbohydrates: 28.2,
      fiber: 7.0,
      fat: 16.5,
      saturatedFat: 2.2,
      sugar: 3.0,
      sodium: 10,
      iron: 5.5,
      calcium: 81,
      vitaminC: 0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Legumbre andina con altísimo contenido proteico',
    benefits: ['Proteína vegetal excepcional', 'Rico en hierro', 'Alto en calcio'],
    season: ['todo_el_año']
  },
  {
    name: 'Habas',
    category: 'legumbre',
    region: 'sierra',
    nutritionalInfo: {
      calories: 341,
      protein: 26.1,
      carbohydrates: 58.3,
      fiber: 25.0,
      fat: 1.5,
      saturatedFat: 0.3,
      sugar: 5.7,
      sodium: 13,
      iron: 6.7,
      calcium: 103,
      vitaminC: 1.4
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Legumbre tradicional de los Andes',
    benefits: ['Alto en proteína', 'Muy alto en fibra', 'Rico en hierro'],
    season: ['abril', 'mayo', 'junio']
  },

  // FRUTAS ANDINAS
  {
    name: 'Aguaymanto',
    category: 'fruta',
    region: 'sierra',
    nutritionalInfo: {
      calories: 53,
      protein: 1.9,
      carbohydrates: 11.0,
      fiber: 4.9,
      fat: 0.7,
      saturatedFat: 0.1,
      sugar: 7.0,
      sodium: 1,
      iron: 1.2,
      calcium: 9,
      vitaminC: 11.0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Fruta andina rica en antioxidantes',
    benefits: ['Alto en vitamina C', 'Antioxidante', 'Rico en fibra'],
    season: ['todo_el_año']
  },
  {
    name: 'Lúcuma',
    category: 'fruta',
    region: 'costa',
    nutritionalInfo: {
      calories: 99,
      protein: 1.5,
      carbohydrates: 25.0,
      fiber: 1.3,
      fat: 0.2,
      saturatedFat: 0,
      sugar: 20.0,
      sodium: 7,
      iron: 0.4,
      calcium: 16,
      vitaminC: 2.0
    },
    restrictions: {
      diabetes: true, // Alto en azúcar natural
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Fruta dulce con sabor único',
    benefits: ['Fuente de energía', 'Sabor natural dulce', 'Vitaminas del complejo B'],
    season: ['agosto', 'septiembre', 'octubre', 'noviembre']
  },
  {
    name: 'Camu Camu',
    category: 'fruta',
    region: 'selva',
    nutritionalInfo: {
      calories: 17,
      protein: 0.5,
      carbohydrates: 4.7,
      fiber: 1.1,
      fat: 0.2,
      saturatedFat: 0,
      sugar: 2.0,
      sodium: 11,
      iron: 0.5,
      calcium: 15,
      vitaminC: 2780 // ¡Extraordinario!
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Fruta amazónica con la mayor concentración de vitamina C del mundo',
    benefits: ['Vitamina C excepcional', 'Antioxidante poderoso', 'Fortalece inmunidad'],
    season: ['diciembre', 'enero', 'febrero', 'marzo']
  },
  {
    name: 'Tumbo',
    category: 'fruta',
    region: 'sierra',
    nutritionalInfo: {
      calories: 50,
      protein: 2.0,
      carbohydrates: 10.0,
      fiber: 3.5,
      fat: 0.6,
      saturatedFat: 0,
      sugar: 6.0,
      sodium: 4,
      iron: 1.6,
      calcium: 12,
      vitaminC: 70.0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Fruta de la pasión andina',
    benefits: ['Rico en vitamina C', 'Alto en fibra', 'Antioxidante'],
    season: ['enero', 'febrero', 'marzo', 'abril']
  },

  // VERDURAS ANDINAS
  {
    name: 'Maca',
    category: 'tuberculo',
    region: 'sierra',
    nutritionalInfo: {
      calories: 325,
      protein: 10.2,
      carbohydrates: 59.0,
      fiber: 8.5,
      fat: 3.5,
      saturatedFat: 0.5,
      sugar: 32.0,
      sodium: 18,
      iron: 14.8,
      calcium: 250,
      vitaminC: 285
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Raíz andina energizante y adaptógena',
    benefits: ['Energizante natural', 'Alto en calcio', 'Rico en hierro', 'Adaptógeno'],
    season: ['todo_el_año']
  },
  {
    name: 'Achira',
    category: 'tuberculo',
    region: 'sierra',
    nutritionalInfo: {
      calories: 355,
      protein: 0.7,
      carbohydrates: 87.0,
      fiber: 2.5,
      fat: 0.2,
      saturatedFat: 0,
      sugar: 1.5,
      sodium: 5,
      iron: 1.0,
      calcium: 40,
      vitaminC: 10.0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Tubérculo usado para hacer almidón',
    benefits: ['Fuente de energía', 'Fácil digestión', 'Sin gluten'],
    season: ['todo_el_año']
  },

  // PROTEÍNAS
  {
    name: 'Charqui (carne seca de alpaca)',
    category: 'proteina',
    region: 'sierra',
    nutritionalInfo: {
      calories: 179,
      protein: 32.0,
      carbohydrates: 0,
      fiber: 0,
      fat: 5.0,
      saturatedFat: 1.5,
      sugar: 0,
      sodium: 450,
      iron: 5.5,
      calcium: 15,
      vitaminC: 0
    },
    restrictions: {
      diabetes: false,
      hypertension: true, // Alto en sodio
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: false, vegan: false },
    description: 'Carne deshidratada tradicional andina',
    benefits: ['Alto en proteína', 'Bajo en grasa', 'Fuente de hierro'],
    season: ['todo_el_año']
  },
  {
    name: 'Trucha',
    category: 'proteina',
    region: 'sierra',
    nutritionalInfo: {
      calories: 119,
      protein: 20.5,
      carbohydrates: 0,
      fiber: 0,
      fat: 3.5,
      saturatedFat: 0.7,
      sugar: 0,
      sodium: 52,
      iron: 0.7,
      calcium: 20,
      vitaminC: 0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: ['pescado'],
    diets: { vegetarian: false, vegan: false },
    description: 'Pescado de agua dulce de los ríos andinos',
    benefits: ['Alto en proteína', 'Omega 3', 'Bajo en grasa'],
    season: ['todo_el_año']
  },
  {
    name: 'Cuy',
    category: 'proteina',
    region: 'sierra',
    nutritionalInfo: {
      calories: 96,
      protein: 19.1,
      carbohydrates: 0.8,
      fiber: 0,
      fat: 1.6,
      saturatedFat: 0.5,
      sugar: 0,
      sodium: 70,
      iron: 1.5,
      calcium: 29,
      vitaminC: 0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: false, vegan: false },
    description: 'Carne magra tradicional de los Andes',
    benefits: ['Muy bajo en grasa', 'Alto en proteína', 'Fuente de hierro'],
    season: ['todo_el_año']
  },

  // LÁCTEOS ANDINOS
  {
    name: 'Queso fresco',
    category: 'lacteo',
    region: 'todas',
    nutritionalInfo: {
      calories: 264,
      protein: 18.0,
      carbohydrates: 3.4,
      fiber: 0,
      fat: 21.0,
      saturatedFat: 13.0,
      sugar: 3.4,
      sodium: 330,
      iron: 0.4,
      calcium: 520,
      vitaminC: 0
    },
    restrictions: {
      diabetes: false,
      hypertension: true, // Alto en sodio
      highCholesterol: true, // Alto en grasa saturada
      celiac: false
    },
    allergens: ['lactosa'],
    diets: { vegetarian: true, vegan: false },
    description: 'Queso tradicional andino',
    benefits: ['Alto en calcio', 'Fuente de proteína'],
    season: ['todo_el_año']
  },

  // FRUTOS SECOS
  {
    name: 'Sacha inchi',
    category: 'fruto_seco',
    region: 'selva',
    nutritionalInfo: {
      calories: 536,
      protein: 27.0,
      carbohydrates: 10.0,
      fiber: 2.0,
      fat: 48.0,
      saturatedFat: 3.8,
      sugar: 2.0,
      sodium: 1,
      iron: 7.2,
      calcium: 222,
      vitaminC: 0
    },
    restrictions: {
      diabetes: false,
      hypertension: false,
      highCholesterol: false, // Grasas saludables
      celiac: false
    },
    allergens: ['frutos_secos'],
    diets: { vegetarian: true, vegan: true },
    description: 'Semilla amazónica rica en omega 3',
    benefits: ['Omega 3 vegetal', 'Alto en proteína', 'Grasas saludables', 'Rico en calcio'],
    season: ['todo_el_año']
  },

  // OTROS
  {
    name: 'Chicha morada (maíz morado)',
    category: 'otros',
    region: 'todas',
    nutritionalInfo: {
      calories: 65,
      protein: 0.5,
      carbohydrates: 15.0,
      fiber: 0.5,
      fat: 0.1,
      saturatedFat: 0,
      sugar: 13.0,
      sodium: 2,
      iron: 0.5,
      calcium: 10,
      vitaminC: 5.0
    },
    restrictions: {
      diabetes: true, // Alto en azúcar
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Bebida tradicional peruana rica en antioxidantes',
    benefits: ['Antioxidante', 'Mejora circulación'],
    season: ['todo_el_año']
  },
  {
    name: 'Yacón',
    category: 'tuberculo',
    region: 'sierra',
    nutritionalInfo: {
      calories: 32,
      protein: 0.5,
      carbohydrates: 7.0,
      fiber: 2.0,
      fat: 0.1,
      saturatedFat: 0,
      sugar: 5.0,
      sodium: 1,
      iron: 0.4,
      calcium: 17,
      vitaminC: 5.0
    },
    restrictions: {
      diabetes: false, // Recomendado para diabéticos
      hypertension: false,
      highCholesterol: false,
      celiac: false
    },
    allergens: [],
    diets: { vegetarian: true, vegan: true },
    description: 'Tubérculo dulce recomendado para diabéticos',
    benefits: ['Prebiótico natural', 'Bajo en calorías', 'Regula glucosa', 'Mejora digestión'],
    season: ['abril', 'mayo', 'junio', 'julio']
  }
];

// Función para ejecutar el seeder
const seedFoods = async () => {
  try {
    // Eliminar alimentos existentes
    await Food.deleteMany({});
    console.log('✅ Alimentos existentes eliminados');

    // Insertar nuevos alimentos
    const foods = await Food.insertMany(andineFoods);
    console.log(`✅ ${foods.length} alimentos andinos insertados correctamente`);
    
    return foods;
  } catch (error) {
    console.error('❌ Error al insertar alimentos:', error);
    throw error;
  }
};

module.exports = { seedFoods, andineFoods };