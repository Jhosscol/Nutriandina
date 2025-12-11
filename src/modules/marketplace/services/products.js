// src/modules/marketplace/services/products.js
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const marketplaceProductsService = {
  // Obtener todos los productos activos (SIMPLIFICADO)
  async getAllProducts(filters = {}) {
    try {
      console.log('📦 Obteniendo productos del marketplace...');
      
      // Consulta simple: solo filtrar por activos
      let q = query(
        collection(db, 'products'),
        where('active', '==', true)
      );

      // NO agregar orderBy ni filtros adicionales por ahora
      // Esto evita la necesidad de índices compuestos

      const querySnapshot = await getDocs(q);
      let products = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ ${products.length} productos encontrados`);

      // FILTRAR Y ORDENAR EN MEMORIA (sin usar Firestore)
      if (filters.category && filters.category !== 'all') {
        products = products.filter(p => p.category === filters.category);
      }

      // Ordenar en memoria
      if (filters.sortBy === 'price-asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (filters.sortBy === 'price-desc') {
        products.sort((a, b) => b.price - a.price);
      } else {
        // Ordenar por fecha (más reciente primero)
        products.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
      }

      return { success: true, products };
    } catch (error) {
      console.error('❌ Error al obtener productos:', error);
      return { success: false, error: error.message, products: [] };
    }
  },

  // Obtener productos por categoría (SIMPLIFICADO)
  async getProductsByCategory(category) {
    try {
      console.log(`📦 Obteniendo productos de categoría: ${category}`);
      
      const q = query(
        collection(db, 'products'),
        where('active', '==', true),
        where('category', '==', category)
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Ordenar en memoria por fecha
      products.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

      console.log(`✅ ${products.length} productos encontrados`);
      return { success: true, products };
    } catch (error) {
      console.error('❌ Error al obtener productos por categoría:', error);
      return { success: false, error: error.message, products: [] };
    }
  },

  // Buscar productos (SIMPLIFICADO - sin índices)
  async searchProducts(searchTerm) {
    try {
      console.log(`🔍 Buscando: ${searchTerm}`);
      
      // Obtener TODOS los productos activos
      const q = query(
        collection(db, 'products'),
        where('active', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const products = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const searchLower = searchTerm.toLowerCase();
        
        // Buscar en memoria
        if (
          data.name.toLowerCase().includes(searchLower) ||
          data.description?.toLowerCase().includes(searchLower) ||
          data.category?.toLowerCase().includes(searchLower) ||
          data.origin?.toLowerCase().includes(searchLower) ||
          data.providerName?.toLowerCase().includes(searchLower)
        ) {
          products.push({
            id: doc.id,
            ...data
          });
        }
      });

      console.log(`✅ ${products.length} productos encontrados`);
      return { success: true, products };
    } catch (error) {
      console.error('❌ Error al buscar productos:', error);
      return { success: false, error: error.message, products: [] };
    }
  },

  // Obtener un producto por ID
  async getProductById(productId) {
    try {
      console.log(`📦 Obteniendo producto: ${productId}`);
      const productDoc = await getDoc(doc(db, 'products', productId));

      if (productDoc.exists()) {
        console.log('✅ Producto encontrado');
        return {
          success: true,
          product: {
            id: productDoc.id,
            ...productDoc.data()
          }
        };
      } else {
        console.warn('⚠️ Producto no encontrado');
        return { success: false, error: 'Producto no encontrado' };
      }
    } catch (error) {
      console.error('❌ Error al obtener producto:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener productos del mismo proveedor
  async getProviderProducts(providerId, excludeProductId = null) {
    try {
      console.log(`📦 Obteniendo productos del proveedor: ${providerId}`);
      
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

      console.log(`✅ ${products.length} productos encontrados`);
      return { success: true, products };
    } catch (error) {
      console.error('❌ Error al obtener productos del proveedor:', error);
      return { success: false, error: error.message, products: [] };
    }
  },

  // Obtener productos recomendados
  async getRecommendedProducts(category, excludeProductId = null, limitCount = 6) {
    try {
      console.log(`📦 Obteniendo productos recomendados: ${category}`);
      
      const q = query(
        collection(db, 'products'),
        where('active', '==', true),
        where('category', '==', category),
        limit(limitCount + 1) // +1 para excluir el actual
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

      console.log(`✅ ${products.length} productos recomendados`);
      return { success: true, products: products.slice(0, limitCount) };
    } catch (error) {
      console.error('❌ Error al obtener productos recomendados:', error);
      return { success: false, error: error.message, products: [] };
    }
  },

  // Obtener categorías disponibles
  async getAvailableCategories() {
    try {
      console.log('📦 Obteniendo categorías disponibles...');
      
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
      console.log(`✅ ${categories.length} categorías encontradas`);
      return { success: true, categories };
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
      return { success: false, error: error.message, categories: [] };
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
      console.error('❌ Error al verificar stock:', error);
      return { success: false, error: error.message };
    }
  }
};