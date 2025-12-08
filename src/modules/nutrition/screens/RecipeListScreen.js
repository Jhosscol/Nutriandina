// src/modules/nutrition/screens/RecipeListScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, Menu, Searchbar, Text } from 'react-native-paper';
import { getAllRecipes } from '../services/nutritionApi';

export default function RecipeListScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [dietFilter, setDietFilter] = useState(null);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showDietMenu, setShowDietMenu] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchQuery, categoryFilter, dietFilter]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      console.log('🧪 PASO 1: Iniciando carga de recetas...');
      
      const response = await getAllRecipes();
      
      console.log('🧪 PASO 2: Respuesta recibida:', response);
      console.log('🧪 PASO 3: Tipo de response:', typeof response);
      console.log('🧪 PASO 4: response.data existe?', !!response.data);
      console.log('🧪 PASO 5: response.data es array?', Array.isArray(response.data));
      console.log('🧪 PASO 6: Cantidad de recetas:', response.data?.length);
      console.log('🧪 PASO 7: Primera receta:', JSON.stringify(response.data?.[0], null, 2));
      
      setRecipes(response.data);
      setFilteredRecipes(response.data);
      
      console.log('🧪 PASO 8: Estado actualizado correctamente');
    } catch (error) {
      console.error('❌ ERROR COMPLETO:', error);
      console.error('❌ ERROR MESSAGE:', error.message);
      console.error('❌ ERROR STACK:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (categoryFilter) {
      filtered = filtered.filter(recipe => recipe.category === categoryFilter);
    }

    // Filtrar por dieta
    if (dietFilter) {
      filtered = filtered.filter(recipe => {
        if (dietFilter === 'vegetarian') return recipe.diets?.vegetarian;
        if (dietFilter === 'vegan') return recipe.diets?.vegan;
        return true;
      });
    }

    setFilteredRecipes(filtered);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'desayuno': return 'coffee';
      case 'almuerzo': return 'food-variant';
      case 'cena': return 'moon-waning-crescent';
      case 'snack': return 'food-apple';
      case 'postre': return 'cupcake';
      default: return 'food';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'desayuno': return '#FF9800';
      case 'almuerzo': return '#F44336';
      case 'cena': return '#9C27B0';
      case 'snack': return '#4CAF50';
      case 'postre': return '#E91E63';
      default: return '#999';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'desayuno': return 'Desayuno';
      case 'almuerzo': return 'Almuerzo';
      case 'cena': return 'Cena';
      case 'snack': return 'Snack';
      case 'postre': return 'Postre';
      default: return category;
    }
  };

  const clearFilters = () => {
    setCategoryFilter(null);
    setDietFilter(null);
    setSearchQuery('');
  };

  const renderRecipeCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RecipeDetail', { id: item._id })}
    >
      <Card style={styles.recipeCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <MaterialCommunityIcons
                name={getCategoryIcon(item.category)}
                size={24}
                color={getCategoryColor(item.category)}
              />
              <Text
                variant="bodySmall"
                style={[styles.categoryText, { color: getCategoryColor(item.category) }]}
              >
                {getCategoryLabel(item.category)}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </View>

          <Text variant="titleLarge" style={styles.recipeName}>
            {item.name}
          </Text>

          <Text variant="bodyMedium" style={styles.recipeDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.nutritionRow}>
            <View style={styles.nutritionChip}>
              <MaterialCommunityIcons name="fire" size={16} color="#FF5722" />
              <Text variant="bodySmall" style={styles.nutritionText}>
                {item.totalNutrition.calories} kcal
              </Text>
            </View>
            <View style={styles.nutritionChip}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#2E7D32" />
              <Text variant="bodySmall" style={styles.nutritionText}>
                {item.prepTime + item.cookTime} min
              </Text>
            </View>
            <View style={styles.nutritionChip}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#2E7D32" />
              <Text variant="bodySmall" style={styles.nutritionText}>
                {item.servings} porciones
              </Text>
            </View>
          </View>

          <View style={styles.tagsRow}>
            {item.diets?.vegetarian && (
              <Chip icon="leaf" style={styles.dietChip} textStyle={styles.chipText}>
                Vegetariano
              </Chip>
            )}
            {item.diets?.vegan && (
              <Chip icon="sprout" style={styles.dietChip} textStyle={styles.chipText}>
                Vegano
              </Chip>
            )}
            {item.difficulty && (
              <Chip style={styles.dietChip} textStyle={styles.chipText}>
                {item.difficulty === 'facil' ? 'Fácil' : 
                 item.difficulty === 'media' ? 'Media' : 'Difícil'}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Búsqueda */}
      <Searchbar
        placeholder="Buscar recetas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor="#2E7D32"
      />

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Menu
          visible={showCategoryMenu}
          onDismiss={() => setShowCategoryMenu(false)}
          anchor={
            <Button
              mode={categoryFilter ? 'contained' : 'outlined'}
              onPress={() => setShowCategoryMenu(true)}
              icon="filter"
              style={styles.filterButton}
              compact
            >
              {categoryFilter ? getCategoryLabel(categoryFilter) : 'Categoría'}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setCategoryFilter('desayuno'); setShowCategoryMenu(false); }} title="Desayuno" />
          <Menu.Item onPress={() => { setCategoryFilter('almuerzo'); setShowCategoryMenu(false); }} title="Almuerzo" />
          <Menu.Item onPress={() => { setCategoryFilter('cena'); setShowCategoryMenu(false); }} title="Cena" />
          <Menu.Item onPress={() => { setCategoryFilter('snack'); setShowCategoryMenu(false); }} title="Snack" />
          <Menu.Item onPress={() => { setCategoryFilter('postre'); setShowCategoryMenu(false); }} title="Postre" />
        </Menu>

        <Menu
          visible={showDietMenu}
          onDismiss={() => setShowDietMenu(false)}
          anchor={
            <Button
              mode={dietFilter ? 'contained' : 'outlined'}
              onPress={() => setShowDietMenu(true)}
              icon="leaf"
              style={styles.filterButton}
              compact
            >
              {dietFilter === 'vegetarian' ? 'Vegetariano' : 
               dietFilter === 'vegan' ? 'Vegano' : 'Dieta'}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setDietFilter('vegetarian'); setShowDietMenu(false); }} title="Vegetariano" />
          <Menu.Item onPress={() => { setDietFilter('vegan'); setShowDietMenu(false); }} title="Vegano" />
        </Menu>

        {(categoryFilter || dietFilter || searchQuery) && (
          <Button
            mode="text"
            onPress={clearFilters}
            icon="close"
            style={styles.clearButton}
            compact
          >
            Limpiar
          </Button>
        )}
      </View>

      {/* Contador de resultados */}
      <View style={styles.resultsHeader}>
        <Text variant="titleMedium">
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receta' : 'recetas'}
        </Text>
      </View>

      {/* Lista de recetas */}
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadRecipes}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="food-off" size={80} color="#999" />
            <Text variant="titleMedium" style={styles.emptyText}>
              No se encontraron recetas
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Intenta ajustar los filtros de búsqueda
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    minWidth: 100,
  },
  clearButton: {
    marginLeft: 'auto',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  recipeCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  recipeName: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  recipeDescription: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  nutritionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nutritionText: {
    marginLeft: 4,
    color: '#666',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dietChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#999',
  },
});