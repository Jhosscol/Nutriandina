// src/services/api.js
import { auth } from '../config/firebase';

// Cambia esto según donde esté tu backend
const API_URL = __DEV__ 
  ? 'http://192.168.1.8:3000/api'  // Desarrollo
  : 'https://tu-backend-production.com/api'; // Producción

// Helper para obtener token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay usuario autenticado');
  return await user.getIdToken();
};

// === ITEMS ===
export const crearItem = async (data) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Error al crear item');
  return await response.json();
};

export const obtenerItems = async () => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/items`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Error al obtener items');
  return await response.json();
};

export const actualizarItem = async (id, data) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Error al actualizar item');
  return await response.json();
};

export const eliminarItem = async (id) => {
  const token = await getAuthToken();
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Error al eliminar item');
  return await response.json();
};