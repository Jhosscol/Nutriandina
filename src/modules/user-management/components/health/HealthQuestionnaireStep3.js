// modules/user-management/components/health/HealthQuestionnaireStep3.js
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Searchbar, Text } from 'react-native-paper';
import { ALLERGY_CATEGORIES, CRITICAL_ALLERGIES, FOOD_ALLERGIES } from '../../constants/allergies';

export default function HealthQuestionnaireStep3({ initialData = [], onNext, onBack }) {
  const [selectedAllergies, setSelectedAllergies] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAllergies = FOOD_ALLERGIES.filter(allergy =>
    allergy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedAllergies = {};
  filteredAllergies.forEach(allergy => {
    if (!groupedAllergies[allergy.category]) {
      groupedAllergies[allergy.category] = [];
    }
    groupedAllergies[allergy.category].push(allergy);
  });

  const toggleAllergy = (allergyId) => {
    setSelectedAllergies(prev => {
      if (prev.includes(allergyId)) {
        return prev.filter(id => id !== allergyId);
      }
      return [...prev, allergyId];
    });
  };

  const hasCriticalAllergies = selectedAllergies.some(id => 
    CRITICAL_ALLERGIES.includes(id)
  );

  const handleNext = () => {
    onNext(selectedAllergies);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: '#D32F2F',
      medium: '#F57C00',
      low: '#FBC02D'
    };
    return colors[severity] || '#666';
  };

  return (
    <View style={styles.container}>
      <Text variant="bodyLarge" style={styles.description}>
        Selecciona todas las alergias o intolerancias alimentarias que tengas. Esto es crucial para tu seguridad.
      </Text>

      <Card style={styles.warningCard}>
        <Card.Content>
          <Text variant="bodyMedium" style={styles.warningText}>
            ⚠️ Si tienes alergias severas, siempre consulta con tu médico antes de consumir nuevos alimentos.
          </Text>
        </Card.Content>
      </Card>

      <Searchbar
        placeholder="Buscar alergia..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView style={styles.allergiesList} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedAllergies).map(([category, allergies]) => (
          <View key={category} style={styles.categorySection}>
            <Text variant="titleMedium" style={styles.categoryTitle}>
              {ALLERGY_CATEGORIES[category]}
            </Text>
            
            <View style={styles.allergiesContainer}>
              {allergies.map(allergy => {
                const isSelected = selectedAllergies.includes(allergy.id);
                return (
                  <View key={allergy.id} style={styles.allergyItem}>
                    <Chip
                      selected={isSelected}
                      onPress={() => toggleAllergy(allergy.id)}
                      style={[
                        styles.chip,
                        isSelected && {
                          backgroundColor: `${getSeverityColor(allergy.severity)}20`
                        }
                      ]}
                      mode="outlined"
                      showSelectedCheck
                    >
                      {allergy.name}
                    </Chip>
                    {isSelected && (
                      <View style={styles.allergyDetails}>
                        <View style={[
                          styles.severityBadge,
                          { backgroundColor: getSeverityColor(allergy.severity) }
                        ]}>
                          <Text variant="labelSmall" style={styles.severityText}>
                            Severidad: {allergy.severity === 'high' ? 'Alta' : 
                                       allergy.severity === 'medium' ? 'Media' : 'Baja'}
                          </Text>
                        </View>
                        {allergy.alternatives && allergy.alternatives.length > 0 && (
                          <Text variant="bodySmall" style={styles.alternativesText}>
                            Alternativas: {allergy.alternatives.join(', ')}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            <Divider style={styles.divider} />
          </View>
        ))}
      </ScrollView>

      {selectedAllergies.length > 0 && (
        <Card style={[
          styles.summaryCard,
          hasCriticalAllergies && styles.criticalSummaryCard
        ]}>
          <Card.Content>
            <Text variant="titleSmall">
              Alergias seleccionadas: {selectedAllergies.length}
            </Text>
            {hasCriticalAllergies && (
              <Text variant="bodySmall" style={styles.criticalText}>
                ⚠️ Incluye alergias severas. Ten precaución con nuevos alimentos.
              </Text>
            )}
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
  warningCard: {
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
  },
  warningText: {
    color: '#E65100',
  },
  searchbar: {
    marginBottom: 16,
  },
  allergiesList: {
    flex: 1,
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#2E7D32',
  },
  allergiesContainer: {
    gap: 12,
  },
  allergyItem: {
    marginBottom: 8,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  allergyDetails: {
    marginTop: 8,
    marginLeft: 12,
    gap: 4,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    color: '#fff',
    fontWeight: '600',
  },
  alternativesText: {
    color: '#666',
    fontStyle: 'italic',
  },
  divider: {
    marginTop: 16,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
  },
  criticalSummaryCard: {
    backgroundColor: '#FFEBEE',
  },
  criticalText: {
    color: '#D32F2F',
    marginTop: 4,
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