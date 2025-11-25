import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../config/theme';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';

// Onboarding Screens
import HealthProfileScreen from '../screens/onboarding/HealthProfileScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import NutritionScreen from '../screens/nutrition/NutritionScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator para la app principal
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'food-apple' : 'food-apple-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen 
        name="Nutrition" 
        component={NutritionScreen}
        options={{ tabBarLabel: 'Nutrición' }}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen}
        options={{ tabBarLabel: 'Tienda' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Navegación principal de la app
const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return null; // O un loading screen
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Flow
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : !user?.profileComplete ? (
        // Onboarding Flow
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="HealthProfile" component={HealthProfileScreen} />
        </>
      ) : (
        // Main App Flow
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;