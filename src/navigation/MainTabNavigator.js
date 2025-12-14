// src/navigation/MainTabNavigator.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MarketplaceScreen from '../modules/marketplace/screens/MarketplaceScreen';
import NutritionNavigator from '../modules/nutrition/navigation/NutritionNavigator';
import ProfileScreen from '../modules/user-management/screens/ProfileScreen';

// 🔥 NUEVOS IMPORTS
import CitasScreen from '../screens/CitasScreen';
import CommunityNavigator from './CommunityNavigator';
import CommunityHubScreen from '../screens/CommunityHubScreen';
const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: 30,
          height: 92,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* Tab existente: Nutrición */}
      <Tab.Screen 
        name="Nutrition" 
        component={NutritionNavigator}
        options={{
          tabBarLabel: 'Nutrición',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="food-apple" size={size} color={color} />
          ),
        }}
      />

      {/* 🔥 NUEVO: Foro */}
      <Tab.Screen 
        name="Citas" 
        component={CitasScreen}
        options={{
          tabBarLabel: 'Citas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen 
        name="Community" 
        component={CommunityNavigator}
        options={{
          tabBarLabel: 'Comunidad',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
        // 👇 Listener para resetear al Hub cuando se presiona el tab
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            navigation.navigate('Community', { screen: 'CommunityHub' });
          },
        })}
      />

      {/* Tab existente: Marketplace */}
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Tienda',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/*
📝 NOTA: Esta configuración tiene 5 tabs en el bottom navigator.
Si quieres mantener solo 4-5 tabs y agrupar algunas funciones,
usa la OPCIÓN 2 que está en el siguiente artifact.
*/