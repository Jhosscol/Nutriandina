import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../modules/user-management/context/AuthContext';
import HealthQuestionnaireScreen from '../modules/user-management/screens/HealthQuestionnaireScreen';
import LoginScreen from '../modules/user-management/screens/LoginScreen';
import RegisterScreen from '../modules/user-management/screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import MainTabNavigator from './MainTabNavigator';

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
        <>
          <Stack.Screen 
            name="HealthQuestionnaire" 
            component={HealthQuestionnaireScreen} 
          />
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
          />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  );
}