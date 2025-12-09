// Servicio de Firestore para todas las colecciones
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export class FirestoreService {
  
  // ==================== MEAL PLANS ====================
  
  // Guardar plan nutricional del usuario
  static async saveMealPlan(mealPlan) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const planData = {
        ...mealPlan,
        userId,
        createdAt: serverTimestamp(),
        active: true,
      };
      
      const docRef = await addDoc(collection(db, 'mealPlans'), planData);
      
      return { success: true, planId: docRef.id };
    } catch (error) {
      console.error('Error saving meal plan:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtener plan nutricional actual del usuario
  static async getCurrentMealPlan() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const q = query(
        collection(db, 'mealPlans'),
        where('userId', '==', userId),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          success: true,
          plan: { id: doc.id, ...doc.data() },
        };
      }
      
      return { success: false, error: 'No hay plan activo' };
    } catch (error) {
      console.error('Error getting meal plan:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtener historial de planes
  static async getMealPlanHistory(limitCount = 10) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const q = query(
        collection(db, 'mealPlans'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const plans = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      return { success: true, plans };
    } catch (error) {
      console.error('Error getting meal plan history:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ==================== MEALS LOGGING ====================
  
  // Registrar comida consumida
  static async logMeal(mealData) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const mealDoc = {
        ...mealData,
        userId,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
      };
      
      const docRef = await addDoc(collection(db, 'mealsLog'), mealDoc);
      
      // Actualizar estadísticas del usuario
      await this.incrementUserStats('mealsLogged', 1);
      
      return { success: true, mealId: docRef.id };
    } catch (error) {
      console.error('Error logging meal:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtener comidas registradas por fecha
  static async getMealsByDate(date) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const q = query(
        collection(db, 'mealsLog'),
        where('userId', '==', userId),
        where('date', '==', date),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const meals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      return { success: true, meals };
    } catch (error) {
      console.error('Error getting meals:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ==================== HEALTH TRACKING ====================
  
  // Registrar peso
  static async logWeight(weight, notes = '') {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const weightDoc = {
        userId,
        weight,
        notes,
        date: new Date().toISOString().split('T')[0],
        timestamp: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'weightLog'), weightDoc);
      
      return { success: true, logId: docRef.id };
    } catch (error) {
      console.error('Error logging weight:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtener historial de peso
  static async getWeightHistory(days = 30) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const dateStr = cutoffDate.toISOString().split('T')[0];
      
      const q = query(
        collection(db, 'weightLog'),
        where('userId', '==', userId),
        where('date', '>=', dateStr),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const weights = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      return { success: true, weights };
    } catch (error) {
      console.error('Error getting weight history:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Registrar presión arterial
  static async logBloodPressure(systolic, diastolic, heartRate = null) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const bpDoc = {
        userId,
        systolic,
        diastolic,
        heartRate,
        date: new Date().toISOString().split('T')[0],
        timestamp: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'bloodPressureLog'), bpDoc);
      
      return { success: true, logId: docRef.id };
    } catch (error) {
      console.error('Error logging blood pressure:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Registrar glucosa
  static async logBloodGlucose(glucose, mealContext) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const glucoseDoc = {
        userId,
        glucose,
        mealContext,
        date: new Date().toISOString().split('T')[0],
        timestamp: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'bloodGlucoseLog'), glucoseDoc);
      
      return { success: true, logId: docRef.id };
    } catch (error) {
      console.error('Error logging blood glucose:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ==================== RECIPES ====================
  
  // Guardar receta favorita
  static async addFavoriteRecipe(recipeId) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      await updateDoc(doc(db, 'users', userId), {
        favoriteRecipes: arrayUnion(recipeId),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error adding favorite recipe:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Remover receta favorita
  static async removeFavoriteRecipe(recipeId) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      await updateDoc(doc(db, 'users', userId), {
        favoriteRecipes: arrayRemove(recipeId),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error removing favorite recipe:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtener recetas favoritas
  static async getFavoriteRecipes() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      return {
        success: true,
        favoriteRecipes: userData?.favoriteRecipes || [],
      };
    } catch (error) {
      console.error('Error getting favorite recipes:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ==================== ORDERS ====================
  
  // Crear orden
  static async createOrder(orderData) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const order = {
        ...orderData,
        userId,
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'orders'), order);
      
      // Actualizar estadísticas
      await this.incrementUserStats('ordersCount', 1);
      
      return { success: true, orderId: docRef.id };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtener órdenes del usuario
  static async getUserOrders(limitCount = 20) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      return { success: true, orders };
    } catch (error) {
      console.error('Error getting orders:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Actualizar estado de orden
  static async updateOrderStatus(orderId, status) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ==================== ADDRESSES ====================
  
  // Guardar dirección
  static async saveAddress(address) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const addressDoc = {
        ...address,
        userId,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'addresses'), addressDoc);
      
      return { success: true, addressId: docRef.id };
    } catch (error) {
      console.error('Error saving address:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtener direcciones del usuario
  static async getUserAddresses() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      const q = query(
        collection(db, 'addresses'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const addresses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      return { success: true, addresses };
    } catch (error) {
      console.error('Error getting addresses:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Eliminar dirección
  static async deleteAddress(addressId) {
    try {
      await deleteDoc(doc(db, 'addresses', addressId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting address:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ==================== STATISTICS ====================
  
  // Incrementar estadísticas del usuario
  static async incrementUserStats(field, value = 1) {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Usuario no autenticado');
      
      await updateDoc(doc(db, 'users', userId), {
        [`stats.${field}`]: increment(value),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error incrementing stats:', error);
      return { success: false, error: error.message };
    }
  }
  
  // ==================== PRODUCTS (Para Marketplace) ====================
  
  // Obtener todos los productos
  static async getProducts(category = null, limitCount = 50) {
    try {
      let q;
      
      if (category && category !== 'all') {
        q = query(
          collection(db, 'products'),
          where('category', '==', category),
          where('active', '==', true),
          orderBy('name', 'asc'),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, 'products'),
          where('active', '==', true),
          orderBy('name', 'asc'),
          limit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      return { success: true, products };
    } catch (error) {
      console.error('Error getting products:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Buscar productos
  static async searchProducts(searchTerm) {
    try {
      // Nota: Para búsqueda completa, considera usar Algolia o similar
      // Esta es una búsqueda básica
      const q = query(
        collection(db, 'products'),
        where('active', '==', true),
        orderBy('name', 'asc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      return { success: true, products };
    } catch (error) {
      console.error('Error searching products:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtener producto por ID
  static async getProductById(productId) {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      
      if (productDoc.exists()) {
        return {
          success: true,
          product: { id: productDoc.id, ...productDoc.data() },
        };
      }
      
      return { success: false, error: 'Producto no encontrado' };
    } catch (error) {
      console.error('Error getting product:', error);
      return { success: false, error: error.message };
    }
  }
}

export default FirestoreService;