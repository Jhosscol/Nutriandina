// src/modules/nutrition/screens/NutritionDashboard.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, FAB, ProgressBar, Text } from 'react-native-paper';
import { getActivePlan } from '../services/nutritionApi';

export default function NutritionDashboard({ navigation, route }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivePlan();
  }, []);

  // 🔥 REFRESCAR cuando vuelves de otra pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('📱 Dashboard enfocado, recargando plan...');
      loadActivePlan();
    });

    return unsubscribe;
  }, [navigation]);

  const loadActivePlan = async () => {
    try {
      setLoading(true);
      const response = await getActivePlan();
      console.log('📋 Plan cargado:', response.data);
      console.log('📊 Progreso:', response.data.progress);
      setPlan(response.data);
    } catch (error) {
      console.log('⚠️ No hay plan activo:', error.message);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivePlan();
    setRefreshing(false);
  };

  const getCurrentDay = () => {
    if (!plan) return 1;
    const startDate = new Date(plan.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, plan.duration);
  };

  const getTodayMenu = () => {
    if (!plan) return null;
    
    if (!plan.dailyMenus || plan.dailyMenus.length === 0) {
      console.log('⚠️ El plan no tiene menús diarios todavía');
      return null;
    }
    
    const currentDay = getCurrentDay();
    return plan.dailyMenus.find(menu => menu.day === currentDay);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <MaterialCommunityIcons name="chef-hat" size={100} color="#2E7D32" />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            ¡Comienza tu viaje nutricional!
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Genera tu plan personalizado con alimentos andinos nutritivos
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('GeneratePlan')}
            style={styles.generateButton}
          >
            Generar Mi Plan
          </Button>
          
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.infoTitle}>
                ¿Qué incluye tu plan?
              </Text>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="calendar-month" size={24} color="#2E7D32" />
                <Text style={styles.featureText}>30 días de menús personalizados</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="food-apple" size={24} color="#2E7D32" />
                <Text style={styles.featureText}>Alimentos andinos nutritivos</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="heart-pulse" size={24} color="#2E7D32" />
                <Text style={styles.featureText}>Adaptado a tu salud y objetivos</Text>
              </View>
              <View style={styles.featureRow}>
                <MaterialCommunityIcons name="cart" size={24} color="#2E7D32" />
                <Text style={styles.featureText}>Lista de compras incluida</Text>
              </View>
            </Card.Content>
          </Card>

          <Button
            mode="outlined"
            icon="book-open-variant"
            onPress={() => navigation.navigate('RecipeList')}
            style={styles.secondaryButton}
          >
            Explorar Recetas
          </Button>
        </ScrollView>
      </View>
    );
  }

  const currentDay = getCurrentDay();
  const todayMenu = getTodayMenu();
  const progress = plan.progress?.adherence ? plan.progress.adherence / 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con progreso */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <Text variant="headlineSmall" style={styles.planTitle}>
                  Plan Nutricional
                </Text>
                <Chip icon="calendar" style={styles.chip}>
                  Día {currentDay} de {plan.duration}
                </Chip>
              </View>
              <MaterialCommunityIcons name="leaf" size={60} color="#2E7D32" />
            </View>

            {plan.progress && (
              <View style={styles.progressContainer}>
                <Text variant="bodySmall" style={styles.progressLabel}>
                  Progreso: {plan.progress.completedDays || 0} días completados
                </Text>
                <ProgressBar
                  progress={progress}
                  color="#2E7D32"
                  style={styles.progressBar}
                />
                <Text variant="bodySmall" style={styles.adherenceText}>
                  {(plan.progress.adherence || 0).toFixed(1)}% de adherencia
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Objetivos nutricionales */}
        {plan.nutritionalGoals && (
          <Card style={styles.card}>
            <Card.Title
              title="Objetivos Diarios"
              titleVariant="titleLarge"
              left={(props) => <MaterialCommunityIcons name="target" {...props} size={24} color="#2E7D32" />}
            />
            <Card.Content>
              <View style={styles.goalsGrid}>
                <View style={styles.goalItem}>
                  <Text variant="headlineSmall" style={styles.goalValue}>
                    {plan.nutritionalGoals.dailyCalories || 0}
                  </Text>
                  <Text variant="bodySmall" style={styles.goalLabel}>Calorías</Text>
                </View>
                <View style={styles.goalItem}>
                  <Text variant="headlineSmall" style={styles.goalValue}>
                    {plan.nutritionalGoals.protein || 0}g
                  </Text>
                  <Text variant="bodySmall" style={styles.goalLabel}>Proteína</Text>
                </View>
                <View style={styles.goalItem}>
                  <Text variant="headlineSmall" style={styles.goalValue}>
                    {plan.nutritionalGoals.carbohydrates || 0}g
                  </Text>
                  <Text variant="bodySmall" style={styles.goalLabel}>Carbohidratos</Text>
                </View>
                <View style={styles.goalItem}>
                  <Text variant="headlineSmall" style={styles.goalValue}>
                    {plan.nutritionalGoals.fat || 0}g
                  </Text>
                  <Text variant="bodySmall" style={styles.goalLabel}>Grasas</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Menú de hoy */}
        <Card style={styles.card}>
          <Card.Title
            title={`Menú de Hoy - Día ${currentDay}`}
            titleVariant="titleLarge"
            left={(props) => <MaterialCommunityIcons name="food" {...props} size={24} color="#2E7D32" />}
            right={(props) => 
              todayMenu ? (
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('DailyMenu', { day: currentDay })}
                >
                  Ver todo
                </Button>
              ) : null
            }
          />
          <Card.Content>
            {todayMenu ? (
              <>
                {todayMenu.meals?.breakfast && (
                  <View style={styles.mealRow}>
                    <MaterialCommunityIcons name="coffee" size={24} color="#FF9800" />
                    <View style={styles.mealInfo}>
                      <Text variant="titleMedium">{todayMenu.meals.breakfast.recipeName}</Text>
                      <Text variant="bodySmall" style={styles.calories}>
                        {todayMenu.meals.breakfast.nutrition?.calories || 0} kcal
                      </Text>
                    </View>
                  </View>
                )}

                {todayMenu.meals?.lunch && (
                  <View style={styles.mealRow}>
                    <MaterialCommunityIcons name="food-variant" size={24} color="#F44336" />
                    <View style={styles.mealInfo}>
                      <Text variant="titleMedium">{todayMenu.meals.lunch.recipeName}</Text>
                      <Text variant="bodySmall" style={styles.calories}>
                        {todayMenu.meals.lunch.nutrition?.calories || 0} kcal
                      </Text>
                    </View>
                  </View>
                )}

                {todayMenu.meals?.dinner && (
                  <View style={styles.mealRow}>
                    <MaterialCommunityIcons name="moon-waning-crescent" size={24} color="#9C27B0" />
                    <View style={styles.mealInfo}>
                      <Text variant="titleMedium">{todayMenu.meals.dinner.recipeName}</Text>
                      <Text variant="bodySmall" style={styles.calories}>
                        {todayMenu.meals.dinner.nutrition?.calories || 0} kcal
                      </Text>
                    </View>
                  </View>
                )}

                {todayMenu.totalNutrition && (
                  <View style={styles.totalRow}>
                    <Text variant="titleMedium">Total del día:</Text>
                    <Text variant="titleMedium" style={styles.totalCalories}>
                      {todayMenu.totalNutrition.calories?.toFixed(0) || 0} kcal
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyMenuContainer}>
                <MaterialCommunityIcons name="food-off" size={48} color="#999" />
                <Text variant="bodyMedium" style={styles.emptyMenuText}>
                  No hay menú disponible para hoy
                </Text>
                <Text variant="bodySmall" style={styles.emptyMenuSubtext}>
                  El plan está generándose. Por favor, vuelve más tarde.
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Acciones rápidas */}
        <Card style={styles.card}>
          <Card.Title title="Acciones Rápidas" titleVariant="titleLarge" />
          <Card.Content>
            <View style={styles.actionsGrid}>
              <Button
                mode="outlined"
                icon="calendar-week"
                onPress={() => navigation.navigate('WeeklyMenu')}
                style={styles.actionButton}
                disabled={!todayMenu}
              >
                Menú Semanal
              </Button>
              <Button
                mode="outlined"
                icon="cart"
                onPress={() => navigation.navigate('ShoppingList', { week: Math.ceil(currentDay / 7) })}
                style={styles.actionButton}
                disabled={!todayMenu}
              >
                Lista de Compras
              </Button>
              <Button
                mode="outlined"
                icon="calculator"
                onPress={() => navigation.navigate('NutritionCalculator')}
                style={styles.actionButton}
              >
                Calculadora
              </Button>
              <Button
                mode="outlined"
                icon="book-open"
                onPress={() => navigation.navigate('RecipeList')}
                style={styles.actionButton}
              >
                Recetas
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="refresh"
        label="Nuevo Plan"
        style={styles.fab}
        onPress={() => navigation.navigate('GeneratePlan')}
        color="#fff"
      />
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
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    color: '#2E7D32',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  generateButton: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  infoCard: {
    width: '100%',
    marginVertical: 16,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#2E7D32',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 8,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#E8F5E9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  planTitle: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  adherenceText: {
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  goalValue: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  goalLabel: {
    color: '#666',
    marginTop: 4,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mealInfo: {
    flex: 1,
    marginLeft: 12,
  },
  calories: {
    color: '#666',
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#2E7D32',
  },
  totalCalories: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  emptyMenuContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyMenuText: {
    marginTop: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyMenuSubtext: {
    marginTop: 8,
    color: '#999',
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2E7D32',
  },
  scrollContent: {
    paddingVertical: 30,
  },
});