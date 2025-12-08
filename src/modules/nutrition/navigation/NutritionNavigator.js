// src/modules/nutrition/navigation/NutritionNavigator.js
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import DailyMenuScreen from '../screens/DailyMenuScreen';
import GeneratePlanScreen from '../screens/GeneratePlanScreen';
import NutritionCalculatorScreen from '../screens/NutritionCalculatorScreen';
import NutritionDashboard from '../screens/NutritionDashboard';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import WeeklyMenuScreen from '../screens/WeeklyMenuScreen';

const Stack = createStackNavigator();

export default function NutritionNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2E7D32',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="NutritionDashboard"
        component={NutritionDashboard}
        options={{
          title: 'Mi Plan Nutricional',
          headerShown: false,
        }}
      />
      
      <Stack.Screen
        name="GeneratePlan"
        component={GeneratePlanScreen}
        options={{
          title: 'Generar Plan',
        }}
      />
      
      <Stack.Screen
        name="DailyMenu"
        component={DailyMenuScreen}
        options={({ route }) => ({
          title: `Día ${route.params?.day || 1}`,
        })}
      />
      
      <Stack.Screen
        name="WeeklyMenu"
        component={WeeklyMenuScreen}
        options={{
          title: 'Menú Semanal',
        }}
      />
      
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{
          title: 'Detalle de Receta',
        }}
      />
      
      <Stack.Screen
        name="RecipeList"
        component={RecipeListScreen}
        options={{
          title: 'Recetas Andinas',
        }}
      />
      
      <Stack.Screen
        name="NutritionCalculator"
        component={NutritionCalculatorScreen}
        options={{
          title: 'Calculadora Nutricional',
        }}
      />
      
      <Stack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={({ route }) => ({
          title: `Lista de Compras - Semana ${route.params?.week || 1}`,
        })}
      />
    </Stack.Navigator>
  );
}