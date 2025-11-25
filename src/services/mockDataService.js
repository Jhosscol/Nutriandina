// Mock Data Service - Simula Firebase localmente
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simulación de delay de red
const simulateNetworkDelay = (ms = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Usuario mock
const mockUser = {
  uid: 'mock_user_123',
  email: 'demo@nutriandina.com',
  name: 'Usuario Demo',
  photoURL: null,
  createdAt: new Date().toISOString(),
  profileComplete: true,
  subscription: 'free',
  healthProfile: {
    age: 30,
    gender: 'male',
    weight: 75,
    height: 175,
    activityLevel: 'moderate',
    healthConditions: ['diabetes'],
    goals: ['lose_weight', 'health'],
  },
  preferences: {
    notifications: true,
    emailUpdates: true,
    language: 'es',
  },
  stats: {
    daysActive: 28,
    recipesCompleted: 15,
    mealsLogged: 84,
    ordersCount: 8,
  },
};

// Productos mock
const mockProducts = [
  {
    id: 'prod_001',
    name: 'Quinua Blanca Premium',
    description: 'Quinua orgánica de Puno',
    price: 18.50,
    unit: 'kg',
    image: '🌾',
    rating: 4.8,
    reviews: 156,
    discount: 15,
    seller: 'Asociación Quinua Real',
    origin: 'Puno, Perú',
    stock: 50,
    category: 'grains',
    active: true,
  },
  {
    id: 'prod_002',
    name: 'Kiwicha Orgánica',
    description: 'Rica en proteínas y calcio',
    price: 22.00,
    unit: 'kg',
    image: '🌱',
    rating: 4.9,
    reviews: 89,
    discount: 0,
    seller: 'Granja Los Andes',
    origin: 'Cusco, Perú',
    stock: 30,
    category: 'grains',
    active: true,
  },
  {
    id: 'prod_003',
    name: 'Tarwi Seco',
    description: 'Alto contenido de proteína',
    price: 16.00,
    unit: 'kg',
    image: '🫘',
    rating: 4.7,
    reviews: 67,
    discount: 10,
    seller: 'Campo Verde',
    origin: 'Ayacucho, Perú',
    stock: 40,
    category: 'legumes',
    active: true,
  },
  {
    id: 'prod_004',
    name: 'Maca en Polvo',
    description: 'Energizante natural',
    price: 35.00,
    unit: '500g',
    image: '🥔',
    rating: 5.0,
    reviews: 234,
    discount: 20,
    seller: 'Andes Naturales',
    origin: 'Junín, Perú',
    stock: 100,
    category: 'roots',
    active: true,
  },
  {
    id: 'prod_005',
    name: 'Cañihua Negra',
    description: 'Superalimento andino',
    price: 20.00,
    unit: 'kg',
    image: '⚫',
    rating: 4.6,
    reviews: 45,
    discount: 0,
    seller: 'Granja Kollana',
    origin: 'Puno, Perú',
    stock: 25,
    category: 'grains',
    active: true,
  },
];

// Mock Auth Service
export class MockAuthService {
  static async signIn(email, password) {
    await simulateNetworkDelay();
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem('mock_user', JSON.stringify(mockUser));
    
    return {
      success: true,
      user: mockUser,
    };
  }

  static async signUp(email, password, userData) {
    await simulateNetworkDelay();
    
    const newUser = {
      ...mockUser,
      email,
      name: userData.name,
      profileComplete: false,
      healthProfile: null,
    };
    
    await AsyncStorage.setItem('mock_user', JSON.stringify(newUser));
    
    return {
      success: true,
      user: newUser,
    };
  }

  static async signOut() {
    await simulateNetworkDelay();
    await AsyncStorage.removeItem('mock_user');
    return { success: true };
  }

  static async getCurrentUser() {
    const userData = await AsyncStorage.getItem('mock_user');
    return userData ? JSON.parse(userData) : null;
  }

  static async updateUserProfile(updates) {
    await simulateNetworkDelay();
    
    const userData = await AsyncStorage.getItem('mock_user');
    const user = userData ? JSON.parse(userData) : mockUser;
    
    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem('mock_user', JSON.stringify(updatedUser));
    
    return { success: true, user: updatedUser };
  }

  static async updateHealthProfile(healthProfile) {
    await simulateNetworkDelay();
    
    const userData = await AsyncStorage.getItem('mock_user');
    const user = userData ? JSON.parse(userData) : mockUser;
    
    const updatedUser = {
      ...user,
      healthProfile,
      profileComplete: true,
    };
    
    await AsyncStorage.setItem('mock_user', JSON.stringify(updatedUser));
    
    return { success: true, user: updatedUser };
  }

  static async resetPassword(email) {
    await simulateNetworkDelay();
    return {
      success: true,
      message: 'Se ha enviado un correo para restablecer tu contraseña',
    };
  }
}

// Mock Firestore Service
export class MockFirestoreService {
  
  // Planes nutricionales
  static async saveMealPlan(mealPlan) {
    await simulateNetworkDelay();
    
    const plans = await this.getMealPlanHistory();
    const newPlan = {
      id: `plan_${Date.now()}`,
      ...mealPlan,
      createdAt: new Date().toISOString(),
    };
    
    plans.push(newPlan);
    await AsyncStorage.setItem('mock_meal_plans', JSON.stringify(plans));
    
    return { success: true, planId: newPlan.id };
  }

  static async getCurrentMealPlan() {
    await simulateNetworkDelay();
    
    const plans = await this.getMealPlanHistory();
    const currentPlan = plans.length > 0 ? plans[plans.length - 1] : null;
    
    return {
      success: true,
      plan: currentPlan,
    };
  }

  static async getMealPlanHistory() {
    const plansData = await AsyncStorage.getItem('mock_meal_plans');
    return plansData ? JSON.parse(plansData) : [];
  }

  // Registro de comidas
  static async logMeal(mealData) {
    await simulateNetworkDelay();
    
    const meals = await this.getMealsByDate(mealData.date || new Date().toISOString().split('T')[0]);
    const newMeal = {
      id: `meal_${Date.now()}`,
      ...mealData,
      timestamp: new Date().toISOString(),
    };
    
    meals.push(newMeal);
    await AsyncStorage.setItem(`mock_meals_${newMeal.date}`, JSON.stringify(meals));
    
    return { success: true, mealId: newMeal.id };
  }

  static async getMealsByDate(date) {
    const mealsData = await AsyncStorage.getItem(`mock_meals_${date}`);
    return mealsData ? JSON.parse(mealsData) : [];
  }

  // Peso
  static async logWeight(weight, notes) {
    await simulateNetworkDelay();
    
    const weights = await this.getWeightHistory();
    const newEntry = {
      id: `weight_${Date.now()}`,
      weight,
      notes,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };
    
    weights.push(newEntry);
    await AsyncStorage.setItem('mock_weight_log', JSON.stringify(weights));
    
    return { success: true, logId: newEntry.id };
  }

  static async getWeightHistory() {
    const weightsData = await AsyncStorage.getItem('mock_weight_log');
    return weightsData ? JSON.parse(weightsData) : [];
  }

  // Presión arterial
  static async logBloodPressure(systolic, diastolic, heartRate) {
    await simulateNetworkDelay();
    
    const readings = await this.getBloodPressureHistory();
    const newReading = {
      id: `bp_${Date.now()}`,
      systolic,
      diastolic,
      heartRate,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };
    
    readings.push(newReading);
    await AsyncStorage.setItem('mock_bp_log', JSON.stringify(readings));
    
    return { success: true, logId: newReading.id };
  }

  static async getBloodPressureHistory() {
    const bpData = await AsyncStorage.getItem('mock_bp_log');
    return bpData ? JSON.parse(bpData) : [];
  }

  // Glucosa
  static async logBloodGlucose(glucose, mealContext) {
    await simulateNetworkDelay();
    
    const readings = await this.getBloodGlucoseHistory();
    const newReading = {
      id: `glucose_${Date.now()}`,
      glucose,
      mealContext,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
    };
    
    readings.push(newReading);
    await AsyncStorage.setItem('mock_glucose_log', JSON.stringify(readings));
    
    return { success: true, logId: newReading.id };
  }

  static async getBloodGlucoseHistory() {
    const glucoseData = await AsyncStorage.getItem('mock_glucose_log');
    return glucoseData ? JSON.parse(glucoseData) : [];
  }

  // Productos
  static async getProducts(category = null) {
    await simulateNetworkDelay();
    
    let products = mockProducts;
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    
    return { success: true, products };
  }

  static async getProductById(productId) {
    await simulateNetworkDelay();
    
    const product = mockProducts.find(p => p.id === productId);
    return { success: true, product };
  }

  static async searchProducts(searchTerm) {
    await simulateNetworkDelay();
    
    const products = mockProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return { success: true, products };
  }

  // Órdenes
  static async createOrder(orderData) {
    await simulateNetworkDelay();
    
    const orders = await this.getUserOrders();
    const newOrder = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    await AsyncStorage.setItem('mock_orders', JSON.stringify(orders));
    
    return { success: true, orderId: newOrder.id };
  }

  static async getUserOrders() {
    const ordersData = await AsyncStorage.getItem('mock_orders');
    return ordersData ? JSON.parse(ordersData) : [];
  }

  static async updateOrderStatus(orderId, status) {
    await simulateNetworkDelay();
    
    const orders = await this.getUserOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      orders[orderIndex].updatedAt = new Date().toISOString();
      await AsyncStorage.setItem('mock_orders', JSON.stringify(orders));
    }
    
    return { success: true };
  }

  // Direcciones
  static async saveAddress(address) {
    await simulateNetworkDelay();
    
    const addresses = await this.getUserAddresses();
    const newAddress = {
      id: `addr_${Date.now()}`,
      ...address,
      createdAt: new Date().toISOString(),
    };
    
    addresses.push(newAddress);
    await AsyncStorage.setItem('mock_addresses', JSON.stringify(addresses));
    
    return { success: true, addressId: newAddress.id };
  }

  static async getUserAddresses() {
    const addressesData = await AsyncStorage.getItem('mock_addresses');
    return addressesData ? JSON.parse(addressesData) : [];
  }

  static async deleteAddress(addressId) {
    await simulateNetworkDelay();
    
    const addresses = await this.getUserAddresses();
    const filtered = addresses.filter(a => a.id !== addressId);
    await AsyncStorage.setItem('mock_addresses', JSON.stringify(filtered));
    
    return { success: true };
  }

  // Recetas favoritas
  static async addFavoriteRecipe(recipeId) {
    await simulateNetworkDelay();
    
    const favorites = await this.getFavoriteRecipes();
    if (!favorites.includes(recipeId)) {
      favorites.push(recipeId);
      await AsyncStorage.setItem('mock_favorite_recipes', JSON.stringify(favorites));
    }
    
    return { success: true };
  }

  static async removeFavoriteRecipe(recipeId) {
    await simulateNetworkDelay();
    
    const favorites = await this.getFavoriteRecipes();
    const filtered = favorites.filter(id => id !== recipeId);
    await AsyncStorage.setItem('mock_favorite_recipes', JSON.stringify(filtered));
    
    return { success: true };
  }

  static async getFavoriteRecipes() {
    const favoritesData = await AsyncStorage.getItem('mock_favorite_recipes');
    return favoritesData ? JSON.parse(favoritesData) : [];
  }
}

// Mock Payment Service
export class MockPaymentService {
  static async processPayment(cardData, orderData) {
    await simulateNetworkDelay(2000); // Simular procesamiento de pago
    
    // Simular éxito/fallo (90% éxito)
    const success = Math.random() > 0.1;
    
    if (success) {
      const orderId = `ORD-${Date.now()}`;
      const chargeId = `CHG-${Date.now()}`;
      
      return {
        success: true,
        orderId,
        chargeId,
      };
    } else {
      return {
        success: false,
        error: 'Tarjeta rechazada. Intenta con otra tarjeta.',
      };
    }
  }

  static async validateCoupon(code, orderTotal) {
    await simulateNetworkDelay();
    
    const coupons = {
      'BIENVENIDA20': {
        code: 'BIENVENIDA20',
        type: 'percentage',
        value: 20,
        minPurchase: 30,
        maxDiscount: 50,
        description: '20% de descuento en tu primera compra',
        active: true,
      },
      'ENVIOGRATIS': {
        code: 'ENVIOGRATIS',
        type: 'free_shipping',
        value: 0,
        minPurchase: 0,
        description: 'Envío gratis en cualquier compra',
        active: true,
      },
    };
    
    const coupon = coupons[code.toUpperCase()];
    
    if (!coupon) {
      return { valid: false, error: 'Cupón no válido' };
    }
    
    if (orderTotal < coupon.minPurchase) {
      return {
        valid: false,
        error: `Compra mínima de S/ ${coupon.minPurchase} requerida`,
      };
    }
    
    return { valid: true, coupon };
  }
}

// Exportar todo
export const MockServices = {
  Auth: MockAuthService,
  Firestore: MockFirestoreService,
  Payment: MockPaymentService,
};

export default MockServices;