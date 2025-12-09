// Servicio de pagos con integración Culqi (Perú)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Culqi
const CULQI_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxx'; // Reemplazar con tu clave pública
const CULQI_API_URL = 'https://api.culqi.com/v2';

// Carrito de compras
export class ShoppingCart {
  constructor() {
    this.items = [];
  }

  // Agregar producto al carrito
  async addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        ...product,
        quantity,
        addedAt: new Date().toISOString(),
      });
    }
    
    await this.saveCart();
    return this.items;
  }

  // Remover producto del carrito
  async removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    await this.saveCart();
    return this.items;
  }

  // Actualizar cantidad
  async updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }
      item.quantity = quantity;
      await this.saveCart();
    }
    return this.items;
  }

  // Limpiar carrito
  async clearCart() {
    this.items = [];
    await this.saveCart();
    return this.items;
  }

  // Obtener items del carrito
  getItems() {
    return this.items;
  }

  // Calcular subtotal
  getSubtotal() {
    return this.items.reduce((total, item) => {
      const itemPrice = item.discount 
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  }

  // Calcular descuentos
  getDiscounts() {
    return this.items.reduce((total, item) => {
      if (item.discount) {
        const discountAmount = (item.price * item.discount / 100) * item.quantity;
        return total + discountAmount;
      }
      return total;
    }, 0);
  }

  // Calcular envío
  getShippingCost(subtotal) {
    if (subtotal >= 50) return 0; // Envío gratis sobre S/ 50
    return 10; // S/ 10 de envío
  }

  // Calcular total
  getTotal() {
    const subtotal = this.getSubtotal();
    const shipping = this.getShippingCost(subtotal);
    return subtotal + shipping;
  }

  // Obtener resumen del pedido
  getOrderSummary() {
    const subtotal = this.getSubtotal();
    const discounts = this.getDiscounts();
    const shipping = this.getShippingCost(subtotal);
    const total = this.getTotal();
    const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: this.items,
      itemCount,
      subtotal,
      discounts,
      shipping,
      total,
      hasFreeShipping: subtotal >= 50,
    };
  }

  // Guardar carrito en AsyncStorage
  async saveCart() {
    try {
      await AsyncStorage.setItem('shopping_cart', JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // Cargar carrito desde AsyncStorage
  async loadCart() {
    try {
      const cartData = await AsyncStorage.getItem('shopping_cart');
      if (cartData) {
        this.items = JSON.parse(cartData);
      }
      return this.items;
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }
}

// Servicio de pagos con Culqi
export class PaymentService {
  
  // Crear token de tarjeta (llamar desde el frontend)
  static async createToken(cardData) {
    try {
      // cardData debe contener: card_number, cvv, expiration_month, expiration_year, email
      const response = await fetch('https://secure.culqi.com/v2/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CULQI_PUBLIC_KEY}`,
        },
        body: JSON.stringify({
          ...cardData,
        }),
      });

      const data = await response.json();
      
      if (data.object === 'token') {
        return { success: true, token: data.id };
      } else {
        return { success: false, error: data.user_message || 'Error al crear token' };
      }
    } catch (error) {
      console.error('Error creating token:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Crear cargo (debe llamarse desde el backend por seguridad)
  static async createCharge(token, amount, email) {
    try {
      // IMPORTANTE: En producción, esto debe hacerse desde tu backend
      // Este es solo un ejemplo ilustrativo
      const response = await fetch(`${CULQI_API_URL}/charges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk_test_xxxxx`, // Clave secreta (NUNCA en frontend)
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Culqi usa centavos
          currency_code: 'PEN',
          email: email,
          source_id: token,
          description: 'Compra en NutriAndina Marketplace',
        }),
      });

      const data = await response.json();
      
      if (data.object === 'charge') {
        return { success: true, chargeId: data.id };
      } else {
        return { success: false, error: data.user_message || 'Error al procesar pago' };
      }
    } catch (error) {
      console.error('Error creating charge:', error);
      return { success: false, error: 'Error al procesar el pago' };
    }
  }

  // Procesar pago completo
  static async processPayment(cardData, orderSummary, userEmail) {
    try {
      // 1. Crear token de tarjeta
      const tokenResult = await this.createToken({
        ...cardData,
        email: userEmail,
      });

      if (!tokenResult.success) {
        return tokenResult;
      }

      // 2. Crear cargo (en producción, llamar a tu backend)
      const chargeResult = await this.createCharge(
        tokenResult.token,
        orderSummary.total,
        userEmail
      );

      if (!chargeResult.success) {
        return chargeResult;
      }

      // 3. Guardar orden
      const order = await this.createOrder(orderSummary, chargeResult.chargeId, userEmail);

      return {
        success: true,
        orderId: order.id,
        chargeId: chargeResult.chargeId,
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: 'Error al procesar el pago' };
    }
  }

  // Crear orden
  static async createOrder(orderSummary, chargeId, userEmail) {
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'pending', // pending, processing, shipped, delivered, cancelled
      items: orderSummary.items,
      subtotal: orderSummary.subtotal,
      shipping: orderSummary.shipping,
      total: orderSummary.total,
      paymentId: chargeId,
      userEmail: userEmail,
      shippingAddress: null, // Se debe agregar
      trackingNumber: null,
    };

    // Guardar en AsyncStorage (en producción, enviar a backend)
    try {
      const orders = await this.getOrders();
      orders.unshift(order);
      await AsyncStorage.setItem('user_orders', JSON.stringify(orders));
      return order;
    } catch (error) {
      console.error('Error saving order:', error);
      throw error;
    }
  }

  // Obtener órdenes del usuario
  static async getOrders() {
    try {
      const ordersData = await AsyncStorage.getItem('user_orders');
      return ordersData ? JSON.parse(ordersData) : [];
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  }

  // Obtener orden por ID
  static async getOrderById(orderId) {
    const orders = await this.getOrders();
    return orders.find(order => order.id === orderId);
  }

  // Validar tarjeta de crédito
  static validateCard(cardNumber) {
    // Algoritmo de Luhn
    const digits = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(digits)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  // Obtener tipo de tarjeta
  static getCardType(cardNumber) {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      diners: /^3(?:0[0-5]|[68])/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return type;
      }
    }
    
    return 'unknown';
  }

  // Formatear número de tarjeta
  static formatCardNumber(cardNumber) {
    const digits = cardNumber.replace(/\s/g, '');
    return digits.match(/.{1,4}/g)?.join(' ') || digits;
  }
}

// Gestión de direcciones de envío
export class AddressService {
  
  static async saveAddress(address) {
    try {
      const addresses = await this.getAddresses();
      
      const newAddress = {
        id: `ADDR-${Date.now()}`,
        ...address,
        createdAt: new Date().toISOString(),
      };
      
      addresses.push(newAddress);
      await AsyncStorage.setItem('user_addresses', JSON.stringify(addresses));
      
      return newAddress;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  }

  static async getAddresses() {
    try {
      const addressesData = await AsyncStorage.getItem('user_addresses');
      return addressesData ? JSON.parse(addressesData) : [];
    } catch (error) {
      console.error('Error loading addresses:', error);
      return [];
    }
  }

  static async updateAddress(addressId, updates) {
    try {
      const addresses = await this.getAddresses();
      const index = addresses.findIndex(addr => addr.id === addressId);
      
      if (index !== -1) {
        addresses[index] = { ...addresses[index], ...updates };
        await AsyncStorage.setItem('user_addresses', JSON.stringify(addresses));
        return addresses[index];
      }
      
      return null;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  static async deleteAddress(addressId) {
    try {
      const addresses = await this.getAddresses();
      const filtered = addresses.filter(addr => addr.id !== addressId);
      await AsyncStorage.setItem('user_addresses', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      return false;
    }
  }

  static async setDefaultAddress(addressId) {
    try {
      const addresses = await this.getAddresses();
      const updated = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));
      await AsyncStorage.setItem('user_addresses', JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error setting default address:', error);
      return false;
    }
  }

  static async getDefaultAddress() {
    const addresses = await this.getAddresses();
    return addresses.find(addr => addr.isDefault) || addresses[0] || null;
  }
}

// Cupones y descuentos
export class CouponService {
  
  static coupons = [
    {
      code: 'BIENVENIDA20',
      type: 'percentage',
      value: 20,
      minPurchase: 30,
      maxDiscount: 50,
      description: '20% de descuento en tu primera compra',
      expiresAt: '2025-12-31',
      active: true,
    },
    {
      code: 'ENVIOGRATIS',
      type: 'free_shipping',
      value: 0,
      minPurchase: 0,
      description: 'Envío gratis en cualquier compra',
      expiresAt: '2025-12-31',
      active: true,
    },
    {
      code: 'ANDINO50',
      type: 'fixed',
      value: 50,
      minPurchase: 100,
      description: 'S/ 50 de descuento en compras mayores a S/ 100',
      expiresAt: '2025-12-31',
      active: true,
    },
  ];

  static async validateCoupon(code, orderTotal) {
    const coupon = this.coupons.find(
      c => c.code.toLowerCase() === code.toLowerCase() && c.active
    );

    if (!coupon) {
      return { valid: false, error: 'Cupón no válido' };
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, error: 'Cupón expirado' };
    }

    if (orderTotal < coupon.minPurchase) {
      return { 
        valid: false, 
        error: `Compra mínima de S/ ${coupon.minPurchase} requerida` 
      };
    }

    return { valid: true, coupon };
  }

  static calculateDiscount(coupon, orderTotal, shippingCost) {
    if (coupon.type === 'percentage') {
      const discount = Math.min(
        (orderTotal * coupon.value) / 100,
        coupon.maxDiscount || Infinity
      );
      return { discount, newTotal: orderTotal - discount, newShipping: shippingCost };
    } else if (coupon.type === 'fixed') {
      return { 
        discount: coupon.value, 
        newTotal: orderTotal - coupon.value,
        newShipping: shippingCost 
      };
    } else if (coupon.type === 'free_shipping') {
      return { 
        discount: shippingCost, 
        newTotal: orderTotal,
        newShipping: 0 
      };
    }

    return { discount: 0, newTotal: orderTotal, newShipping: shippingCost };
  }
}

// Instancia global del carrito
export const cart = new ShoppingCart();