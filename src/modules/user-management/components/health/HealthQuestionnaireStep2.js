// modules/user-management/components/health/HealthQuestionnaireStep2.js
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Chip, Searchbar, Card } from 'react-native-paper';
import { HEALTH_CONDITIONS, CONDITION_CATEGORIES } from '../../constants/healthConditions';

export default function HealthQuestionnaireStep2({ initialData = [], onNext, onBack }) {
  const [selectedConditions, setSelectedConditions] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConditions = HEALTH_CONDITIONS.filter(condition =>
    condition.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedConditions = {};
  filteredConditions.forEach(condition => {
    if (!groupedConditions[condition.category]) {
      groupedConditions[condition.category] = [];
    }
    groupedConditions[condition.category].push(condition);
  });

  const toggleCondition = (conditionId) => {
    setSelectedConditions(prev => {
      if (prev.includes(conditionId)) {
        return prev.filter(id => id !== conditionId);
      }
      return [...prev, conditionId];
    });
  };

  const handleNext = () => {
    onNext(selectedConditions);
  };

  return (
    <View style={styles.container}>
      <Text variant="bodyLarge" style={styles.description}>
        Selecciona las condiciones de salud que tienes actualmente. Esto es importante para crear un plan nutricional seguro.
      </Text>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="bodyMedium">
            💡 Si no tienes ninguna condición médica, simplemente continúa sin seleccionar nada.
          </Text>
        </Card.Content>
      </Card>

      <Searchbar
        placeholder="Buscar condición..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView style={styles.conditionsList} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedConditions).map(([category, conditions]) => (
          <View key={category} style={styles.categorySection}>
            <Text variant="titleMedium" style={styles.categoryTitle}>
              {CONDITION_CATEGORIES[category]}
            </Text>
            
            <View style={styles.chipsContainer}>
              {conditions.map(condition => (
                <Chip
                  key={condition.id}
                  selected={selectedConditions.includes(condition.id)}
                  onPress={() => toggleCondition(condition.id)}
                  style={styles.chip}
                  mode="outlined"
                  showSelectedCheck
                >
                  {condition.name}
                </Chip>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {selectedConditions.length > 0 && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleSmall">
              Condiciones seleccionadas: {selectedConditions.length}
            </Text>
          </Card.Content>
        </Card>
      )}

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
          Continuar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
  },
  searchbar: {
    marginBottom: 16,
  },
  conditionsList: {
    flex: 1,
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#2E7D32',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
    marginRight: 8,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
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