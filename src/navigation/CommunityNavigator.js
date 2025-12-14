// src/navigation/CommunityNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import CommunityHubScreen from '../screens/CommunityHubScreen';
import ForoScreen from '../screens/ForoScreen';
import BlogsScreen from '../screens/BlogsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';


const Stack = createStackNavigator();

export default function CommunityNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="CommunityHub"
    >
      {/* Pantalla principal del Hub */}
      <Stack.Screen name="CommunityHub" component={CommunityHubScreen} />
      
      {/* Pantallas individuales */}
      <Stack.Screen name="ForoMain" component={ForoScreen} />
      <Stack.Screen name="Blogs" component={BlogsScreen} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      
    </Stack.Navigator>
  );
}