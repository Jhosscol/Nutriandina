// modules/user-management/components/health/HealthQuestionnaireStep4.js
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Switch, Text, TextInput } from 'react-native-paper';
import { HEALTH_GOALS } from '../../constants/goals';

export default function HealthQuestionnaireStep4({ initialData = {}, onNext, onBack }) {
  const [preferences, setPreferences] = useState({
    vegetarian: initialData.vegetarian || false,
    vegan: initialData.vegan || false,
    selectedGoals: initialData.selectedGoals || [],
    dislikes: initialData.dislikes || [],
    favorites: initialData.favorites || [],
    mealsPerDay: initialData.mealsPerDay || '3',
    notes: initialData.notes || ''
  });

  const [newDislike, setNewDislike] = useState('');
  const [newFavorite, setNewFavorite] = useState('');

  const toggleGoal = (goalId) => {
    setPreferences(prev => {
      const isSelected = prev.selectedGoals.includes(goalId);
      const updatedGoals = isSelected
        ? prev.selectedGoals.filter(id => id !== goalId)
        : [...prev.selectedGoals, goalId];
      
      console.log('Toggling goal:', goalId, 'New goals:', updatedGoals); // Debug
      
      return {
        ...prev,
        selectedGoals: updatedGoals
      };
    });
  };

  const addDislike = () => {
    if (newDislike.trim()) {
      setPreferences(prev => ({
        ...prev,
        dislikes: [...prev.dislikes, newDislike.trim()]
      }));
      setNewDislike('');
    }
  };

  const removeDislike = (index) => {
    setPreferences(prev => ({
      ...prev,
      dislikes: prev.dislikes.filter((_, i) => i !== index)
    }));
  };

  const addFavorite = () => {
    if (newFavorite.trim()) {
      setPreferences(prev => ({
        ...prev,
        favorites: [...prev.favorites, newFavorite.trim()]
      }));
      setNewFavorite('');
    }
  };

  const removeFavorite = (index) => {
    setPreferences(prev => ({
      ...prev,
      favorites: prev.favorites.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    console.log('Sending preferences:', preferences); // Debug
    onNext(preferences);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text variant="bodyLarge" style={styles.description}>
        Cuéntanos sobre tus preferencias alimentarias y objetivos de salud.
      </Text>

      {/* Preferencias Dietéticas */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Preferencias Dietéticas
          </Text>

          <View style={styles.switchRow}>
            <Text variant="bodyLarge">Vegetariano</Text>
            <Switch
              value={preferences.vegetarian}
              onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, vegetarian: value }))
              }
            />
          </View>

          <View style={styles.switchRow}>
            <Text variant="bodyLarge">Vegano</Text>
            <Switch
              value={preferences.vegan}
              onValueChange={(value) => 
                setPreferences(prev => ({ 
                  ...prev, 
                  vegan: value,
                  vegetarian: value ? true : prev.vegetarian 
                }))
              }
            />
          </View>
        </Card.Content>
      </Card>

      {/* Objetivos de Salud */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Objetivos de Salud
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Selecciona uno o más objetivos principales
          </Text>

          <View style={styles.goalsContainer}>
            {HEALTH_GOALS.map(goal => {
              const isSelected = preferences.selectedGoals.includes(goal.id);
              return (
                <Chip
                  key={goal.id}
                  selected={isSelected}
                  onPress={() => toggleGoal(goal.id)}
                  style={styles.goalChip}
                  icon={goal.icon}
                  mode="outlined"
                  showSelectedCheck
                >
                  {goal.title}
                </Chip>
              );
            })}
          </View>

          {/* Mostrar objetivos seleccionados para debugging */}
          {preferences.selectedGoals.length > 0 && (
            <Card style={styles.debugCard}>
              <Card.Content>
                <Text variant="bodySmall">
                  ✓ {preferences.selectedGoals.length} objetivo(s) seleccionado(s)
                </Text>
              </Card.Content>
            </Card>
          )}
        </Card.Content>
      </Card>

      {/* Alimentos que NO te gustan */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Alimentos que NO te gustan
          </Text>
          
          <View style={styles.inputRow}>
            <TextInput
              value={newDislike}
              onChangeText={setNewDislike}
              placeholder="Ej: Brócoli"
              mode="outlined"
              style={styles.textInput}
            />
            <Button mode="contained" onPress={addDislike} style={styles.addButton}>
              +
            </Button>
          </View>

          <View style={styles.chipsContainer}>
            {preferences.dislikes.map((item, index) => (
              <Chip
                key={index}
                onClose={() => removeDislike(index)}
                style={styles.chip}
              >
                {item}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Alimentos Favoritos */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Alimentos Favoritos
          </Text>
          
          <View style={styles.inputRow}>
            <TextInput
              value={newFavorite}
              onChangeText={setNewFavorite}
              placeholder="Ej: Quinua"
              mode="outlined"
              style={styles.textInput}
            />
            <Button mode="contained" onPress={addFavorite} style={styles.addButton}>
              +
            </Button>
          </View>

          <View style={styles.chipsContainer}>
            {preferences.favorites.map((item, index) => (
              <Chip
                key={index}
                onClose={() => removeFavorite(index)}
                style={styles.chip}
              >
                {item}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Comidas por día */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Comidas por Día
          </Text>
          <TextInput
            label="Número de comidas"
            value={preferences.mealsPerDay}
            onChangeText={(value) => 
              setPreferences(prev => ({ ...prev, mealsPerDay: value }))
            }
            mode="outlined"
            keyboardType="numeric"
          />
        </Card.Content>
      </Card>

      {/* Notas adicionales */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Notas Adicionales
          </Text>
          <TextInput
            value={preferences.notes}
            onChangeText={(value) => 
              setPreferences(prev => ({ ...prev, notes: value }))
            }
            placeholder="Cualquier otra información que quieras compartir..."
            mode="outlined"
            multiline
            numberOfLines={4}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={onBack}
          style={styles.backButton}
          icon="arrow-left"
        >
          Atrás
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
          icon="arrow-right"
          contentStyle={styles.buttonContent}
        >
          Ver Resumen
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
  description: {
    marginBottom: 24,
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#2E7D32',
  },
  subtitle: {
    color: '#666',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    marginBottom: 8,
  },
  debugCard: {
    marginTop: 12,
    backgroundColor: '#E8F5E9',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
  },
  addButton: {
    justifyContent: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
  },
});