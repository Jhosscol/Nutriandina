// src/modules/marketplace/services/cart.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@marketplace_cart';

class CartService {
  // Obtener todos los items del carrito
  async getCartItems() {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  // Agregar producto al carrito
  async addToCart(product, quantity = 1) {
    try {
      const cart = await this.getCartItems();
      
      // Verificar si el producto ya existe en el carrito
      const existingItemIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Si existe, actualizar la cantidad
        cart[existingItemIndex].quantity += quantity;
        
        // Verificar que no exceda el stock disponible
        if (cart[existingItemIndex].quantity > product.stock) {
          cart[existingItemIndex].quantity = product.stock;
        }
      } else {
        // Si no existe, agregar nuevo item
        cart.push({
          ...product,
          quantity: Math.min(quantity, product.stock)
        });
      }
      
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      return { success: true, cart };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar cantidad de un producto
  async updateQuantity(productId, quantity) {
    try {
      const cart = await this.getCartItems();
      const itemIndex = cart.findIndex(item => item.id === productId);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          // Si la cantidad es 0 o menor, eliminar el item
          cart.splice(itemIndex, 1);
        } else {
          // Actualizar cantidad sin exceder el stock
          cart[itemIndex].quantity = Math.min(quantity, cart[itemIndex].stock);
        }
        
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        return { success: true, cart };
      }
      
      return { success: false, error: 'Product not found in cart' };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar producto del carrito
  async removeFromCart(productId) {
    try {
      const cart = await this.getCartItems();
      const updatedCart = cart.filter(item => item.id !== productId);
      
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
      return { success: true, cart: updatedCart };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Limpiar todo el carrito
  async clearCart() {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener total del carrito
  async getCartTotal() {
    try {
      const cart = await this.getCartItems();
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        success: true,
        subtotal,
        itemCount,
        total: subtotal // Aquí puedes agregar impuestos o descuentos después
      };
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return { success: false, error: error.message };
    }
  }

  // Verificar si un producto está en el carrito
  async isInCart(productId) {
    try {
      const cart = await this.getCartItems();
      return cart.some(item => item.id === productId);
    } catch (error) {
      console.error('Error checking if in cart:', error);
      return false;
    }
  }

  // Obtener cantidad de un producto en el carrito
  async getProductQuantity(productId) {
    try {
      const cart = await this.getCartItems();
      const item = cart.find(item => item.id === productId);
      return item ? item.quantity : 0;
    } catch (error) {
      console.error('Error getting product quantity:', error);
      return 0;
    }
  }
}

export const cartService = new CartService();