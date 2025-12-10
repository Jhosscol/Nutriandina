// src/navigation/AppNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import { useProviderAuth } from '../modules/providers/context/ProviderAuthContext';
import { useAuth } from '../modules/user-management/context/AuthContext';

// Screens existentes
import SplashScreen from '../screens/SplashScreen';
import UserTypeSelectionScreen from '../screens/UserTypeSelectionScreen';

// Screens de Usuario Consumidor
import HealthQuestionnaireScreen from '../modules/user-management/screens/HealthQuestionnaireScreen';
import LoginScreen from '../modules/user-management/screens/LoginScreen';
import ProfileScreen from '../modules/user-management/screens/ProfileScreen';
import RegisterScreen from '../modules/user-management/screens/RegisterScreen';
import MainTabNavigator from './MainTabNavigator';

// Screens de Proveedor
import AddProductScreen from '../modules/providers/screens/AddProductScreen';
import EditProductScreen from '../modules/providers/screens/EditProductScreen';
import OrdersManagementScreen from '../modules/providers/screens/OrdersManagementScreen';
import ProductListScreen from '../modules/providers/screens/ProductListScreen';
import ProviderDashboardScreen from '../modules/providers/screens/ProviderDashboardScreen';
import ProviderLoginScreen from '../modules/providers/screens/ProviderLoginScreen';
import ProviderProfileScreen from '../modules/providers/screens/ProviderProfile';
import ProviderProfileSetupScreen from '../modules/providers/screens/ProviderProfileSetupScreen';
import ProviderRegisterScreen from '../modules/providers/screens/ProviderRegisterScreen';

// Screens de Marketplace
import CartScreen from '../modules/marketplace/screens/CartScreen';
import CheckoutScreen from '../modules/marketplace/screens/CheckoutScreen';
import MarketplaceScreen from '../modules/marketplace/screens/MarketplaceScreen';
import ProductDetailScreen from '../modules/marketplace/screens/ProductDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user: consumerUser, userProfile, initializing: consumerInitializing } = useAuth();
  const { provider, providerProfile, initializing: providerInitializing } = useProviderAuth();

  // Debug logs
  console.log('=== AppNavigator Debug ===');
  console.log('Consumer User:', consumerUser?.uid);
  console.log('Consumer Profile Complete:', userProfile?.isProfileComplete);
  console.log('Provider:', provider?.uid);
  console.log('Provider Profile:', providerProfile);
  console.log('Provider Profile Complete:', providerProfile?.isProfileComplete);
  console.log('========================');

  // Mostrar splash mientras se inicializa
  if (consumerInitializing || providerInitializing) {
    return <SplashScreen />;
  }

  // Si hay un proveedor logueado
  if (provider) {
    console.log('✅ Navegación de PROVEEDOR activada');
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!providerProfile?.isProfileComplete ? (
          // Proveedor debe completar su perfil
          <Stack.Screen 
            name="ProviderProfileSetup" 
            component={ProviderProfileSetupScreen} 
          />
        ) : (
          // Proveedor con perfil completo - Dashboard y funcionalidades
          <>
            <Stack.Screen 
              name="ProviderDashboard" 
              component={ProviderDashboardScreen} 
            />
            <Stack.Screen 
            name="ProviderProfile"  // ← AGREGA ESTA LÍNEA
            component={ProviderProfileScreen} 
            />
            <Stack.Screen 
              name="AddProduct" 
              component={AddProductScreen} 
            />
            <Stack.Screen 
              name="EditProduct" 
              component={EditProductScreen} 
            />
            <Stack.Screen 
              name="ProductList" 
              component={ProductListScreen} 
            />
            <Stack.Screen 
              name="OrdersManagement" 
              component={OrdersManagementScreen} 
            />
          </>
        )}
      </Stack.Navigator>
    );
  }

  // Si hay un usuario consumidor logueado
  if (consumerUser) {
    console.log('✅ Navegación de CONSUMIDOR activada');
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userProfile?.isProfileComplete ? (
          // Usuario debe completar cuestionario de salud
          <Stack.Screen 
            name="HealthQuestionnaire" 
            component={HealthQuestionnaireScreen} 
          />
        ) : (
          
          // Usuario con perfil completo - Acceso a todas las funcionalidades
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
            />
            <Stack.Screen 
              name="Marketplace" 
              component={MarketplaceScreen} 
            />
            <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetailScreen} 
            />
            <Stack.Screen 
              name="Cart" 
              component={CartScreen} 
            />
            <Stack.Screen 
              name="Checkout" 
              component={CheckoutScreen} 
            />
            <Stack.Screen 
              name="ProviderProfile" 
              component={ProviderProfileScreen} 
            />
          </>
        )}
      </Stack.Navigator>
    );
  }

  // Si no hay nadie logueado - Pantallas de autenticación
  console.log('✅ Navegación de SELECCIÓN/AUTH activada');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="UserTypeSelection" 
        component={UserTypeSelectionScreen} 
      />
      
      {/* Rutas de Consumidor */}
      <Stack.Screen name="ConsumerAuth" component={ConsumerAuthNavigator} />
      
      {/* Rutas de Proveedor */}
      <Stack.Screen name="ProviderAuth" component={ProviderAuthNavigator} />
    </Stack.Navigator>
  );
}

// Navegador para autenticación de consumidores
function ConsumerAuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Navegador para autenticación de proveedores
function ProviderAuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderLogin" component={ProviderLoginScreen} />
      <Stack.Screen name="ProviderRegister" component={ProviderRegisterScreen} />

    </Stack.Navigator>
  );
}