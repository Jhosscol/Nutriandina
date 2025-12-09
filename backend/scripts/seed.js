// backend/scripts/seed.js
const mongoose = require('mongoose');
const { seedFoods } = require('../seeders/foodSeeder');
const { seedRecipes } = require('../seeders/recipeSeeder');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando proceso de seeding...\n');

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB\n');

    // 1. Seed de alimentos (debe ir primero)
    console.log('📦 Insertando alimentos andinos...');
    await seedFoods();
    console.log('');

    // 2. Seed de recetas (depende de alimentos)
    console.log('🍽️  Insertando recetas...');
    await seedRecipes();
    console.log('');

    console.log('✨ ¡Seeding completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log('   - Alimentos andinos insertados');
    console.log('   - 10 recetas andinas insertadas');
    console.log('   - Base de datos lista para usar\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seeding:', error);
    process.exit(1);
  }
};

// Ejecutar seeding
seedDatabase();