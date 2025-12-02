import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Importar screens desde la ubicación correcta
import HealthQuestionnaireScreen from '../modules/user-management/screens/HealthQuestionnaireScreen';
import LoginScreen from '../modules/user-management/screens/LoginScreen';
import ProfileScreen from '../modules/user-management/screens/ProfileScreen';
import RegisterScreen from '../modules/user-management/screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, userProfile, initializing } = useAuth();

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : !userProfile?.isProfileComplete ? (
        <Stack.Screen 
          name="HealthQuestionnaire" 
          component={HealthQuestionnaireScreen} 
        />
      ) : (
        <>
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}