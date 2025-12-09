// src/modules/providers/services/productManagement.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { cloudinaryService } from '../../../services/cloudinaryService';

export const productManagementService = {
  async createProduct(providerId, providerName, productData) {
    try {
      const productRef = await addDoc(collection(db, 'products'), {
        providerId,
        providerName,
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category,
        images: productData.images || [],
        stock: parseInt(productData.stock),
        unit: productData.unit,
        origin: productData.origin || '',
        nutritionalInfo: productData.nutritionalInfo || {},
        active: true,
        createdAt: serverTimestamp()
      });

      return { success: true, productId: productRef.id };
    } catch (error) {
      console.error('Error al crear producto:', error);
      return { success: false, error: error.message };
    }
  },

  async updateProduct(productId, updates) {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, updates);
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteProduct(productId) {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      return { success: false, error: error.message };
    }
  },

  async toggleProductStatus(productId, active) {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { active });
      return { success: true };
    } catch (error) {
      console.error('Error al cambiar estado del producto:', error);
      return { success: false, error: error.message };
    }
  },

  async getProviderProducts(providerId) {
    try {
      const q = query(
        collection(db, 'products'),
        where('providerId', '==', providerId)
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
      console.error('Error al obtener productos:', error);
      return { success: false, error: error.message };
    }
  },

  async uploadProductImage(productId, imageUri, index = 0) {
    try {
      console.log(`📸 Subiendo imagen ${index + 1} del producto:`, productId);

      const result = await cloudinaryService.uploadImage(
        imageUri,
        `products/${productId}`
      );

      return result;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      return { success: false, error: error.message };
    }
  },

  async uploadProductImages(productId, imageUris) {
    try {
      console.log(`📸 Subiendo ${imageUris.length} imágenes del producto:`, productId);

      const result = await cloudinaryService.uploadMultipleImages(
        imageUris,
        `products/${productId}`
      );

      return result;
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      return { success: false, error: error.message };
    }
  },

  async updateStock(productId, newStock) {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { stock: parseInt(newStock) });
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      return { success: false, error: error.message };
    }
  },

  getCategories() {
    return [
      'Granos',
      'Tubérculos',
      'Legumbres',
      'Frutas',
      'Verduras',
      'Especias',
      'Harinas',
      'Bebidas',
      'Snacks',
      'Otros'
    ];
  },

  getUnits() {
    return [
      'kg',
      'g',
      'lb',
      'unidad',
      'paquete',
      'litro',
      'ml'
    ];
  }
};