// src/modules/marketplace/services/orders.js
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../../../config/firebase';

export const ordersService = {
  // Crear una nueva orden
  async createOrder(userId, orderData) {
    try {
      const order = {
        userId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        shippingAddress: orderData.shippingAddress,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost || 0,
        discount: orderData.discount || 0,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        paymentId: orderData.paymentId || '',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const orderRef = await addDoc(collection(db, 'orders'), order);

      // Actualizar stock de productos
      for (const item of orderData.items) {
        await this.updateProductStock(item.productId, item.quantity);
      }

      return { 
        success: true, 
        orderId: orderRef.id,
        message: 'Orden creada exitosamente'
      };
    } catch (error) {
      console.error('Error al crear orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Actualizar stock del producto después de una compra
  async updateProductStock(productId, quantityPurchased) {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const currentStock = productDoc.data().stock;
        const newStock = currentStock - quantityPurchased;

        await updateDoc(productRef, {
          stock: newStock >= 0 ? newStock : 0
        });

        return { success: true };
      } else {
        return { success: false, error: 'Producto no encontrado' };
      }
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener órdenes del usuario
  async getUserOrders(userId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const orders = [];

      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return { success: true, orders };
    } catch (error) {
      console.error('Error al obtener órdenes del usuario:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener una orden por ID
  async getOrderById(orderId) {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));

      if (orderDoc.exists()) {
        return {
          success: true,
          order: {
            id: orderDoc.id,
            ...orderDoc.data()
          }
        };
      } else {
        return { success: false, error: 'Orden no encontrada' };
      }
    } catch (error) {
      console.error('Error al obtener orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Cancelar una orden
  async cancelOrder(orderId, userId) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        return { success: false, error: 'Orden no encontrada' };
      }

      const orderData = orderDoc.data();

      // Verificar que la orden pertenece al usuario
      if (orderData.userId !== userId) {
        return { success: false, error: 'No autorizado' };
      }

      // Solo se pueden cancelar órdenes pendientes
      if (orderData.status !== 'pending') {
        return { 
          success: false, 
          error: 'Solo se pueden cancelar órdenes pendientes' 
        };
      }

      // Actualizar estado de la orden
      await updateDoc(orderRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      // Devolver stock a los productos
      for (const item of orderData.items) {
        await this.restoreProductStock(item.productId, item.quantity);
      }

      return { 
        success: true, 
        message: 'Orden cancelada exitosamente' 
      };
    } catch (error) {
      console.error('Error al cancelar orden:', error);
      return { success: false, error: error.message };
    }
  },

  // Restaurar stock del producto (cuando se cancela una orden)
  async restoreProductStock(productId, quantityToRestore) {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const currentStock = productDoc.data().stock;
        const newStock = currentStock + quantityToRestore;

        await updateDoc(productRef, {
          stock: newStock
        });

        return { success: true };
      } else {
        return { success: false, error: 'Producto no encontrado' };
      }
    } catch (error) {
      console.error('Error al restaurar stock:', error);
      return { success: false, error: error.message };
    }
  },

  // Aplicar cupón de descuento
  async applyCoupon(couponCode) {
    try {
      const q = query(
        collection(db, 'coupons'),
        where('code', '==', couponCode.toUpperCase()),
        where('active', '==', true)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { 
          success: false, 
          error: 'Cupón no válido o expirado' 
        };
      }

      const couponDoc = querySnapshot.docs[0];
      const coupon = couponDoc.data();

      // Verificar fecha de expiración
      if (coupon.expiresAt) {
        const now = new Date();
        const expiryDate = coupon.expiresAt.toDate();

        if (now > expiryDate) {
          return { 
            success: false, 
            error: 'Este cupón ha expirado' 
          };
        }
      }

      return {
        success: true,
        coupon: {
          id: couponDoc.id,
          code: coupon.code,
          type: coupon.type, // 'percentage' o 'fixed'
          value: coupon.value
        }
      };
    } catch (error) {
      console.error('Error al aplicar cupón:', error);
      return { success: false, error: error.message };
    }
  },

  // Calcular descuento
  calculateDiscount(subtotal, coupon) {
    if (!coupon) return 0;

    if (coupon.type === 'percentage') {
      return (subtotal * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      return Math.min(coupon.value, subtotal);
    }

    return 0;
  },

  // Calcular costo de envío (ejemplo simple)
  calculateShippingCost(subtotal, region = 'Lima') {
    if (subtotal >= 100) {
      return 0; // Envío gratis para compras mayores a S/ 100
    }

    // Costos por región
    const shippingCosts = {
      'Lima': 10,
      'Callao': 10,
      'Provincia': 15,
      'Selva': 20
    };

    return shippingCosts[region] || 15;
  }
};