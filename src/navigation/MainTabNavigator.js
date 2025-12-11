// src/navigation/MainTabNavigator.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MarketplaceScreen from '../modules/marketplace/screens/MarketplaceScreen';
import NutritionNavigator from '../modules/nutrition/navigation/NutritionNavigator';
import ProfileScreen from '../modules/user-management/screens/ProfileScreen';

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
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
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

      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Marketplace',
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