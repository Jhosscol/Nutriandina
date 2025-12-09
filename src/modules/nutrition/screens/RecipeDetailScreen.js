// src/modules/nutrition/screens/RecipeDetailScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text, TextInput } from 'react-native-paper';
import { adjustRecipeServings, getRecipeById } from '../services/nutritionApi';

export default function RecipeDetailScreen({ route }) {
  const { id } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState('1');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const response = await getRecipeById(id);
      setRecipe(response.data);
      setServings(response.data.servings.toString());
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustServings = async () => {
    try {
      setAdjusting(true);
      const newServings = parseInt(servings);
      
      if (isNaN(newServings) || newServings < 1) {
        Alert.alert('Error', 'Por favor ingresa un número válido de porciones');
        return;
      }

      const response = await adjustRecipeServings(id, newServings);
      setRecipe(response.data);
      Alert.alert('Éxito', 'Porciones ajustadas correctamente');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setAdjusting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'facil': return '#4CAF50';
      case 'media': return '#FF9800';
      case 'dificil': return '#F44336';
      default: return '#999';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'facil': return 'Fácil';
      case 'media': return 'Media';
      case 'dificil': return 'Difícil';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando receta...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centerContainer}>
        <Text>Receta no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header con imagen (placeholder) */}
      <Card style={styles.imageCard}>
        <Card.Content style={styles.imageContainer}>
          <MaterialCommunityIcons name="food" size={100} color="#2E7D32" />
        </Card.Content>
      </Card>

      {/* Título y descripción */}
      <View style={styles.headerSection}>
        <Text variant="headlineMedium" style={styles.title}>
          {recipe.name}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {recipe.description}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {recipe.diets?.vegetarian && (
            <Chip icon="leaf" style={styles.tag}>Vegetariano</Chip>
          )}
          {recipe.diets?.vegan && (
            <Chip icon="sprout" style={styles.tag}>Vegano</Chip>
          )}
          {recipe.tags?.map(tag => (
            <Chip key={tag} style={styles.tag}>{tag}</Chip>
          ))}
        </View>
      </View>

      {/* Info básica */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#2E7D32" />
              <Text variant="bodySmall" style={styles.infoLabel}>Preparación</Text>
              <Text variant="titleMedium" style={styles.infoValue}>
                {recipe.prepTime} min
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="chef-hat" size={24} color="#2E7D32" />
              <Text variant="bodySmall" style={styles.infoLabel}>Cocción</Text>
              <Text variant="titleMedium" style={styles.infoValue}>
                {recipe.cookTime} min
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="gauge"
                size={24}
                color={getDifficultyColor(recipe.difficulty)}
              />
              <Text variant="bodySmall" style={styles.infoLabel}>Dificultad</Text>
              <Text
                variant="titleMedium"
                style={[styles.infoValue, { color: getDifficultyColor(recipe.difficulty) }]}
              >
                {getDifficultyLabel(recipe.difficulty)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#2E7D32" />
              <Text variant="bodySmall" style={styles.infoLabel}>Porciones</Text>
              <Text variant="titleMedium" style={styles.infoValue}>
                {recipe.servings}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Información nutricional */}
      <Card style={styles.card}>
        <Card.Title
          title="Información Nutricional"
          titleVariant="titleLarge"
          left={(props) => <MaterialCommunityIcons name="nutrition" {...props} size={24} color="#2E7D32" />}
        />
        <Card.Content>
          <Text variant="bodySmall" style={styles.portionNote}>
            Por porción ({recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'})
          </Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text variant="headlineMedium" style={styles.nutritionValue}>
                {recipe.totalNutrition.calories}
              </Text>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Calorías</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="headlineMedium" style={styles.nutritionValue}>
                {recipe.totalNutrition.protein}g
              </Text>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Proteína</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="headlineMedium" style={styles.nutritionValue}>
                {recipe.totalNutrition.carbohydrates}g
              </Text>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Carbohidratos</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="headlineMedium" style={styles.nutritionValue}>
                {recipe.totalNutrition.fat}g
              </Text>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Grasas</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="headlineMedium" style={styles.nutritionValue}>
                {recipe.totalNutrition.fiber}g
              </Text>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Fibra</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="headlineMedium" style={styles.nutritionValue}>
                {recipe.totalNutrition.sodium}mg
              </Text>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Sodio</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Ajustar porciones */}
      <Card style={styles.card}>
        <Card.Title
          title="Ajustar Porciones"
          titleVariant="titleLarge"
          left={(props) => <MaterialCommunityIcons name="scale-balance" {...props} size={24} color="#2E7D32" />}
        />
        <Card.Content>
          <View style={styles.servingsRow}>
            <TextInput
              label="Número de porciones"
              value={servings}
              onChangeText={setServings}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.servingsInput}
              activeOutlineColor="#2E7D32"
            />
            <Button
              mode="contained"
              onPress={handleAdjustServings}
              loading={adjusting}
              disabled={adjusting}
              style={styles.adjustButton}
            >
              Ajustar
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Ingredientes */}
      <Card style={styles.card}>
        <Card.Title
          title="Ingredientes"
          titleVariant="titleLarge"
          left={(props) => <MaterialCommunityIcons name="food-apple" {...props} size={24} color="#2E7D32" />}
        />
        <Card.Content>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <MaterialCommunityIcons name="circle-small" size={24} color="#2E7D32" />
              <Text variant="bodyLarge" style={styles.ingredientText}>
                {ingredient.quantity} {ingredient.unit} de {ingredient.name || ingredient.foodId?.name}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Instrucciones */}
      <Card style={styles.card}>
        <Card.Title
          title="Preparación"
          titleVariant="titleLarge"
          left={(props) => <MaterialCommunityIcons name="format-list-numbered" {...props} size={24} color="#2E7D32" />}
        />
        <Card.Content>
          {recipe.instructions.map((instruction) => (
            <View key={instruction.step} style={styles.stepContainer}>
              <View style={styles.stepNumber}>
                <Text variant="titleMedium" style={styles.stepNumberText}>
                  {instruction.step}
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.stepText}>
                {instruction.description}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Restricciones y alergenos */}
      {(recipe.restrictions || recipe.allergens?.length > 0) && (
        <Card style={styles.card}>
          <Card.Title
            title="Advertencias"
            titleVariant="titleLarge"
            left={(props) => <MaterialCommunityIcons name="alert-circle" {...props} size={24} color="#FF9800" />}
          />
          <Card.Content>
            {recipe.restrictions?.diabetes && (
              <View style={styles.warningRow}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.warningText}>No recomendado para diabéticos</Text>
              </View>
            )}
            {recipe.restrictions?.hypertension && (
              <View style={styles.warningRow}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.warningText}>No recomendado para hipertensos</Text>
              </View>
            )}
            {recipe.restrictions?.highCholesterol && (
              <View style={styles.warningRow}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.warningText}>No recomendado para colesterol alto</Text>
              </View>
            )}
            {recipe.allergens?.length > 0 && (
              <View style={styles.warningRow}>
                <MaterialCommunityIcons name="alert" size={20} color="#FF9800" />
                <Text style={styles.warningText}>
                  Contiene: {recipe.allergens.join(', ')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCard: {
    margin: 0,
    borderRadius: 0,
  },
  imageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  headerSection: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  infoLabel: {
    color: '#666',
    marginTop: 4,
  },
  infoValue: {
    fontWeight: '600',
    marginTop: 2,
  },
  portionNote: {
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '31%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  nutritionValue: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  nutritionLabel: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  servingsInput: {
    flex: 1,
  },
  adjustButton: {
    marginTop: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientText: {
    flex: 1,
    marginLeft: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    lineHeight: 24,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningText: {
    marginLeft: 8,
    color: '#666',
  },
});