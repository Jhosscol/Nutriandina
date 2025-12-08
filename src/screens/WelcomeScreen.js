import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

export default function WelcomeScreen({ navigation }) {
  const navigateToNutrition = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Nutrition' } }],
    });
  };

  const navigateToProfile = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'ProfileTab' } }],
    });
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
      
      <Text variant="headlineMedium" style={styles.title}>
        ¡Perfil Completado! 🎉
      </Text>
      
      <Text variant="bodyLarge" style={styles.subtitle}>
        Tu plan nutricional personalizado está listo
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="bodyMedium" style={styles.description}>
            Ahora puedes explorar recetas andinas, crear planes de comidas y alcanzar tus objetivos de salud.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={navigateToNutrition}
          style={styles.button}
          icon="food-apple"
          contentStyle={styles.buttonContent}
        >
          Explorar Nutrición
        </Button>

        <Button
          mode="outlined"
          onPress={navigateToProfile}
          style={styles.button}
          icon="account"
          contentStyle={styles.buttonContent}
        >
          Ver Mi Perfil
        </Button>
      </View>

      <Text variant="bodySmall" style={styles.hint}>
        Puedes cambiar entre secciones usando el menú inferior
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    color: '#2E7D32',
  },
  subtitle: {
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    marginBottom: 32,
    backgroundColor: '#E8F5E9',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  hint: {
    marginTop: 24,
    color: '#999',
    textAlign: 'center',
  },
});