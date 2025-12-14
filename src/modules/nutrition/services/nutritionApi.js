// src/modules/nutrition/services/nutritionApi.js
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { Alert } from 'react-native';
import { obtenerPerfilSalud as getPerfilFromMongo } from '../../../services/mongodb';

const API_URL = 'http://192.168.1.8:3000/api/nutrition';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token agregado');
      } else {
        console.warn('⚠️ Usuario no autenticado');
      }
    } catch (error) {
      console.error('❌ Error al obtener token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor mejorado para errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
      const message = error.response.data.message || 
                     error.response.data.error || 
                     'Error en el servidor';
      throw new Error(message);
    } else if (error.request) {
      console.error('❌ Network Error:', error.request);
      throw new Error('Error de conexión. Verifica tu internet.');
    } else {
      console.error('❌ Error:', error.message);
      throw new Error(error.message);
    }
  }
);

// ==================== PERFIL DE SALUD ====================

export const getHealthProfile = async () => {
  try {
    console.log('📋 Obteniendo perfil de salud desde MongoDB...');
    const perfil = await getPerfilFromMongo();
    
    if (!perfil) {
      throw new Error('No se encontró perfil de salud');
    }
    
    console.log('✅ Perfil obtenido:', perfil);
    return perfil;
    
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error.message);
    throw error;
  }
};

export const hasHealthProfile = async () => {
  try {
    await getHealthProfile();
    return true;
  } catch (error) {
    return false;
  }
};

export const createHealthProfile = async (profileData) => {
  try {
    console.log('📝 Creando perfil de salud...');
    const response = await api.post('/healthprofiles', profileData);
    console.log('✅ Perfil creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear perfil:', error.message);
    throw error;
  }
};

// ==================== PLANES NUTRICIONALES ====================

export const cancelNutritionPlan = async (planId) => {
  try {
    console.log('🗑️ Cancelando plan:', planId);
    const response = await api.delete(`/nutritionplans/${planId}`);
    console.log('✅ Plan cancelado exitosamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error al cancelar plan:', error.message);
    throw error;
  }
};

const crearPlanDirecto = async (duration) => {
  try {
    console.log('📝 Creando plan con duración:', duration);
    
    const response = await api.post('/nutritionplans', {
      duration,
      planType: duration === 7 ? 'semanal' : 'mensual',
      status: 'active'
    });
    
    console.log('✅ Plan creado exitosamente:', response.data);
    
    // Esperar 2 segundos para sincronización
    console.log('⏳ Esperando 2 segundos para sincronización...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar disponibilidad con reintentos
    console.log('🔍 Verificando disponibilidad del plan...');
    let planVerificado = null;
    let intentos = 0;
    const maxIntentos = 3;
    
    while (intentos < maxIntentos && !planVerificado) {
      try {
        const verificacion = await getActivePlan();
        if (verificacion && verificacion.data && verificacion.data._id === response.data.data._id) {
          planVerificado = verificacion.data;
          console.log('✅ Plan verificado y disponible');
        }
      } catch (error) {
        intentos++;
        if (intentos < maxIntentos) {
          console.log(`⏳ Intento ${intentos}/${maxIntentos} fallido, esperando 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    return planVerificado || response.data.data;
    
  } catch (error) {
    console.error('❌ Error al crear plan:', error.message);
    
    if (error.message.includes('health profile') || 
        error.message.includes('perfil de salud') ||
        error.message.includes('profile not found') ||
        error.message.includes('healthProfile')) {
      throw new Error('El backend requiere un perfil de salud. Por favor, completa tu perfil primero.');
    }
    
    if (error.message.includes('conexión') || error.message.includes('connection')) {
      throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
    }
    
    throw error;
  }
};

export const generateNutritionPlan = async (duration = 30) => {
  try {
    console.log('🚀 Iniciando generación de plan...');
    console.log('📅 Duración solicitada:', duration);

    // Verificar si hay un plan activo
    let planActivo = null;
    try {
      const response = await getActivePlan();
      planActivo = response.data;
    } catch (error) {
      console.log('ℹ️ No hay plan activo');
    }
    
    // Si hay plan activo, preguntar al usuario
    if (planActivo) {
      console.log('⚠️ Plan activo detectado:', planActivo._id);
      
      return new Promise((resolve, reject) => {
        Alert.alert(
          '⚠️ Plan activo encontrado',
          `Tienes un plan ${planActivo.planType || 'activo'} en curso.\n\n¿Deseas cancelarlo y crear uno nuevo de ${duration} días?`,
          [
            {
              text: 'No, mantener actual',
              style: 'cancel',
              onPress: () => {
                console.log('❌ Usuario canceló la operación');
                reject(new Error('Operación cancelada por el usuario'));
              }
            },
            {
              text: 'Sí, crear nuevo',
              style: 'destructive',
              onPress: async () => {
                try {
                  console.log('♻️ Usuario confirmó: cancelando plan anterior...');
                  
                  await cancelNutritionPlan(planActivo._id);
                  console.log('✅ Plan cancelado, esperando 1 segundo...');
                  
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  console.log('🔍 Verificando cancelación...');
                  try {
                    await getActivePlan();
                    console.warn('⚠️ El plan no se canceló correctamente, pero continuaremos...');
                  } catch (verifyError) {
                    console.log('✅ Verificado: ya no hay plan activo');
                  }
                  
                  const nuevoPlan = await crearPlanDirecto(duration);
                  console.log('🎉 Proceso completado exitosamente');
                  resolve(nuevoPlan);
                  
                } catch (error) {
                  console.error('❌ Error en el proceso:', error.message);
                  reject(error);
                }
              }
            }
          ],
          { cancelable: false }
        );
      });
    }

    // Si NO hay plan activo, crear uno nuevo
    console.log('✅ No hay plan activo, creando nuevo...');
    const nuevoPlan = await crearPlanDirecto(duration);
    return nuevoPlan;
    
  } catch (error) {
    console.error('❌ Error en generateNutritionPlan:', error.message);
    throw error;
  }
};

export const getActivePlan = async () => {
  try {
    console.log('📊 Buscando plan activo...');
    
    const response = await api.get('/nutritionplans');
    
    console.log(`ℹ️ Total de planes encontrados: ${response.data.length}`);
    
    if (!response.data || response.data.length === 0) {
      console.log('❌ No se encontraron planes');
      throw new Error('No tienes un plan nutricional activo. Genera uno nuevo.');
    }
    
    const activePlans = response.data.filter(plan => plan.status === 'active');
    
    console.log(`ℹ️ Planes activos encontrados: ${activePlans.length}`);
    
    if (activePlans.length === 0) {
      throw new Error('No tienes un plan nutricional activo. Genera uno nuevo.');
    }
    
    const activePlan = activePlans.sort((a, b) => 
      new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
    )[0];
    
    console.log('✅ Plan activo encontrado:', activePlan._id);
    return { data: activePlan };
    
  } catch (error) {
    if (error.message && !error.message.includes('No tienes un plan')) {
      console.error('❌ Error de conexión o servidor:', error.message);
    }
    throw error;
  }
};

export const getDailyMenu = async (day) => {
  try {
    console.log(`📅 Obteniendo menú del día ${day}...`);
    const planResponse = await getActivePlan();
    const plan = planResponse.data;
    
    if (!plan.dailyMenus || plan.dailyMenus.length === 0) {
      throw new Error('El plan no tiene menús diarios configurados.');
    }
    
    const dailyMenu = plan.dailyMenus.find(menu => menu.day === parseInt(day));
    
    if (!dailyMenu) {
      throw new Error(`Menú del día ${day} no encontrado.`);
    }
    
    console.log('✅ Menú encontrado');
    return { data: dailyMenu };
  } catch (error) {
    console.error('❌ Error al obtener menú diario:', error.message);
    throw error;
  }
};

// 🔥 FUNCIÓN CORREGIDA - USA EL ENDPOINT CORRECTO
export const markDayCompleted = async (day) => {
  try {
    console.log(`✓ Marcando día ${day} como completado...`);
    
    // 🔥 CAMBIO CRÍTICO: Usar POST /plans/complete/:day
    const response = await api.post(`/plans/complete/${day}`);
    
    console.log('✅ Día marcado como completado');
    console.log('📊 Progreso actualizado:', response.data.progress);
    
    return {
      data: response.data.progress
    };
    
  } catch (error) {
    console.error('❌ Error al marcar día:', error.message);
    throw error;
  }
};
// Agregar esta función en src/modules/nutrition/services/nutritionApi.js

// src/modules/nutrition/services/nutritionApi.js
// Actualizar/agregar esta función:

export const unmarkDayCompleted = async (day) => {
  try {
    const response = await api.delete(`/plans/complete/${day}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al desmarcar el día');
  }
};

export const getShoppingList = async (week) => {
  try {
    console.log(`🛒 Obteniendo lista de compras semana ${week}...`);
    
    // 🔥 USAR EL ENDPOINT CORRECTO
    const response = await api.get(`/plans/shopping-list/${week}`);
    
    console.log('✅ Lista de compras encontrada');
    return { data: response.data };
    
  } catch (error) {
    console.error('❌ Error al obtener lista:', error.message);
    throw error;
  }
};

// ==================== RECETAS ====================

export const getAllRecipes = async (filters = {}) => {
  try {
    console.log('📖 Obteniendo recetas...');
    
    if (Object.keys(filters).length > 0) {
      const response = await api.post('/recipes/search', { filters });
      return { data: response.data, count: response.data.length };
    }
    
    const response = await api.get('/recipes');
    console.log(`✅ ${response.data.length} recetas obtenidas`);
    return { data: response.data, count: response.data.length };
  } catch (error) {
    console.error('❌ Error al obtener recetas:', error.message);
    throw error;
  }
};

export const getRecipeById = async (id) => {
  try {
    console.log(`📖 Obteniendo receta ${id}...`);
    const response = await api.get(`/recipes/${id}`);
    return { data: response.data };
  } catch (error) {
    console.error('❌ Error al obtener receta:', error.message);
    throw error;
  }
};

export const adjustRecipeServings = async (id, servings) => {
  try {
    const recipeResponse = await getRecipeById(id);
    const recipe = recipeResponse.data;
    
    const multiplier = servings / recipe.servings;
    
    const adjustedRecipe = {
      ...recipe,
      servings,
      totalNutrition: {
        calories: Math.round(recipe.totalNutrition.calories * multiplier),
        protein: Math.round(recipe.totalNutrition.protein * multiplier * 10) / 10,
        carbohydrates: Math.round(recipe.totalNutrition.carbohydrates * multiplier * 10) / 10,
        fiber: Math.round(recipe.totalNutrition.fiber * multiplier * 10) / 10,
        fat: Math.round(recipe.totalNutrition.fat * multiplier * 10) / 10,
        sodium: Math.round(recipe.totalNutrition.sodium * multiplier)
      },
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        quantity: Math.round(ing.quantity * multiplier * 10) / 10
      }))
    };
    
    return { data: adjustedRecipe };
  } catch (error) {
    throw error;
  }
};

// ==================== ALIMENTOS ====================

export const getAllFoods = async (filters = {}) => {
  try {
    console.log('🥗 Obteniendo alimentos...');
    
    if (Object.keys(filters).length > 0) {
      const response = await api.post('/foods/search', { filters });
      return { data: response.data, count: response.data.length };
    }
    
    const response = await api.get('/foods');
    console.log(`✅ ${response.data.length} alimentos obtenidos`);
    return { data: response.data, count: response.data.length };
  } catch (error) {
    console.error('❌ Error al obtener alimentos:', error.message);
    throw error;
  }
};

// ==================== CALCULADORA ====================

export const calculateNutrition = async (items) => {
  try {
    let totalNutrition = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fiber: 0,
      fat: 0,
      sodium: 0,
      iron: 0,
      calcium: 0
    };
    
    for (const item of items) {
      const foodResponse = await api.get(`/foods/${item.foodId}`);
      const food = foodResponse.data;
      
      if (food && food.nutritionalInfo) {
        const multiplier = item.quantity / 100;
        
        totalNutrition.calories += food.nutritionalInfo.calories * multiplier;
        totalNutrition.protein += food.nutritionalInfo.protein * multiplier;
        totalNutrition.carbohydrates += food.nutritionalInfo.carbohydrates * multiplier;
        totalNutrition.fiber += food.nutritionalInfo.fiber * multiplier;
        totalNutrition.fat += food.nutritionalInfo.fat * multiplier;
        totalNutrition.sodium += food.nutritionalInfo.sodium * multiplier;
        totalNutrition.iron += (food.nutritionalInfo.iron || 0) * multiplier;
        totalNutrition.calcium += (food.nutritionalInfo.calcium || 0) * multiplier;
      }
    }
    
    Object.keys(totalNutrition).forEach(key => {
      totalNutrition[key] = Math.round(totalNutrition[key] * 10) / 10;
    });
    
    return { data: totalNutrition };
  } catch (error) {
    throw error;
  }
};

export default api;