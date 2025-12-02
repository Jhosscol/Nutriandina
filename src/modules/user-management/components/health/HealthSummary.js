// modules/user-management/components/health/HealthSummary.js
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Text } from 'react-native-paper';
import { FOOD_ALLERGIES } from '../../constants/allergies';
import { HEALTH_GOALS } from '../../constants/goals';
import { HEALTH_CONDITIONS } from '../../constants/healthConditions';
import { calculateBMI, getBMICategory } from '../../utils/calculations';

export default function HealthSummary({ data, onComplete, onBack, loading, error }) {
  const { basicInfo, conditions, allergies, preferences } = data;

  const bmi = calculateBMI(parseFloat(basicInfo.weight), parseFloat(basicInfo.height));
  const bmiCategory = getBMICategory(bmi);

  const getConditionName = (id) => {
    const condition = HEALTH_CONDITIONS.find(c => c.id === id);
    return condition ? condition.name : id;
  };

  const getAllergyName = (id) => {
    const allergy = FOOD_ALLERGIES.find(a => a.id === id);
    return allergy ? allergy.name : id;
  };

  const getGoalTitle = (id) => {
    const goal = HEALTH_GOALS.find(g => g.id === id);
    return goal ? goal.title : id;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text variant="headlineSmall" style={styles.title}>
        Resumen de tu Perfil de Salud
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Revisa la información antes de finalizar
      </Text>

      {/* Información Básica */}
      <Card style={styles.card}>
        <Card.Title title="Información Básica" titleVariant="titleLarge" />
        <Card.Content>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Edad:</Text>
            <Text variant="bodyMedium">{basicInfo.age} años</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Género:</Text>
            <Text variant="bodyMedium">
              {basicInfo.gender === 'male' ? 'Masculino' : 
               basicInfo.gender === 'female' ? 'Femenino' : 'Otro'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Peso:</Text>
            <Text variant="bodyMedium">{basicInfo.weight} kg</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Altura:</Text>
            <Text variant="bodyMedium">{basicInfo.height} cm</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>IMC:</Text>
            <Text variant="bodyMedium" style={{ color: bmiCategory?.color }}>
              {bmi} - {bmiCategory?.label}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Actividad:</Text>
            <Text variant="bodyMedium">
              {basicInfo.activityLevel === 'sedentary' ? 'Sedentario' :
               basicInfo.activityLevel === 'light' ? 'Ligero' :
               basicInfo.activityLevel === 'moderate' ? 'Moderado' :
               basicInfo.activityLevel === 'active' ? 'Activo' : 'Muy Activo'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium" style={styles.label}>Fumador:</Text>
            <Text variant="bodyMedium">{basicInfo.smoker ? 'Sí' : 'No'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Condiciones de Salud */}
      <Card style={styles.card}>
        <Card.Title title="Condiciones de Salud" titleVariant="titleLarge" />
        <Card.Content>
          {conditions.length > 0 ? (
            <View style={styles.chipsContainer}>
              {conditions.map(id => (
                <Chip key={id} style={styles.chip}>
                  {getConditionName(id)}
                </Chip>
              ))}
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.emptyText}>
              Sin condiciones médicas reportadas
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Alergias */}
      <Card style={styles.card}>
        <Card.Title title="Alergias Alimentarias" titleVariant="titleLarge" />
        <Card.Content>
          {allergies.length > 0 ? (
            <View style={styles.chipsContainer}>
              {allergies.map(id => (
                <Chip key={id} style={styles.chip}>
                  {getAllergyName(id)}
                </Chip>
              ))}
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.emptyText}>
              Sin alergias alimentarias reportadas
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Preferencias y Objetivos */}
      <Card style={styles.card}>
        <Card.Title title="Preferencias y Objetivos" titleVariant="titleLarge" />
        <Card.Content>
          {preferences.vegetarian && (
            <Chip icon="leaf" style={styles.preferenceChip}>Vegetariano</Chip>
          )}
          {preferences.vegan && (
            <Chip icon="sprout" style={styles.preferenceChip}>Vegano</Chip>
          )}
          
          <Divider style={styles.divider} />
          
          <Text variant="titleMedium" style={styles.subsectionTitle}>
            Objetivos de Salud:
          </Text>
          {preferences.selectedGoals?.length > 0 ? (
            <View style={styles.chipsContainer}>
              {preferences.selectedGoals.map(id => (
                <Chip key={id} style={styles.chip}>
                  {getGoalTitle(id)}
                </Chip>
              ))}
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.emptyText}>
              Sin objetivos específicos
            </Text>
          )}

          {preferences.dislikes?.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                Alimentos que evitas:
              </Text>
              <Text variant="bodyMedium">{preferences.dislikes.join(', ')}</Text>
            </>
          )}

          {preferences.favorites?.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleMedium" style={styles.subsectionTitle}>
                Alimentos favoritos:
              </Text>
              <Text variant="bodyMedium">{preferences.favorites.join(', ')}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.errorText}>
              ⚠️ {error}
            </Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="bodyMedium">
            ✨ ¡Perfecto! Con esta información crearemos un plan nutricional personalizado para ti usando alimentos andinos nutritivos.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={onBack}
          disabled={loading}
          style={styles.backButton}
          icon="arrow-left"
        >
          Atrás
        </Button>
        <Button
          mode="contained"
          onPress={onComplete}
          loading={loading}
          disabled={loading}
          style={styles.completeButton}
          icon="check"
          contentStyle={styles.buttonContent}
        >
          Finalizar
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontWeight: '600',
    color: '#666',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  preferenceChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: 12,
  },
  subsectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
  },
  errorCard: {
    marginBottom: 16,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#D32F2F',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  backButton: {
    flex: 1,
  },
  completeButton: {
    flex: 2,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
  },
});