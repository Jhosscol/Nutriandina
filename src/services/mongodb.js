// src/services/mongodb.js
import { auth } from '../config/firebase';

// Cambia esto según donde esté tu backend
const API_URL = __DEV__ 
  ? 'http://192.168.1.8:3000/api'  // Desarrollo local
  : 'https://tu-backend-produccion.com/api'; // Cuando despliegues

// Helper para obtener token de Firebase
const getAuthToken = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No hay usuario autenticado. Por favor inicia sesión.');
  }
  
  try {
    const token = await user.getIdToken(true); // true = forzar refresh si expiró
    return token;
  } catch (error) {
    console.error('Error obteniendo token:', error);
    throw new Error('Error de autenticación. Por favor inicia sesión nuevamente.');
  }
};

// Helper para hacer requests
const request = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ===== FUNCIONES CRUD GENÉRICAS =====

export const crear = (coleccion, datos) => 
  request(`/${coleccion}`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });

export const obtener = (coleccion) => 
  request(`/${coleccion}`);

export const obtenerUno = (coleccion, id) => 
  request(`/${coleccion}/${id}`);

export const actualizar = (coleccion, id, datos) => 
  request(`/${coleccion}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });

export const eliminar = (coleccion, id) => 
  request(`/${coleccion}/${id}`, {
    method: 'DELETE',
  });

export const buscar = (coleccion, filtros) => 
  request(`/${coleccion}/search`, {
    method: 'POST',
    body: JSON.stringify({ filters: filtros }),
  });

export const contar = (coleccion) => 
  request(`/${coleccion}/count`);

// ===== FUNCIONES ESPECÍFICAS POR COLECCIÓN =====

// Items
export const crearItem = (datos) => crear('items', datos);
export const obtenerItems = () => obtener('items');
export const obtenerItem = (id) => obtenerUno('items', id);
export const actualizarItem = (id, datos) => actualizar('items', id, datos);
export const eliminarItem = (id) => eliminar('items', id);

// Usuarios (perfil, configuraciones, etc.)
export const crearPerfil = (datos) => crear('perfiles', datos);
export const obtenerPerfil = () => obtener('perfiles').then(perfiles => perfiles[0]);
export const actualizarPerfil = (id, datos) => actualizar('perfiles', id, datos);

// src/services/mongodb.js
// ... código existente ...

// ===== FUNCIONES PARA PERFIL DE SALUD =====

// Crear o actualizar perfil de salud completo
export const guardarPerfilSalud = async (datosCompletos) => {
  try {
    const userId = auth.currentUser.uid;
    
    // Verificar si ya existe un perfil
    const perfilesExistentes = await obtener('perfiles_salud');
    
    const datosPerfilSalud = {
      // Información básica
      edad: datosCompletos.basicInfo.age,
      genero: datosCompletos.basicInfo.gender,
      peso: parseFloat(datosCompletos.basicInfo.weight),
      altura: parseFloat(datosCompletos.basicInfo.height),
      nivelActividad: datosCompletos.basicInfo.activityLevel,
      fumador: datosCompletos.basicInfo.smoker,
      
      // Condiciones de salud
      condicionesSalud: datosCompletos.conditions || [],
      
      // Alergias alimentarias
      alergiasAlimentarias: datosCompletos.allergies || [],
      
      // Preferencias
      preferencias: {
        vegetariano: datosCompletos.preferences.vegetarian || false,
        vegano: datosCompletos.preferences.vegan || false,
        objetivosSalud: datosCompletos.preferences.selectedGoals || [],
        alimentosEvitar: datosCompletos.preferences.dislikes || [],
        alimentosFavoritos: datosCompletos.preferences.favorites || [],
      },
      
      // Calcular IMC
      imc: calcularIMC(
        parseFloat(datosCompletos.basicInfo.weight),
        parseFloat(datosCompletos.basicInfo.height)
      ),
      
      // Metadata
      userId,
      userEmail: auth.currentUser.email,
      perfilCompletado: true,
      fechaCompletado: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    };
    
    if (perfilesExistentes.length > 0) {
      // Actualizar perfil existente
      console.log('📝 Actualizando perfil existente...');
      await actualizar('perfiles_salud', perfilesExistentes[0]._id, datosPerfilSalud);
      return { success: true, action: 'updated' };
    } else {
      // Crear nuevo perfil
      console.log('📝 Creando nuevo perfil...');
      await crear('perfiles_salud', datosPerfilSalud);
      return { success: true, action: 'created' };
    }
  } catch (error) {
    console.error('❌ Error guardando perfil de salud:', error);
    throw error;
  }
};

// Obtener perfil de salud del usuario
export const obtenerPerfilSalud = async () => {
  try {
    const perfiles = await obtener('perfiles_salud');
    
    if (perfiles.length > 0) {
      console.log('✅ Perfil de salud encontrado');
      return perfiles[0]; // Retornar el primer (y único) perfil
    }
    
    console.log('⚠️ No se encontró perfil de salud');
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo perfil de salud:', error);
    throw error;
  }
};

// Actualizar solo un campo del perfil
export const actualizarCampoPerfilSalud = async (campo, valor) => {
  try {
    const perfiles = await obtener('perfiles_salud');
    
    if (perfiles.length > 0) {
      await actualizar('perfiles_salud', perfiles[0]._id, {
        [campo]: valor,
        ultimaActualizacion: new Date().toISOString()
      });
      return { success: true };
    }
    
    throw new Error('No se encontró perfil de salud');
  } catch (error) {
    console.error('❌ Error actualizando campo:', error);
    throw error;
  }
};

// Helper para calcular IMC
const calcularIMC = (peso, altura) => {
  const alturaMetros = altura / 100;
  const imc = peso / (alturaMetros * alturaMetros);
  return parseFloat(imc.toFixed(1));
};

// Agregar métrica de salud (peso, glucosa, presión, etc.)
export const agregarMetrica = async (tipoMetrica, valor, unidad, notas = '') => {
  try {
    await crear('metricas_salud', {
      tipo: tipoMetrica, // 'peso', 'glucosa', 'presion_arterial', etc.
      valor: valor,
      unidad: unidad,
      notas: notas,
      fecha: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Error agregando métrica:', error);
    throw error;
  }
};

// Obtener historial de métricas
export const obtenerMetricas = async (tipoMetrica = null, limite = 30) => {
  try {
    let metricas = await obtener('metricas_salud');
    
    // Filtrar por tipo si se especifica
    if (tipoMetrica) {
      metricas = metricas.filter(m => m.tipo === tipoMetrica);
    }
    
    // Ordenar por fecha descendente y limitar
    metricas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return metricas.slice(0, limite);
  } catch (error) {
    console.error('❌ Error obteniendo métricas:', error);
    throw error;
  }
};