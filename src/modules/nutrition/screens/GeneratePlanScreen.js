// src/modules/nutrition/screens/GeneratePlanScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, ProgressBar, RadioButton, Text } from 'react-native-paper';
import { generateNutritionPlan } from '../services/nutritionApi';

export default function GeneratePlanScreen({ navigation }) {
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      setProgress(0.1);

      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 0.1, 0.9));
      }, 300);

      // 🔥 AQUÍ ESTÁ LA MAGIA: generateNutritionPlan ahora maneja todo
      // - Verifica si hay plan activo
      // - Muestra el Alert preguntando al usuario
      // - Cancela el plan anterior si el usuario confirma
      // - Crea el nuevo plan
      const response = await generateNutritionPlan(parseInt(duration));
      
      clearInterval(progressInterval);
      setProgress(1);

      setTimeout(() => {
        Alert.alert(
          '¡Plan Generado! 🎉',
          'Tu plan nutricional personalizado está listo. ¡Comienza tu viaje hacia una vida más saludable!',
          [
            {
              text: 'Ver Mi Plan',
              onPress: () => navigation.replace('NutritionDashboard'),
            },
          ]
        );
      }, 500);

    } catch (error) {
      // Limpiar el intervalo de progreso si existe
      clearInterval(progressInterval);
      
      // Si el usuario canceló la operación, no mostrar error
      if (error.message === 'Operación cancelada por el usuario') {
        console.log('ℹ️ Usuario decidió mantener su plan actual');
        return; // Salir sin mostrar error
      }

      // Para cualquier otro error, mostrar el Alert
      Alert.alert(
        'Error',
        error.message || 'No se pudo generar el plan. Verifica que hayas completado tu perfil de salud.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="food-apple" size={80} color="#2E7D32" />
          </View>
          
          <Text variant="headlineSmall" style={styles.title}>
            Genera tu Plan Personalizado
          </Text>
          
          <Text variant="bodyMedium" style={styles.description}>
            Crearemos un plan nutricional adaptado a tus necesidades, objetivos de salud y preferencias alimentarias usando alimentos andinos nutritivos.
          </Text>
        </Card.Content>
      </Card>

      {/* Selección de duración */}
      <Card style={styles.card}>
        <Card.Title
          title="Duración del Plan"
          titleVariant="titleLarge"
          left={(props) => <MaterialCommunityIcons name="calendar-range" {...props} size={24} color="#2E7D32" />}
        />
        <Card.Content>
          <RadioButton.Group onValueChange={setDuration} value={duration}>
            <View style={styles.radioOption}>
              <RadioButton.Item
                label="7 días (Semanal)"
                value="7"
                color="#2E7D32"
                status={duration === '7' ? 'checked' : 'unchecked'}
              />
              <Text variant="bodySmall" style={styles.optionDescription}>
                Perfecto para probar y adaptar tus hábitos alimenticios
              </Text>
            </View>

            <View style={styles.radioOption}>
              <RadioButton.Item
                label="30 días (Mensual) - Recomendado"
                value="30"
                color="#2E7D32"
                status={duration === '30' ? 'checked' : 'unchecked'}
              />
              <Text variant="bodySmall" style={styles.optionDescription}>
                Ideal para establecer rutinas y ver resultados significativos
              </Text>
            </View>
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Qué incluye */}
      <Card style={styles.card}>
        <Card.Title title="¿Qué incluye tu plan?" titleVariant="titleLarge" />
        <Card.Content>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
            <Text style={styles.featureText}>
              Menús diarios con desayuno, almuerzo, cena y snacks
            </Text>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
            <Text style={styles.featureText}>
              Recetas con alimentos andinos (quinua, kiwicha, tarwi, etc.)
            </Text>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
            <Text style={styles.featureText}>
              Adaptado a tus condiciones de salud y alergias
            </Text>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
            <Text style={styles.featureText}>
              Calculado según tus objetivos (pérdida de peso, ganancia muscular, etc.)
            </Text>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
            <Text style={styles.featureText}>
              Lista de compras semanal organizada por categorías
            </Text>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
            <Text style={styles.featureText}>
              Información nutricional detallada de cada comida
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Advertencia - ACTUALIZADA */}
      <Card style={styles.warningCard}>
        <Card.Content>
          <View style={styles.warningRow}>
            <MaterialCommunityIcons name="information" size={24} color="#FF9800" />
            <Text style={styles.warningText}>
              Si ya tienes un plan activo, se te preguntará si deseas cancelarlo antes de crear uno nuevo. El plan se genera basándose en tu perfil de salud actual.
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Barra de progreso */}
      {loading && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.progressTitle}>
              Generando tu plan personalizado...
            </Text>
            <ProgressBar
              progress={progress}
              color="#2E7D32"
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              {progress < 0.3 && 'Analizando tu perfil de salud...'}
              {progress >= 0.3 && progress < 0.6 && 'Seleccionando recetas adecuadas...'}
              {progress >= 0.6 && progress < 0.9 && 'Creando menús diarios...'}
              {progress >= 0.9 && '¡Casi listo!'}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Botón de generar */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleGeneratePlan}
          loading={loading}
          disabled={loading}
          icon="play-circle"
          style={styles.generateButton}
          contentStyle={styles.buttonContent}
        >
          {loading ? 'Generando...' : 'Generar Plan'}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
        >
          Cancelar
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  radioOption: {
    marginBottom: 16,
  },
  optionDescription: {
    color: '#666',
    marginLeft: 56,
    marginTop: -8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  warningCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FFF3E0',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    color: '#E65100',
    fontSize: 14,
  },
  progressTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#2E7D32',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  generateButton: {
    marginBottom: 12,
  },
  buttonContent: {
    height: 50,
  },
  cancelButton: {
    borderColor: '#999',
  },
});