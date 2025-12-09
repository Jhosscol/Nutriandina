const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ====== FIREBASE ADMIN ======
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('✅ Firebase Admin inicializado');

// ====== MONGODB ======
let db;
const client = new MongoClient(process.env.MONGODB_URI);

client.connect()
  .then(() => {
    db = client.db('nutriandina');
    console.log('✅ MongoDB conectado');
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

// ====== MIDDLEWARE DE AUTENTICACIÓN ======
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token no proporcionado',
        message: 'Debes incluir el token de Firebase en el header Authorization'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Error verificando token:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    }
    
    res.status(401).json({ 
      error: 'Token inválido',
      message: error.message 
    });
  }
};

// ====== MIDDLEWARE OPCIONAL DE AUTENTICACIÓN ======
const verificarTokenOpcional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
    }
    next();
  } catch (error) {
    // Si falla, continuar sin usuario
    next();
  }
};

// ====== FUNCIONES AUXILIARES PARA GENERACIÓN DE MENÚS ======

// Calcular calorías objetivo
function calcularCaloriasObjetivo(userProfile, objetivoSalud) {
  // TMB (Tasa Metabólica Basal) usando fórmula Mifflin-St Jeor
  let tmb;
  
  if (userProfile.gender === 'male' || userProfile.gender === 'masculino') {
    tmb = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * parseInt(userProfile.age) + 5;
  } else {
    tmb = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * parseInt(userProfile.age) - 161;
  }
  
  // Multiplicar por nivel de actividad
  const factoresActividad = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const factor = factoresActividad[userProfile.activityLevel] || 1.375;
  let caloriasDiarias = tmb * factor;
  
  // Ajustar según objetivo de salud
  if (objetivoSalud === 'weight_loss' || objetivoSalud === 'perdida_peso') {
    caloriasDiarias *= 0.85; // Déficit de 15%
  } else if (objetivoSalud === 'muscle_gain' || objetivoSalud === 'ganancia_muscular') {
    caloriasDiarias *= 1.15; // Superávit de 15%
  }
  
  return Math.round(caloriasDiarias);
}

// Seleccionar receta aleatoria
function seleccionarRecetaAleatoria(recetas) {
  if (recetas.length === 0) return null;
  const index = Math.floor(Math.random() * recetas.length);
  return recetas[index];
}

// Crear info de comida
function crearMealInfo(receta) {
  if (!receta) return null;
  
  return {
    recipeId: receta._id.toString(),
    recipeName: receta.name || receta.title || 'Sin nombre',
    servings: receta.servings || 1,
    nutrition: {
      calories: receta.totalNutrition?.calories || 0,
      protein: receta.totalNutrition?.protein || 0,
      carbohydrates: receta.totalNutrition?.carbohydrates || 0,
      fat: receta.totalNutrition?.fat || 0,
      fiber: receta.totalNutrition?.fiber || 0
    }
  };
}

// Calcular nutrición total del día
function calcularNutricionTotal(breakfast, lunch, dinner, snacks) {
  const meals = [breakfast, lunch, dinner, ...snacks].filter(m => m);
  
  return {
    calories: Math.round(meals.reduce((sum, m) => sum + (m.totalNutrition?.calories || 0), 0)),
    protein: Math.round(meals.reduce((sum, m) => sum + (m.totalNutrition?.protein || 0), 0) * 10) / 10,
    carbohydrates: Math.round(meals.reduce((sum, m) => sum + (m.totalNutrition?.carbohydrates || 0), 0) * 10) / 10,
    fat: Math.round(meals.reduce((sum, m) => sum + (m.totalNutrition?.fat || 0), 0) * 10) / 10,
    fiber: Math.round(meals.reduce((sum, m) => sum + (m.totalNutrition?.fiber || 0), 0) * 10) / 10
  };
}

// Generar menús diarios
async function generarMenusDiarios(db, duration, userProfile, objetivoSalud) {
  try {
    console.log('🍽️ Generando menús diarios...');
    
    // 1. Obtener todas las recetas disponibles
    const recetas = await db.collection('recipes')
      .find({ isActive: true })
      .toArray();
    
    if (recetas.length === 0) {
      console.warn('⚠️ No hay recetas disponibles en la BD');
      return [];
    }
    
    console.log(`📖 ${recetas.length} recetas disponibles`);
    
    // 2. Separar recetas por tipo de comida
    const recetasPorTipo = {
      breakfast: recetas.filter(r => r.category === 'breakfast' || r.category === 'desayuno'),
      lunch: recetas.filter(r => r.category === 'lunch' || r.category === 'almuerzo' || r.category === 'main'),
      dinner: recetas.filter(r => r.category === 'dinner' || r.category === 'cena' || r.category === 'main'),
      snacks: recetas.filter(r => r.category === 'snack' || r.category === 'aperitivo')
    };
    
    // Si no hay suficientes recetas por categoría, usar cualquiera
    if (recetasPorTipo.breakfast.length === 0) recetasPorTipo.breakfast = recetas.slice(0, 3);
    if (recetasPorTipo.lunch.length === 0) recetasPorTipo.lunch = recetas.slice(0, 3);
    if (recetasPorTipo.dinner.length === 0) recetasPorTipo.dinner = recetas.slice(0, 3);
    if (recetasPorTipo.snacks.length === 0) recetasPorTipo.snacks = recetas.slice(0, 2);
    
    console.log(`📊 Recetas por tipo:`, {
      breakfast: recetasPorTipo.breakfast.length,
      lunch: recetasPorTipo.lunch.length,
      dinner: recetasPorTipo.dinner.length,
      snacks: recetasPorTipo.snacks.length
    });
    
    // 3. Generar menú para cada día
    const dailyMenus = [];
    const startDate = new Date();
    
    for (let day = 1; day <= duration; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + (day - 1));
      
      // Seleccionar recetas aleatorias para cada comida
      const breakfast = seleccionarRecetaAleatoria(recetasPorTipo.breakfast);
      const lunch = seleccionarRecetaAleatoria(recetasPorTipo.lunch);
      const dinner = seleccionarRecetaAleatoria(recetasPorTipo.dinner);
      const snacks = day % 2 === 0 ? [seleccionarRecetaAleatoria(recetasPorTipo.snacks)] : [];
      
      // Calcular nutrición total del día
      const totalNutrition = calcularNutricionTotal(breakfast, lunch, dinner, snacks);
      
      const dayMenu = {
        day,
        date: currentDate,
        meals: {
          breakfast: crearMealInfo(breakfast),
          lunch: crearMealInfo(lunch),
          dinner: crearMealInfo(dinner),
          snacks: snacks.map(s => crearMealInfo(s)).filter(s => s !== null)
        },
        totalNutrition
      };
      
      dailyMenus.push(dayMenu);
    }
    
    console.log(`✅ ${dailyMenus.length} menús diarios generados`);
    return dailyMenus;
    
  } catch (error) {
    console.error('❌ Error al generar menús:', error);
    return [];
  }
}

// Generar listas de compras semanales
function generarListasCompras(dailyMenus, duration) {
  const totalWeeks = Math.ceil(duration / 7);
  const shoppingLists = [];
  
  for (let week = 1; week <= totalWeeks; week++) {
    const startDay = (week - 1) * 7 + 1;
    const endDay = Math.min(week * 7, duration);
    
    // Ingredientes básicos para cada semana
    const items = [
      { name: 'Quinua', quantity: '500g', category: 'Granos' },
      { name: 'Pollo', quantity: '1kg', category: 'Proteínas' },
      { name: 'Verduras variadas', quantity: '2kg', category: 'Verduras' },
      { name: 'Frutas de temporada', quantity: '1kg', category: 'Frutas' },
      { name: 'Huevos', quantity: '12 unidades', category: 'Proteínas' },
      { name: 'Leche', quantity: '1L', category: 'Lácteos' }
    ];
    
    shoppingLists.push({
      week,
      items,
      totalEstimatedCost: 50
    });
  }
  
  return shoppingLists;
}

// ====== RUTAS ESPECÍFICAS DE NUTRITION ======

// ===== RECETAS (PÚBLICAS) =====
app.get('/api/nutrition/recipes', verificarTokenOpcional, async (req, res) => {
  try {
    console.log('📖 Obteniendo recetas...');
    
    const { category, diet, healthGoal } = req.query;
    
    let filters = { isActive: true };
    if (category) filters.category = category;
    if (diet) filters[`diets.${diet}`] = true;
    if (healthGoal) filters.healthGoals = healthGoal;
    
    const recetas = await db.collection('recipes')
      .find(filters)
      .toArray();
    
    console.log(`✅ ${recetas.length} recetas encontradas`);
    res.json(recetas);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener recetas',
      message: error.message 
    });
  }
});

app.get('/api/nutrition/recipes/:id', verificarTokenOpcional, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📖 Buscando receta:', id);
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: 'ID inválido' 
      });
    }
    
    const receta = await db.collection('recipes').findOne({
      _id: new ObjectId(id)
    });
    
    if (!receta) {
      return res.status(404).json({ 
        error: 'Receta no encontrada' 
      });
    }
    
    console.log('✅ Receta encontrada:', receta.name);
    res.json(receta);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener receta',
      message: error.message 
    });
  }
});

// ===== ALIMENTOS (PÚBLICOS) =====
app.get('/api/nutrition/foods', verificarTokenOpcional, async (req, res) => {
  try {
    console.log('🥗 Obteniendo alimentos...');
    
    const { category, region, diet } = req.query;
    
    let filters = {};
    if (category) filters.category = category;
    if (region) filters.region = region;
    if (diet) filters[`diets.${diet}`] = true;
    
    const alimentos = await db.collection('foods')
      .find(filters)
      .toArray();
    
    console.log(`✅ ${alimentos.length} alimentos encontrados`);
    res.json(alimentos);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener alimentos',
      message: error.message 
    });
  }
});

app.get('/api/nutrition/foods/:id', verificarTokenOpcional, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🥗 Buscando alimento:', id);
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: 'ID inválido' 
      });
    }
    
    const alimento = await db.collection('foods').findOne({
      _id: new ObjectId(id)
    });
    
    if (!alimento) {
      return res.status(404).json({ 
        error: 'Alimento no encontrado' 
      });
    }
    
    console.log('✅ Alimento encontrado:', alimento.name);
    res.json(alimento);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener alimento',
      message: error.message 
    });
  }
});

// ===== PLANES NUTRICIONALES (PRIVADOS) =====

// Generar plan nutricional CON MENÚS
app.post('/api/nutrition/nutritionplans', verificarToken, async (req, res) => {
  try {
    const { duration = 30, planType, status } = req.body;
    const userId = req.user.uid;
    
    console.log('🟢 Generando plan para:', userId);
    console.log('📅 Duración:', duration);
    
    // Verificar si ya tiene un plan activo
    const planActivo = await db.collection('nutritionplans').findOne({
      userId,
      status: 'active'
    });
    
    if (planActivo) {
      return res.status(400).json({ 
        error: 'Ya tienes un plan activo',
        message: 'Cancela tu plan actual antes de crear uno nuevo' 
      });
    }
    
    // Obtener perfil de salud del usuario
    const perfil = await db.collection('perfiles_salud').findOne({ userId });
    
    if (!perfil) {
      return res.status(404).json({ 
        error: 'Perfil de salud no encontrado',
        message: 'Debes completar tu perfil de salud antes de generar un plan' 
      });
    }
    
    console.log('✅ Perfil de salud encontrado');
    
    // Crear fechas
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
    
    // Preparar perfil de usuario
    const userProfile = {
      age: perfil.edad,
      gender: perfil.genero,
      weight: perfil.peso,
      height: perfil.altura,
      bmi: perfil.imc,
      activityLevel: perfil.nivelActividad
    };
    
    // 🔥 GENERAR MENÚS DIARIOS AUTOMÁTICAMENTE
    console.log('🍽️ Iniciando generación de menús...');
    const dailyMenus = await generarMenusDiarios(
      db, 
      duration, 
      userProfile,
      perfil.objetivoSalud
    );
    
    // Calcular calorías objetivo
    const caloriasObjetivo = calcularCaloriasObjetivo(userProfile, perfil.objetivoSalud);
    
    // Generar listas de compras
    const weeklyShoppingLists = generarListasCompras(dailyMenus, duration);
    
    // Crear plan completo
    const plan = {
      userId,
      userEmail: req.user.email,
      duration,
      planType: planType || (duration === 7 ? 'semanal' : 'mensual'),
      status: status || 'active',
      startDate,
      endDate,
      userProfile,
      nutritionalGoals: {
        dailyCalories: caloriasObjetivo,
        protein: Math.round(caloriasObjetivo * 0.3 / 4),
        carbohydrates: Math.round(caloriasObjetivo * 0.45 / 4),
        fat: Math.round(caloriasObjetivo * 0.25 / 9)
      },
      dailyMenus, // 🔥 MENÚS GENERADOS
      weeklyShoppingLists, // 🔥 LISTAS DE COMPRAS
      progress: {
      completedDays: 0,
      completedDaysList: [], // 🔥 NUEVO
      adherence: 0,
      lastCompletedDay: null,
      lastCompletedDate: null
    },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('nutritionplans').insertOne(plan);
    
    console.log('✅ Plan creado con', dailyMenus.length, 'menús diarios');
    
    res.status(201).json({
      success: true,
      message: 'Plan generado exitosamente',
      data: { ...plan, _id: result.insertedId }
    });
    
  } catch (error) {
    console.error('❌ Error al generar plan:', error);
    res.status(500).json({ 
      error: 'Error al generar plan',
      message: error.message 
    });
  }
});

// Obtener todos los planes del usuario
app.get('/api/nutrition/nutritionplans', verificarToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const planes = await db.collection('nutritionplans')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(planes);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener planes',
      message: error.message 
    });
  }
});

// Obtener plan activo
app.get('/api/nutrition/plans/active', verificarToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log('📊 Buscando plan activo para:', userId);
    
    const plan = await db.collection('nutritionplans').findOne({
      userId,
      status: 'active'
    });
    
    if (!plan) {
      return res.status(404).json({ 
        error: 'No tienes un plan activo',
        message: 'Genera un nuevo plan nutricional' 
      });
    }
    
    console.log('✅ Plan encontrado');
    res.json(plan);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener plan',
      message: error.message 
    });
  }
});

// Obtener un plan específico por ID
app.get('/api/nutrition/nutritionplans/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: 'ID inválido' 
      });
    }
    
    const plan = await db.collection('nutritionplans').findOne({
      _id: new ObjectId(id),
      userId
    });
    
    if (!plan) {
      return res.status(404).json({ 
        error: 'Plan no encontrado' 
      });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener plan',
      message: error.message 
    });
  }
});

// Actualizar plan
app.put('/api/nutrition/nutritionplans/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const datos = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: 'ID inválido' 
      });
    }
    
    const result = await db.collection('nutritionplans').updateOne(
      { 
        _id: new ObjectId(id),
        userId 
      },
      { 
        $set: {
          ...datos,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'Plan no encontrado' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Plan actualizado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al actualizar plan',
      message: error.message 
    });
  }
});

// Eliminar plan
app.delete('/api/nutrition/nutritionplans/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    console.log('🗑️ Eliminando plan:', id);
    
    const result = await db.collection('nutritionplans').deleteOne({
      _id: new ObjectId(id),
      userId 
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    
    console.log('✅ Plan eliminado');
    
    res.json({ 
      success: true,
      message: 'Plan eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al eliminar plan',
      message: error.message 
    });
  }
});

// Obtener menú de un día específico
app.get('/api/nutrition/plans/menu/:day', verificarToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { day } = req.params;
    
    const plan = await db.collection('nutritionplans').findOne({
      userId,
      status: 'active'
    });
    
    if (!plan) {
      return res.status(404).json({ 
        error: 'No hay plan activo' 
      });
    }
    
    if (!plan.dailyMenus || plan.dailyMenus.length === 0) {
      return res.status(404).json({ 
        error: 'El plan no tiene menús diarios configurados' 
      });
    }
    
    const menu = plan.dailyMenus.find(m => m.day === parseInt(day));
    
    if (!menu) {
      return res.status(404).json({ 
        error: `Menú del día ${day} no encontrado` 
      });
    }
    
    res.json(menu);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener menú',
      message: error.message 
    });
  }
});

// Marcar día como completado
app.post('/api/nutrition/plans/complete/:day', verificarToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { day } = req.params;
    const dayNumber = parseInt(day);
    
    console.log(`✅ Marcando día ${dayNumber} para usuario:`, userId);
    
    // Obtener plan activo
    const plan = await db.collection('nutritionplans').findOne({
      userId,
      status: 'active'
    });
    
    if (!plan) {
      return res.status(404).json({ 
        error: 'No hay plan activo' 
      });
    }
    
    // 🔥 VERIFICAR SI EL DÍA YA FUE COMPLETADO
    const completedDaysList = plan.progress?.completedDaysList || [];
    
    if (completedDaysList.includes(dayNumber)) {
      return res.status(400).json({
        error: 'Día ya completado',
        message: `El día ${dayNumber} ya fue marcado como completado anteriormente`
      });
    }
    
    // 🔥 AGREGAR DÍA A LA LISTA DE COMPLETADOS
    const newCompletedDaysList = [...completedDaysList, dayNumber];
    const newCompletedDays = newCompletedDaysList.length;
    const adherence = Math.round((newCompletedDays / plan.duration) * 100);
    
    // Actualizar plan con la nueva información
    await db.collection('nutritionplans').updateOne(
      { _id: plan._id },
      {
        $set: {
          'progress.completedDays': newCompletedDays,
          'progress.completedDaysList': newCompletedDaysList,
          'progress.adherence': adherence,
          'progress.lastCompletedDay': dayNumber,
          'progress.lastCompletedDate': new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Día ${dayNumber} marcado como completado`);
    console.log(`📊 Total días completados: ${newCompletedDays}/${plan.duration}`);
    console.log(`📈 Adherencia: ${adherence}%`);
    
    res.json({
      success: true,
      message: `Día ${dayNumber} completado exitosamente`,
      progress: {
        completedDays: newCompletedDays,
        completedDaysList: newCompletedDaysList,
        adherence,
        lastCompletedDay: dayNumber,
        lastCompletedDate: new Date()
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al marcar día',
      message: error.message 
    });
  }
});

// 🔥 NUEVO ENDPOINT: Desmarcar día completado (opcional, por si cometes error)
app.delete('/api/nutrition/plans/complete/:day', verificarToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { day } = req.params;
    const dayNumber = parseInt(day);
    
    const plan = await db.collection('nutritionplans').findOne({
      userId,
      status: 'active'
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'No hay plan activo' });
    }
    
    const completedDaysList = plan.progress?.completedDaysList || [];
    
    // Remover el día de la lista
    const newCompletedDaysList = completedDaysList.filter(d => d !== dayNumber);
    const newCompletedDays = newCompletedDaysList.length;
    const adherence = Math.round((newCompletedDays / plan.duration) * 100);
    
    await db.collection('nutritionplans').updateOne(
      { _id: plan._id },
      {
        $set: {
          'progress.completedDays': newCompletedDays,
          'progress.completedDaysList': newCompletedDaysList,
          'progress.adherence': adherence,
          updatedAt: new Date()
        }
      }
    );
    
    res.json({
      success: true,
      message: `Día ${dayNumber} desmarcado`,
      progress: {
        completedDays: newCompletedDays,
        completedDaysList: newCompletedDaysList,
        adherence
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al desmarcar día',
      message: error.message 
    });
  }
});

// Obtener lista de compras semanal
app.get('/api/nutrition/plans/shopping-list/:week', verificarToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { week } = req.params;
    
    const plan = await db.collection('nutritionplans').findOne({
      userId,
      status: 'active'
    });
    
    if (!plan) {
      return res.status(404).json({ 
        error: 'No hay plan activo' 
      });
    }
    
    if (!plan.weeklyShoppingLists) {
      return res.json({ 
        week: parseInt(week), 
        items: [] 
      });
    }
    
    const shoppingList = plan.weeklyShoppingLists.find(
      list => list.week === parseInt(week)
    );
    
    if (!shoppingList) {
      return res.json({ 
        week: parseInt(week), 
        items: [] 
      });
    }
    
    res.json(shoppingList);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      error: 'Error al obtener lista',
      message: error.message 
    });
  }
});

// ====== RUTAS GENERALES ======

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API Nutriandina + MongoDB funcionando',
    timestamp: new Date().toISOString()
  });
});

// ===== CRUD GENÉRICO (PARA OTRAS COLECCIONES) =====

app.post('/api/:collection', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const datos = req.body;
    
    const documento = {
      ...datos,
      userId: req.user.uid,
      userEmail: req.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection(coleccion).insertOne(documento);
    
    res.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Documento creado exitosamente'
    });
  } catch (error) {
    console.error('Error en CREATE:', error);
    res.status(500).json({ 
      error: 'Error al crear documento',
      message: error.message 
    });
  }
});

app.get('/api/:collection', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    
    const documentos = await db.collection(coleccion)
      .find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(documentos);
  } catch (error) {
    console.error('Error en READ:', error);
    res.status(500).json({ 
      error: 'Error al obtener documentos',
      message: error.message 
    });
  }
});

app.get('/api/:collection/:id', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const id = req.params.id;
    
    const documento = await db.collection(coleccion).findOne({
      _id: new ObjectId(id),
      userId: req.user.uid
    });
    
    if (!documento) {
      return res.status(404).json({ 
        error: 'Documento no encontrado'
      });
    }
    
    res.json(documento);
  } catch (error) {
    console.error('Error en READ ONE:', error);
    res.status(500).json({ 
      error: 'Error al obtener documento',
      message: error.message 
    });
  }
});

app.put('/api/:collection/:id', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const id = req.params.id;
    const datos = req.body;
    
    const result = await db.collection(coleccion).updateOne(
      { 
        _id: new ObjectId(id),
        userId: req.user.uid 
      },
      { 
        $set: {
          ...datos,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'Documento no encontrado'
      });
    }
    
    res.json({ 
      success: true, 
      modified: result.modifiedCount,
      message: 'Documento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en UPDATE:', error);
    res.status(500).json({ 
      error: 'Error al actualizar documento',
      message: error.message 
    });
  }
});

app.delete('/api/:collection/:id', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const id = req.params.id;
    
    const result = await db.collection(coleccion).deleteOne({
      _id: new ObjectId(id),
      userId: req.user.uid
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        error: 'Documento no encontrado'
      });
    }
    
    res.json({ 
      success: true, 
      deleted: result.deletedCount,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en DELETE:', error);
    res.status(500).json({ 
      error: 'Error al eliminar documento',
      message: error.message 
    });
  }
});

app.post('/api/:collection/search', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const filtros = req.body.filters || {};
    
    const query = {
      userId: req.user.uid,
      ...filtros
    };
    
    const documentos = await db.collection(coleccion)
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(documentos);
  } catch (error) {
    console.error('Error en SEARCH:', error);
    res.status(500).json({ 
      error: 'Error al buscar documentos',
      message: error.message 
    });
  }
});

app.get('/api/:collection/count', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    
    const count = await db.collection(coleccion).countDocuments({
      userId: req.user.uid
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error en COUNT:', error);
    res.status(500).json({ 
      error: 'Error al contar documentos',
      message: error.message 
    });
  }
});

// ====== MANEJO DE ERRORES ======
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// ====== INICIAR SERVIDOR ======
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🚀 Servidor corriendo en puerto ${PORT}      ║
║  📊 MongoDB conectado                      ║
║  🔐 Firebase Authentication activo         ║
║  🍽️  Generador de menús activo             ║
║                                            ║
║  URL: http://localhost:${PORT}                ║
╚════════════════════════════════════════════╝
  `);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await client.close();
  process.exit(0);
});