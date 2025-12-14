/**
 * Servicios API centralizados para Nutriandina
 * Centraliza todas las llamadas a la API del backend
 */

const API_URL = 'http://192.168.1.8:3000/api'; // Cambiar según tu configuración

// ==================== CITAS ====================

export const appointmentsService = {
  // Obtener todos los nutricionistas disponibles
  getNutritionists: async (token) => {
    const response = await fetch(`${API_URL}/appointments/nutritionists`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Obtener disponibilidad de un nutricionista para una fecha
  getAvailability: async (token, nutritionistId, date) => {
    const response = await fetch(
      `${API_URL}/appointments/nutritionists/${nutritionistId}/availability?date=${date}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.json();
  },

  // Crear nueva cita
  createAppointment: async (token, data) => {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Obtener todas las citas del usuario
  getMyAppointments: async (token, status = null) => {
    const url = status
      ? `${API_URL}/appointments?status=${status}`
      : `${API_URL}/appointments`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Obtener cita por ID
  getAppointment: async (token, appointmentId) => {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Actualizar cita
  updateAppointment: async (token, appointmentId, data) => {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Cancelar cita
  cancelAppointment: async (token, appointmentId) => {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// ==================== FORO ====================

export const forumService = {
  // Obtener posts (feed)
  getPosts: async (token = null, page = 1, category = null) => {
    const params = new URLSearchParams({
      page,
      limit: 20,
      ...(category && { category })
    });

    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/forum?${params}`, { headers });
    return response.json();
  },

  // Obtener post por ID
  getPost: async (token = null, postId) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/forum/${postId}`, { headers });
    return response.json();
  },

  // Crear post
  createPost: async (token, content, category, tags = []) => {
    const response = await fetch(`${API_URL}/forum`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, category, tags })
    });
    return response.json();
  },

  // Editar post
  updatePost: async (token, postId, data) => {
    const response = await fetch(`${API_URL}/forum/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Eliminar post
  deletePost: async (token, postId) => {
    const response = await fetch(`${API_URL}/forum/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Dar/quitar like
  likePost: async (token, postId) => {
    const response = await fetch(`${API_URL}/forum/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Agregar comentario
  addComment: async (token, postId, content) => {
    const response = await fetch(`${API_URL}/forum/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    return response.json();
  },

  // Eliminar comentario
  deleteComment: async (token, postId, commentId) => {
    const response = await fetch(
      `${API_URL}/forum/${postId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.json();
  },

  // Obtener mis posts
  getMyPosts: async (token) => {
    const response = await fetch(`${API_URL}/forum/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// ==================== BLOGS ====================

export const blogsService = {
  // Obtener blogs
  getBlogs: async (token = null, filters = {}) => {
    const { page = 1, category, type, search } = filters;
    const params = new URLSearchParams({
      page,
      limit: 20,
      ...(category && { category }),
      ...(type && { type }),
      ...(search && { search })
    });

    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/blogs?${params}`, { headers });
    return response.json();
  },

  // Obtener blog por ID
  getBlog: async (token = null, blogId) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_URL}/blogs/${blogId}`, { headers });
    return response.json();
  },

  // Crear blog
  createBlog: async (token, data) => {
    const response = await fetch(`${API_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Editar blog
  updateBlog: async (token, blogId, data) => {
    const response = await fetch(`${API_URL}/blogs/${blogId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Eliminar blog
  deleteBlog: async (token, blogId) => {
    const response = await fetch(`${API_URL}/blogs/${blogId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Dar/quitar like
  likeBlog: async (token, blogId) => {
    const response = await fetch(`${API_URL}/blogs/${blogId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Agregar comentario
  addComment: async (token, blogId, content) => {
    const response = await fetch(`${API_URL}/blogs/${blogId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    return response.json();
  },

  // Obtener blogs populares
  getPopularBlogs: async (token = null, limit = 10) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(
      `${API_URL}/blogs/featured/popular?limit=${limit}`,
      { headers }
    );
    return response.json();
  },

  // Obtener mis blogs
  getMyBlogs: async (token) => {
    const response = await fetch(`${API_URL}/blogs/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// ==================== CHATBOT ====================

export const chatbotService = {
  // Enviar mensaje
  sendMessage: async (token, message, conversationId = null) => {
    const response = await fetch(`${API_URL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, conversationId })
    });
    return response.json();
  },

  // Obtener conversaciones
  getConversations: async (token) => {
    const response = await fetch(`${API_URL}/chatbot/conversations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Obtener conversación por ID
  getConversation: async (token, conversationId) => {
    const response = await fetch(
      `${API_URL}/chatbot/conversations/${conversationId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.json();
  },

  // Eliminar conversación
  deleteConversation: async (token, conversationId) => {
    const response = await fetch(
      `${API_URL}/chatbot/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.json();
  },

  // Limpiar todas las conversaciones
  clearAllConversations: async (token) => {
    const response = await fetch(`${API_URL}/chatbot/conversations`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Obtener sugerencias
  getSuggestions: async (token) => {
    const response = await fetch(`${API_URL}/chatbot/suggestions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// ==================== UTILIDADES ====================

// Función helper para manejar errores
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  return 'Ocurrió un error. Por favor, intenta nuevamente.';
};

// Función helper para verificar respuesta exitosa
export const isSuccessResponse = (response) => {
  return response.ok || response.success === true;
};

export default {
  appointmentsService,
  forumService,
  blogsService,
  chatbotService,
  handleApiError,
  isSuccessResponse
};