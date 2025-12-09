// src/modules/nutrition/screens/WeeklyMenuScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, SegmentedButtons, Text } from 'react-native-paper';
import { getActivePlan } from '../services/nutritionApi';

export default function WeeklyMenuScreen({ navigation }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [completedDays, setCompletedDays] = useState([]);

  useEffect(() => {
    loadPlan();
  }, []);

  // 🔥 REFRESCAR cuando vuelves de marcar un día
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPlan();
    });
    return unsubscribe;
  }, [navigation]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const response = await getActivePlan();
      setPlan(response.data);
      
      // 🔥 OBTENER LISTA DE DÍAS COMPLETADOS
      const completed = response.data.progress?.completedDaysList || [];
      setCompletedDays(completed);
      
      console.log('📅 Días completados:', completed);
    } catch (error) {
      console.error('Error al cargar plan:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNCIÓN PARA VERIFICAR SI UN DÍA ESTÁ COMPLETADO
  const isDayCompleted = (day) => {
    return completedDays.includes(day);
  };

  // 🔥 CALCULAR ESTADÍSTICAS DE LA SEMANA
  const getWeekStats = () => {
    const weekMenus = getWeekMenus();
    const completedInWeek = weekMenus.filter(menu => isDayCompleted(menu.day)).length;
    const totalInWeek = weekMenus.length;
    const weekProgress = totalInWeek > 0 ? Math.round((completedInWeek / totalInWeek) * 100) : 0;
    
    return {
      completed: completedInWeek,
      total: totalInWeek,
      progress: weekProgress
    };
  };

  const getWeekMenus = () => {
    if (!plan) return [];
    
    const week = parseInt(selectedWeek);
    const startDay = (week - 1) * 7 + 1;
    const endDay = Math.min(week * 7, plan.duration);
    
    return plan.dailyMenus.filter(menu => 
      menu.day >= startDay && menu.day <= endDay
    );
  };

  const getDayName = (date) => {
    return new Date(date).toLocaleDateString('es-PE', { weekday: 'long' });
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'coffee';
      case 'lunch': return 'food-variant';
      case 'dinner': return 'moon-waning-crescent';
      default: return 'food';
    }
  };

  const getMealColor = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '#FF9800';
      case 'lunch': return '#F44336';
      case 'dinner': return '#9C27B0';
      default: return '#999';
    }
  };

  const getMealTitle = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'Desayuno';
      case 'lunch': return 'Almuerzo';
      case 'dinner': return 'Cena';
      default: return mealType;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando menú semanal...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.centerContainer}>
        <Text>No hay plan activo</Text>
      </View>
    );
  }

  const weekMenus = getWeekMenus();
  const totalWeeks = Math.ceil(plan.duration / 7);
  const weekStats = getWeekStats();

  return (
    <View style={styles.container}>
      {/* Selector de semana */}
      <View style={styles.weekSelector}>
        <SegmentedButtons
          value={selectedWeek}
          onValueChange={setSelectedWeek}
          buttons={Array.from({ length: totalWeeks }, (_, i) => ({
            value: (i + 1).toString(),
            label: `Semana ${i + 1}`,
          }))}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView>
        {/* Resumen semanal */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>
              Resumen de la Semana {selectedWeek}
            </Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="calendar-range" size={24} color="#2E7D32" />
                <Text variant="bodySmall" style={styles.summaryLabel}>Días</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {weekMenus.length}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="food" size={24} color="#2E7D32" />
                <Text variant="bodySmall" style={styles.summaryLabel}>Comidas</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {weekMenus.length * 3}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons name="fire" size={24} color="#FF5722" />
                <Text variant="bodySmall" style={styles.summaryLabel}>Cal/día</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  ~{plan.nutritionalGoals.dailyCalories}
                </Text>
              </View>
            </View>

            {/* 🔥 PROGRESO DE LA SEMANA */}
            {weekStats.completed > 0 && (
              <View style={styles.weekProgressContainer}>
                <View style={styles.weekProgressHeader}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#2E7D32" />
                  <Text variant="bodyMedium" style={styles.weekProgressText}>
                    {weekStats.completed} de {weekStats.total} días completados ({weekStats.progress}%)
                  </Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Menús diarios */}
        {weekMenus.map((dayMenu) => {
          const isCompleted = isDayCompleted(dayMenu.day);
          
          return (
            <Card 
              key={dayMenu.day} 
              style={[
                styles.dayCard,
                isCompleted && styles.dayCardCompleted // 🔥 ESTILO DIFERENTE SI ESTÁ COMPLETADO
              ]}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate('DailyMenu', { day: dayMenu.day })}
              >
                <Card.Content>
                  <View style={styles.dayHeader}>
                    <View style={styles.dayHeaderLeft}>
                      <View style={styles.dayTitleRow}>
                        <Text variant="titleLarge" style={styles.dayTitle}>
                          Día {dayMenu.day}
                        </Text>
                        {/* 🔥 INDICADOR DE COMPLETADO */}
                        {isCompleted && (
                          <MaterialCommunityIcons 
                            name="check-circle" 
                            size={24} 
                            color="#2E7D32" 
                            style={styles.completedIcon}
                          />
                        )}
                      </View>
                      <Text variant="bodyMedium" style={styles.dayDate}>
                        {getDayName(dayMenu.date)}
                      </Text>
                      {/* 🔥 CHIP DE COMPLETADO */}
                      {isCompleted && (
                        <Chip 
                          icon="check" 
                          style={styles.completedChip}
                          textStyle={styles.completedChipText}
                          compact
                        >
                          Completado
                        </Chip>
                      )}
                    </View>
                    <View style={styles.dayCalories}>
                      <MaterialCommunityIcons name="fire" size={24} color="#FF5722" />
                      <Text variant="titleMedium" style={styles.caloriesText}>
                        {dayMenu.totalNutrition.calories.toFixed(0)}
                      </Text>
                      <Text variant="bodySmall" style={styles.caloriesLabel}>kcal</Text>
                    </View>
                  </View>

                  {/* Comidas del día */}
                  <View style={styles.mealsContainer}>
                    {/* Desayuno */}
                    {dayMenu.meals.breakfast && (
                      <View style={styles.mealRow}>
                        <MaterialCommunityIcons
                          name={getMealIcon('breakfast')}
                          size={20}
                          color={getMealColor('breakfast')}
                        />
                        <View style={styles.mealInfo}>
                          <Text variant="bodySmall" style={styles.mealType}>
                            {getMealTitle('breakfast')}
                          </Text>
                          <Text variant="bodyMedium" style={styles.mealName} numberOfLines={1}>
                            {dayMenu.meals.breakfast.recipeName}
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.mealCalories}>
                          {dayMenu.meals.breakfast.nutrition.calories} kcal
                        </Text>
                      </View>
                    )}

                    {/* Almuerzo */}
                    {dayMenu.meals.lunch && (
                      <View style={styles.mealRow}>
                        <MaterialCommunityIcons
                          name={getMealIcon('lunch')}
                          size={20}
                          color={getMealColor('lunch')}
                        />
                        <View style={styles.mealInfo}>
                          <Text variant="bodySmall" style={styles.mealType}>
                            {getMealTitle('lunch')}
                          </Text>
                          <Text variant="bodyMedium" style={styles.mealName} numberOfLines={1}>
                            {dayMenu.meals.lunch.recipeName}
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.mealCalories}>
                          {dayMenu.meals.lunch.nutrition.calories} kcal
                        </Text>
                      </View>
                    )}

                    {/* Cena */}
                    {dayMenu.meals.dinner && (
                      <View style={styles.mealRow}>
                        <MaterialCommunityIcons
                          name={getMealIcon('dinner')}
                          size={20}
                          color={getMealColor('dinner')}
                        />
                        <View style={styles.mealInfo}>
                          <Text variant="bodySmall" style={styles.mealType}>
                            {getMealTitle('dinner')}
                          </Text>
                          <Text variant="bodyMedium" style={styles.mealName} numberOfLines={1}>
                            {dayMenu.meals.dinner.recipeName}
                          </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.mealCalories}>
                          {dayMenu.meals.dinner.nutrition.calories} kcal
                        </Text>
                      </View>
                    )}

                    {/* Snacks */}
                    {dayMenu.meals.snacks && dayMenu.meals.snacks.length > 0 && (
                      <Chip icon="food-apple" style={styles.snackChip}>
                        {dayMenu.meals.snacks.length} snack(s)
                      </Chip>
                    )}
                  </View>

                  {/* Ver detalles */}
                  <View style={styles.viewDetailsRow}>
                    <Text variant="bodySmall" style={styles.viewDetailsText}>
                      {isCompleted ? 'Ver día completado' : 'Ver detalles completos'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#2E7D32" />
                  </View>
                </Card.Content>
              </TouchableOpacity>
            </Card>
          );
        })}
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
  weekSelector: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  segmentedButtons: {
    backgroundColor: '#fff',
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#E8F5E9',
  },
  summaryTitle: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#666',
    marginTop: 4,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 2,
  },
  // 🔥 NUEVOS ESTILOS PARA PROGRESO DE SEMANA
  weekProgressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
  },
  weekProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekProgressText: {
    marginLeft: 8,
    color: '#2E7D32',
    fontWeight: '600',
  },
  dayCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  // 🔥 ESTILO ESPECIAL PARA DÍAS COMPLETADOS
  dayCardCompleted: {
    backgroundColor: '#F1F8E9',
    borderWidth: 2,
    borderColor: '#AED581',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayHeaderLeft: {
    flex: 1,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTitle: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  // 🔥 ICONO DE CHECK AL LADO DEL TÍTULO
  completedIcon: {
    marginLeft: 8,
  },
  dayDate: {
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  // 🔥 CHIP DE COMPLETADO
  completedChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#2E7D32',
  },
  completedChipText: {
    color: '#fff',
    fontSize: 12,
  },
  dayCalories: {
    alignItems: 'center',
  },
  caloriesText: {
    fontWeight: 'bold',
    color: '#FF5722',
  },
  caloriesLabel: {
    color: '#666',
  },
  mealsContainer: {
    marginBottom: 12,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mealInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mealType: {
    color: '#999',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  mealName: {
    marginTop: 2,
  },
  mealCalories: {
    color: '#666',
    marginLeft: 8,
  },
  snackChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#2E7D32',
    fontWeight: '600',
    marginRight: 4,
  },
});