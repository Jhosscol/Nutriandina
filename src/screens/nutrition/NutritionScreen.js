import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../config/theme';

const { width } = Dimensions.get('window');

const NutritionScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('plan');

  // Datos de ejemplo del plan nutricional
  const nutritionPlan = {
    calories: 2000,
    protein: 100,
    carbs: 250,
    fats: 70,
    water: 2.5,
  };

  const todayMeals = [
    {
      id: 1,
      type: 'Desayuno',
      time: '08:00 AM',
      name: 'Bowl de Quinua con Frutas',
      calories: 420,
      image: '🥣',
      completed: true,
      ingredients: ['Quinua cocida', 'Plátano', 'Fresas', 'Miel', 'Nueces'],
    },
    {
      id: 2,
      type: 'Snack',
      time: '11:00 AM',
      name: 'Batido de Maca y Plátano',
      calories: 180,
      image: '🥤',
      completed: true,
      ingredients: ['Maca en polvo', 'Plátano', 'Leche de almendras'],
    },
    {
      id: 3,
      type: 'Almuerzo',
      time: '01:00 PM',
      name: 'Kiwicha con Pollo y Verduras',
      calories: 650,
      image: '🍱',
      completed: false,
      ingredients: ['Kiwicha', 'Pechuga de pollo', 'Brócoli', 'Zanahoria'],
    },
    {
      id: 4,
      type: 'Snack',
      time: '04:00 PM',
      name: 'Tarwi Tostado',
      calories: 150,
      image: '🥜',
      completed: false,
      ingredients: ['Tarwi tostado', 'Sal marina'],
    },
    {
      id: 5,
      type: 'Cena',
      time: '07:00 PM',
      name: 'Sopa de Quinua con Verduras',
      calories: 380,
      image: '🍲',
      completed: false,
      ingredients: ['Quinua', 'Zanahoria', 'Apio', 'Cebolla', 'Ajo'],
    },
  ];

  const recipes = [
    {
      id: 1,
      name: 'Ensalada de Quinua Tricolor',
      time: '20 min',
      difficulty: 'Fácil',
      calories: 350,
      rating: 4.8,
      image: '🥗',
      tags: ['Sin gluten', 'Vegetariano'],
    },
    {
      id: 2,
      name: 'Hamburguesa de Tarwi',
      time: '30 min',
      difficulty: 'Media',
      calories: 420,
      rating: 4.6,
      image: '🍔',
      tags: ['Alta proteína', 'Vegano'],
    },
    {
      id: 3,
      name: 'Batido Energético de Maca',
      time: '5 min',
      difficulty: 'Fácil',
      calories: 280,
      rating: 4.9,
      image: '🥤',
      tags: ['Energizante', 'Post-entrenamiento'],
    },
  ];

  const renderMacros = () => (
    <View style={styles.macrosCard}>
      <Text style={styles.macrosTitle}>Macronutrientes Diarios</Text>
      <View style={styles.macrosGrid}>
        <MacroItem
          icon="fire"
          label="Calorías"
          value={nutritionPlan.calories}
          unit="kcal"
          color={colors.error}
        />
        <MacroItem
          icon="food-drumstick"
          label="Proteínas"
          value={nutritionPlan.protein}
          unit="g"
          color={colors.info}
        />
        <MacroItem
          icon="bread-slice"
          label="Carbohidratos"
          value={nutritionPlan.carbs}
          unit="g"
          color={colors.accent}
        />
        <MacroItem
          icon="butter"
          label="Grasas"
          value={nutritionPlan.fats}
          unit="g"
          color={colors.warning}
        />
      </View>
    </View>
  );

  const renderPlanTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {renderMacros()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan de Hoy</Text>
        <Text style={styles.sectionSubtitle}>
          {todayMeals.filter(m => m.completed).length} de {todayMeals.length} comidas completadas
        </Text>

        {todayMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </View>

      <TouchableOpacity style={styles.addMealButton}>
        <Icon name="plus-circle" size={24} color={colors.primary} />
        <Text style={styles.addMealText}>Agregar comida personalizada</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderRecipesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recetas Recomendadas</Text>
        <Text style={styles.sectionSubtitle}>
          Basadas en tu perfil de salud
        </Text>

        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <View style={styles.categoriesGrid}>
          <CategoryCard name="Desayunos" icon="coffee" />
          <CategoryCard name="Almuerzos" icon="food" />
          <CategoryCard name="Cenas" icon="moon-waning-crescent" />
          <CategoryCard name="Snacks" icon="food-apple" />
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Nutrición</Text>
        <TouchableOpacity>
          <Icon name="calendar" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'plan' && styles.activeTab]}
          onPress={() => setSelectedTab('plan')}
        >
          <Text
            style={[styles.tabText, selectedTab === 'plan' && styles.activeTabText]}
          >
            Mi Plan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recipes' && styles.activeTab]}
          onPress={() => setSelectedTab('recipes')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'recipes' && styles.activeTabText,
            ]}
          >
            Recetas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedTab === 'plan' ? renderPlanTab() : renderRecipesTab()}
      </View>
    </View>
  );
};

const MacroItem = ({ icon, label, value, unit, color }) => (
  <View style={styles.macroItem}>
    <Icon name={icon} size={24} color={color} />
    <Text style={[styles.macroValue, { color }]}>
      {value}
      <Text style={styles.macroUnit}>{unit}</Text>
    </Text>
    <Text style={styles.macroLabel}>{label}</Text>
  </View>
);

const MealCard = ({ meal }) => (
  <TouchableOpacity style={styles.mealCard}>
    <View style={styles.mealHeader}>
      <View style={styles.mealInfo}>
        <Text style={styles.mealImage}>{meal.image}</Text>
        <View style={styles.mealDetails}>
          <Text style={styles.mealType}>{meal.type}</Text>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealTime}>{meal.time}</Text>
        </View>
      </View>
      <View style={styles.mealRight}>
        <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
        <TouchableOpacity
          style={[
            styles.checkButton,
            meal.completed && styles.checkButtonCompleted,
          ]}
        >
          <Icon
            name={meal.completed ? 'check' : 'plus'}
            size={20}
            color={meal.completed ? colors.surface : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
    {meal.completed && (
      <View style={styles.ingredientsContainer}>
        <Text style={styles.ingredientsLabel}>Ingredientes:</Text>
        <Text style={styles.ingredientsList}>
          {meal.ingredients.join(', ')}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

const RecipeCard = ({ recipe }) => (
  <TouchableOpacity style={styles.recipeCard}>
    <View style={styles.recipeImageContainer}>
      <Text style={styles.recipeImage}>{recipe.image}</Text>
    </View>
    <View style={styles.recipeInfo}>
      <Text style={styles.recipeName}>{recipe.name}</Text>
      <View style={styles.recipeStats}>
        <View style={styles.recipeStat}>
          <Icon name="clock-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.recipeStatText}>{recipe.time}</Text>
        </View>
        <View style={styles.recipeStat}>
          <Icon name="fire" size={14} color={colors.textSecondary} />
          <Text style={styles.recipeStatText}>{recipe.calories} kcal</Text>
        </View>
        <View style={styles.recipeStat}>
          <Icon name="star" size={14} color={colors.accent} />
          <Text style={styles.recipeStatText}>{recipe.rating}</Text>
        </View>
      </View>
      <View style={styles.recipeTags}>
        {recipe.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  </TouchableOpacity>
);

const CategoryCard = ({ name, icon }) => (
  <TouchableOpacity style={styles.categoryCard}>
    <Icon name={icon} size={32} color={colors.primary} />
    <Text style={styles.categoryName}>{name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.h2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
  },
  macrosCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
  },
  macrosTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  macroItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  macroValue: {
    ...typography.h2,
    marginTop: spacing.xs,
  },
  macroUnit: {
    ...typography.caption,
    fontWeight: 'normal',
  },
  macroLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  mealCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  mealImage: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  mealDetails: {
    flex: 1,
  },
  mealType: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  mealName: {
    ...typography.body,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  mealTime: {
    ...typography.small,
    marginTop: spacing.xs,
  },
  mealRight: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  ingredientsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  ingredientsLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  ingredientsList: {
    ...typography.small,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  addMealText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  recipeImageContainer: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
  },
  recipeImage: {
    fontSize: 48,
  },
  recipeInfo: {
    flex: 1,
    padding: spacing.md,
  },
  recipeName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  recipeStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  recipeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeStatText: {
    ...typography.small,
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    ...typography.small,
    color: colors.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: (width - spacing.lg * 3) / 2,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryName: {
    ...typography.body,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});

export default NutritionScreen;