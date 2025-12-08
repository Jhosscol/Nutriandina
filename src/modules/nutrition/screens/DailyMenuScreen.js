// src/modules/nutrition/screens/DailyMenuScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { getActivePlan, getDailyMenu, markDayCompleted, unmarkDayCompleted } from '../services/nutritionApi';

export default function DailyMenuScreen({ route, navigation }) {
  const { day } = route.params;
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingDay, setCompletingDay] = useState(false);
  const [isDayCompleted, setIsDayCompleted] = useState(false);
  const [completedDays, setCompletedDays] = useState([]);

  useEffect(() => {
    loadDailyMenu();
    checkIfDayCompleted();
  }, [day]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('📱 Pantalla enfocada, recargando estado del día...');
      checkIfDayCompleted();
    });

    return unsubscribe;
  }, [navigation, day]);

  const loadDailyMenu = async () => {
    try {
      setLoading(true);
      const response = await getDailyMenu(day);
      setMenu(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el menú del día');
    } finally {
      setLoading(false);
    }
  };

  const checkIfDayCompleted = async () => {
    try {
      const response = await getActivePlan();
      const plan = response.data;
      
      const completed = plan.progress?.completedDaysList || [];
      setCompletedDays(completed);
      
      const isCompleted = completed.includes(parseInt(day));
      setIsDayCompleted(isCompleted);
      
      console.log(`📅 Día ${day} - Completado:`, isCompleted);
      console.log('📋 Días completados:', completed);
      
    } catch (error) {
      console.error('Error al verificar estado del día:', error);
    }
  };

  const handleMarkCompleted = async () => {
    if (isDayCompleted) {
      Alert.alert(
        'Día ya completado',
        'Este día ya fue marcado como completado anteriormente.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      '¿Completar día?',
      `¿Deseas marcar el día ${day} como completado?\n\nEsta acción sumará a tu progreso de adherencia.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, completar',
          onPress: async () => {
            try {
              setCompletingDay(true);
              
              await markDayCompleted(day);
              await checkIfDayCompleted();
              
              Alert.alert(
                '¡Felicidades! 🎉',
                `Has completado el día ${day} exitosamente.\n\n¡Sigue así con tu plan nutricional!`,
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    navigation.goBack();
                  }
                }]
              );
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setCompletingDay(false);
            }
          }
        }
      ]
    );
  };

  // 🔥 NUEVA FUNCIÓN: Desmarcar día como completado
  const handleUnmarkCompleted = async () => {
    if (!isDayCompleted) {
      return;
    }

    Alert.alert(
      '¿Desmarcar día?',
      `¿Deseas desmarcar el día ${day} como completado?\n\nEsto restará de tu progreso de adherencia.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, desmarcar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCompletingDay(true);
              
              await unmarkDayCompleted(day);
              await checkIfDayCompleted();
              
              Alert.alert(
                'Día desmarcado',
                `El día ${day} ha sido desmarcado exitosamente.`,
                [{ 
                  text: 'OK',
                  onPress: () => {
                    navigation.goBack();
                  }
                }]
              );
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setCompletingDay(false);
            }
          }
        }
      ]
    );
  };

  const navigateToRecipe = (recipeId) => {
    if (recipeId) {
      navigation.navigate('RecipeDetail', { id: recipeId });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando menú...</Text>
      </View>
    );
  }

  if (!menu) {
    return (
      <View style={styles.centerContainer}>
        <Text>No se encontró el menú para este día</Text>
      </View>
    );
  }

  const renderMeal = (meal, icon, color, title) => {
    if (!meal) return null;

    return (
      <Card style={styles.mealCard} onPress={() => navigateToRecipe(meal.recipeId)}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleRow}>
              <MaterialCommunityIcons name={icon} size={32} color={color} />
              <Text variant="titleLarge" style={styles.mealTitle}>
                {title}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </View>

          <Text variant="titleMedium" style={styles.recipeName}>
            {meal.recipeName}
          </Text>

          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Calorías</Text>
              <Text variant="titleMedium" style={[styles.nutritionValue, { color }]}>
                {meal.nutrition.calories}
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Proteína</Text>
              <Text variant="titleMedium" style={styles.nutritionValue}>
                {meal.nutrition.protein}g
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Carbos</Text>
              <Text variant="titleMedium" style={styles.nutritionValue}>
                {meal.nutrition.carbohydrates}g
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="bodySmall" style={styles.nutritionLabel}>Grasas</Text>
              <Text variant="titleMedium" style={styles.nutritionValue}>
                {meal.nutrition.fat}g
              </Text>
            </View>
          </View>

          <Chip icon="silverware-fork-knife" style={styles.servingsChip}>
            {meal.servings} {meal.servings === 1 ? 'porción' : 'porciones'}
          </Chip>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header con fecha */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerWithStatus}>
              <View style={styles.dateInfo}>
                <Text variant="headlineSmall" style={styles.dateTitle}>
                  Día {menu.day}
                </Text>
                <Text variant="bodyMedium" style={styles.dateSubtitle}>
                  {new Date(menu.date).toLocaleDateString('es-PE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              
              {isDayCompleted && (
                <Chip 
                  icon="check-circle" 
                  style={styles.completedChip}
                  textStyle={styles.completedChipText}
                >
                  Completado
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Resumen nutricional del día */}
        <Card style={styles.summaryCard}>
          <Card.Title
            title="Resumen Nutricional del Día"
            titleVariant="titleLarge"
            left={(props) => <MaterialCommunityIcons name="chart-box" {...props} size={24} color="#2E7D32" />}
          />
          <Card.Content>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="fire" size={32} color="#FF5722" />
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {menu.totalNutrition.calories.toFixed(0)}
                </Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>Calorías</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="food-drumstick" size={32} color="#795548" />
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {menu.totalNutrition.protein.toFixed(1)}g
                </Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>Proteína</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="bread-slice" size={32} color="#FFC107" />
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {menu.totalNutrition.carbohydrates.toFixed(1)}g
                </Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>Carbohidratos</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="water" size={32} color="#03A9F4" />
                <Text variant="headlineSmall" style={styles.summaryValue}>
                  {menu.totalNutrition.fat.toFixed(1)}g
                </Text>
                <Text variant="bodySmall" style={styles.summaryLabel}>Grasas</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Comidas del día */}
        <View style={styles.mealsContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Comidas del Día
          </Text>

          {renderMeal(menu.meals.breakfast, 'coffee', '#FF9800', 'Desayuno')}
          {renderMeal(menu.meals.lunch, 'food-variant', '#F44336', 'Almuerzo')}
          {renderMeal(menu.meals.dinner, 'moon-waning-crescent', '#9C27B0', 'Cena')}

          {/* Snacks */}
          {menu.meals.snacks && menu.meals.snacks.length > 0 && (
            <>
              <Text variant="titleMedium" style={styles.snacksTitle}>
                Snacks
              </Text>
              {menu.meals.snacks.map((snack, index) => (
                <Card
                  key={index}
                  style={styles.snackCard}
                  onPress={() => navigateToRecipe(snack.recipeId)}
                >
                  <Card.Content>
                    <View style={styles.snackRow}>
                      <MaterialCommunityIcons name="food-apple" size={24} color="#4CAF50" />
                      <View style={styles.snackInfo}>
                        <Text variant="titleMedium">{snack.recipeName}</Text>
                        <Text variant="bodySmall" style={styles.snackCalories}>
                          {snack.nutrition.calories} kcal
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}
        </View>

        {/* 🔥 BOTONES DE ACCIÓN - MEJORADOS */}
        <View style={styles.actionContainer}>
          {isDayCompleted ? (
            // 🔥 SI ESTÁ COMPLETADO: Mostrar card + botón para desmarcar
            <>
              <Card style={styles.completedCard}>
                <Card.Content style={styles.completedCardContent}>
                  <MaterialCommunityIcons name="check-circle" size={48} color="#2E7D32" />
                  <Text variant="titleMedium" style={styles.completedText}>
                    Día completado exitosamente
                  </Text>
                  <Text variant="bodySmall" style={styles.completedSubtext}>
                    Este día ya fue registrado en tu progreso
                  </Text>
                </Card.Content>
              </Card>
              
              {/* Botón para desmarcar */}
              <Button
                mode="outlined"
                icon="close-circle-outline"
                onPress={handleUnmarkCompleted}
                loading={completingDay}
                disabled={completingDay}
                style={styles.unmarkButton}
                contentStyle={styles.buttonContent}
                textColor="#D32F2F"
              >
                Desmarcar Día
              </Button>
            </>
          ) : (
            // 🔥 SI NO ESTÁ COMPLETADO: Botón para marcar
            <Button
              mode="contained"
              icon="check-circle"
              onPress={handleMarkCompleted}
              loading={completingDay}
              disabled={completingDay}
              style={styles.completeButton}
              contentStyle={styles.buttonContent}
            >
              Marcar Día como Completado
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
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
  headerCard: {
    margin: 16,
    backgroundColor: '#E8F5E9',
  },
  headerWithStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateInfo: {
    flex: 1,
  },
  dateTitle: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  dateSubtitle: {
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  completedChip: {
    backgroundColor: '#2E7D32',
    marginLeft: 8,
  },
  completedChipText: {
    color: '#fff',
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
  },
  summaryLabel: {
    color: '#666',
    marginTop: 4,
  },
  mealsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  mealCard: {
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTitle: {
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  recipeName: {
    marginBottom: 16,
    color: '#2E7D32',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    color: '#999',
    marginBottom: 4,
  },
  nutritionValue: {
    fontWeight: '600',
    color: '#333',
  },
  servingsChip: {
    alignSelf: 'flex-start',
  },
  snacksTitle: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
    color: '#333',
  },
  snackCard: {
    marginBottom: 12,
  },
  snackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  snackCalories: {
    color: '#666',
    marginTop: 4,
  },
  actionContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  completeButton: {
    backgroundColor: '#2E7D32',
  },
  buttonContent: {
    height: 50,
  },
  completedCard: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#2E7D32',
    marginBottom: 16,
  },
  completedCardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  completedText: {
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 12,
  },
  completedSubtext: {
    color: '#666',
    marginTop: 4,
  },
  // 🔥 NUEVO: Estilo para botón de desmarcar
  unmarkButton: {
    borderColor: '#D32F2F',
  },
});