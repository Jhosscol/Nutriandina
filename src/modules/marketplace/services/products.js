// src/modules/marketplace/services/products.js
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    where
} from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const marketplaceProductsService = {
  // Obtener todos los productos activos
  async getAllProducts(filters = {}) {
    try {
      let q = query(
        collection(db, 'products'),
        where('active', '==', true)
      );

      // Aplicar filtros
      if (filters.category && filters.category !== 'all') {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters.sortBy === 'price-asc') {
        q = query(q, orderBy('price', 'asc'));
      } else if (filters.sortBy === 'price-desc') {
        q = query(q, orderBy('price', 'desc'));
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, products };
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener productos por categoría
  async getProductsByCategory(category) {
    try {
      const q = query(
        collection(db, 'products'),
        where('active', '==', true),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, products };
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error);
      return { success: false, error: error.message };
    }
  },

  // Buscar productos
  async searchProducts(searchTerm) {
    try {
      // Obtener todos los productos activos
      const q = query(
        collection(db, 'products'),
        where('active', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const searchLower = searchTerm.toLowerCase();
        
        // Buscar en nombre, descripción y categoría
        if (
          data.name.toLowerCase().includes(searchLower) ||
          data.description.toLowerCase().includes(searchLower) ||
          data.category.toLowerCase().includes(searchLower) ||
          data.origin?.toLowerCase().includes(searchLower)
        ) {
          products.push({
            id: doc.id,
            ...data
          });
        }
      });

      return { success: true, products };
    } catch (error) {
      console.error('Error al buscar productos:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener un producto por ID
  async getProductById(productId) {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));

      if (productDoc.exists()) {
        return {
          success: true,
          product: {
            id: productDoc.id,
            ...productDoc.data()
          }
        };
      } else {
        return { success: false, error: 'Producto no encontrado' };
      }
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener productos del mismo proveedor
  async getProviderProducts(providerId, excludeProductId = null) {
    try {
      const q = query(
        collection(db, 'products'),
        where('active', '==', true),
        where('providerId', '==', providerId),
        limit(6)
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        if (doc.id !== excludeProductId) {
          products.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });

      return { success: true, products };
    } catch (error) {
      console.error('Error al obtener productos del proveedor:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener productos recomendados (por categoría similar)
  async getRecommendedProducts(category, excludeProductId = null, limitCount = 6) {
    try {
      const q = query(
        collection(db, 'products'),
        where('active', '==', true),
        where('category', '==', category),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        if (doc.id !== excludeProductId) {
          products.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });

      return { success: true, products };
    } catch (error) {
      console.error('Error al obtener productos recomendados:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener categorías disponibles
  async getAvailableCategories() {
    try {
      const q = query(
        collection(db, 'products'),
        where('active', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const categoriesSet = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.category) {
          categoriesSet.add(data.category);
        }
      });

      const categories = Array.from(categoriesSet).sort();
      return { success: true, categories };
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return { success: false, error: error.message };
    }
  },

  // Verificar disponibilidad de stock
  async checkStock(productId, quantity) {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));

      if (productDoc.exists()) {
        const product = productDoc.data();
        return {
          success: true,
          available: product.stock >= quantity,
          currentStock: product.stock
        };
      } else {
        return { success: false, error: 'Producto no encontrado' };
      }
    } catch (error) {
      console.error('Error al verificar stock:', error);
      return { success: false, error: error.message };
    }
  }
};