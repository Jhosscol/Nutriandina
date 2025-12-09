import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/config/theme';
import { ProviderAuthProvider } from './src/modules/providers/context/ProviderAuthContext';
import { AuthProvider } from './src/modules/user-management/context/AuthContext';
import { HealthDataProvider } from './src/modules/user-management/context/HealthDataContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <ProviderAuthProvider>
            <HealthDataProvider>
              <NavigationContainer>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <AppNavigator />
              </NavigationContainer>
            </HealthDataProvider>
          </ProviderAuthProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}