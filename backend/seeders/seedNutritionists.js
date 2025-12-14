const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Script para poblar la colección de nutricionistas
 * Ejecutar con: node seedNutritionists.js
 */

const nutritionists = [
  {
    name: 'Dra. María Pérez',
    specialization: 'Nutrición Deportiva',
    email: 'maria.perez@nutriandina.com',
    phone: '+51 987 654 321',
    bio: 'Especialista en nutrición deportiva con 10 años de experiencia ayudando a atletas y personas activas a alcanzar sus metas.',
    certifications: ['Nutricionista Colegiada', 'Especialista en Nutrición Deportiva', 'Certificación en Coaching Nutricional'],
    languages: ['Español', 'Inglés'],
    experience: 10,
    rating: 4.8,
    totalConsultations: 450,
    availability: {
      monday: { available: true, hours: ['09:00-13:00', '15:00-18:00'] },
      tuesday: { available: true, hours: ['09:00-13:00', '15:00-18:00'] },
      wednesday: { available: true, hours: ['09:00-13:00', '15:00-18:00'] },
      thursday: { available: true, hours: ['09:00-13:00', '15:00-18:00'] },
      friday: { available: true, hours: ['09:00-13:00'] },
      saturday: { available: false },
      sunday: { available: false }
    },
    consultationPrice: 80,
    isActive: true,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Dr. Carlos Rodríguez',
    specialization: 'Nutrición Clínica',
    email: 'carlos.rodriguez@nutriandina.com',
    phone: '+51 987 654 322',
    bio: 'Nutricionista clínico especializado en tratamiento de enfermedades metabólicas, diabetes y obesidad.',
    certifications: ['Nutricionista Colegiado', 'Máster en Nutrición Clínica', 'Especialista en Diabetes'],
    languages: ['Español'],
    experience: 8,
    rating: 4.7,
    totalConsultations: 380,
    availability: {
      monday: { available: true, hours: ['10:00-14:00', '16:00-19:00'] },
      tuesday: { available: true, hours: ['10:00-14:00', '16:00-19:00'] },
      wednesday: { available: true, hours: ['10:00-14:00'] },
      thursday: { available: true, hours: ['10:00-14:00', '16:00-19:00'] },
      friday: { available: true, hours: ['10:00-14:00', '16:00-19:00'] },
      saturday: { available: true, hours: ['10:00-13:00'] },
      sunday: { available: false }
    },
    consultationPrice: 90,
    isActive: true,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Dra. Ana Flores',
    specialization: 'Nutrición Pediátrica',
    email: 'ana.flores@nutriandina.com',
    phone: '+51 987 654 323',
    bio: 'Especialista en nutrición infantil y adolescente. Ayudo a las familias a crear hábitos alimenticios saludables desde temprana edad.',
    certifications: ['Nutricionista Colegiada', 'Especialista en Nutrición Pediátrica', 'Diplomado en Alimentación Complementaria'],
    languages: ['Español', 'Quechua'],
    experience: 12,
    rating: 4.9,
    totalConsultations: 520,
    availability: {
      monday: { available: true, hours: ['08:00-12:00', '14:00-17:00'] },
      tuesday: { available: true, hours: ['08:00-12:00', '14:00-17:00'] },
      wednesday: { available: true, hours: ['08:00-12:00', '14:00-17:00'] },
      thursday: { available: true, hours: ['08:00-12:00'] },
      friday: { available: true, hours: ['08:00-12:00', '14:00-17:00'] },
      saturday: { available: false },
      sunday: { available: false }
    },
    consultationPrice: 85,
    isActive: true,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Dr. Luis Mendoza',
    specialization: 'Nutrición Vegana y Vegetariana',
    email: 'luis.mendoza@nutriandina.com',
    phone: '+51 987 654 324',
    bio: 'Experto en dietas basadas en plantas. Te ayudo a lograr una alimentación vegana o vegetariana balanceada y nutritiva.',
    certifications: ['Nutricionista Colegiado', 'Certificación en Nutrición Plant-Based', 'Especialista en Suplementación'],
    languages: ['Español', 'Inglés', 'Portugués'],
    experience: 6,
    rating: 4.6,
    totalConsultations: 290,
    availability: {
      monday: { available: true, hours: ['11:00-15:00', '17:00-20:00'] },
      tuesday: { available: true, hours: ['11:00-15:00', '17:00-20:00'] },
      wednesday: { available: true, hours: ['11:00-15:00'] },
      thursday: { available: true, hours: ['11:00-15:00', '17:00-20:00'] },
      friday: { available: true, hours: ['11:00-15:00'] },
      saturday: { available: true, hours: ['09:00-13:00'] },
      sunday: { available: true, hours: ['09:00-12:00'] }
    },
    consultationPrice: 75,
    isActive: true,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Dra. Patricia Vargas',
    specialization: 'Nutrición y Pérdida de Peso',
    email: 'patricia.vargas@nutriandina.com',
    phone: '+51 987 654 325',
    bio: 'Especialista en manejo de peso saludable. Enfoque personalizado sin dietas restrictivas, promoviendo cambios de hábitos sostenibles.',
    certifications: ['Nutricionista Colegiada', 'Especialista en Obesidad', 'Coach en Cambio de Hábitos'],
    languages: ['Español'],
    experience: 9,
    rating: 4.8,
    totalConsultations: 410,
    availability: {
      monday: { available: true, hours: ['09:00-13:00', '15:00-18:00'] },
      tuesday: { available: true, hours: ['09:00-13:00', '15:00-18:00'] },
      wednesday: { available: true, hours: ['09:00-13:00'] },
      thursday: { available: true, hours: ['09:00-13:00', '15:00-18:00'] },
      friday: { available: true, hours: ['09:00-13:00', '15:00-18:00'] },
      saturday: { available: false },
      sunday: { available: false }
    },
    consultationPrice: 85,
    isActive: true,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedNutritionists() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db('nutriandina');
    const collection = db.collection('nutritionists');
    
    // Limpiar colección existente
    await collection.deleteMany({});
    console.log('🧹 Colección limpiada');
    
    // Insertar nutricionistas
    const result = await collection.insertMany(nutritionists);
    console.log(`✅ ${result.insertedCount} nutricionistas insertados`);
    
    // Mostrar resumen
    console.log('\n📋 Nutricionistas disponibles:');
    nutritionists.forEach((n, index) => {
      console.log(`${index + 1}. ${n.name} - ${n.specialization}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Conexión cerrada');
  }
}

// Ejecutar seed
seedNutritionists();