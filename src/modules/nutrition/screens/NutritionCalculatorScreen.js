// src/modules/nutrition/screens/NutritionCalculatorScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, FAB, List, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { calculateNutrition, getAllFoods } from '../services/nutritionApi';

export default function NutritionCalculatorScreen() {
  const [foods, setFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [totalNutrition, setTotalNutrition] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      const response = await getAllFoods();
      setFoods(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los alimentos');
    }
  };

  const addFood = (food) => {
    const newFood = {
      foodId: food._id,
      name: food.name,
      quantity: 100, // Default 100g
      nutrition: food.nutritionalInfo,
    };
    setSelectedFoods([...selectedFoods, newFood]);
    setShowFoodModal(false);
    setSearchQuery('');
  };

  const removeFood = (index) => {
    const updated = [...selectedFoods];
    updated.splice(index, 1);
    setSelectedFoods(updated);
  };

  const updateQuantity = (index, quantity) => {
    const updated = [...selectedFoods];
    updated[index].quantity = parseFloat(quantity) || 0;
    setSelectedFoods(updated);
  };

  const handleCalculate = async () => {
    if (selectedFoods.length === 0) {
      Alert.alert('Atención', 'Agrega al menos un alimento para calcular');
      return;
    }

    try {
      setCalculating(true);
      const items = selectedFoods.map(food => ({
        foodId: food.foodId,
        quantity: food.quantity,
      }));

      const response = await calculateNutrition(items);
      setTotalNutrition(response.data);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCalculating(false);
    }
  };

  const clearAll = () => {
    setSelectedFoods([]);
    setTotalNutrition(null);
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="information" size={24} color="#2E7D32" />
              <Text style={styles.infoText}>
                Agrega alimentos y sus cantidades para calcular la información nutricional total
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Lista de alimentos seleccionados */}
        <Card style={styles.card}>
          <Card.Title
            title="Alimentos Seleccionados"
            titleVariant="titleLarge"
            left={(props) => <MaterialCommunityIcons name="food-apple" {...props} size={24} color="#2E7D32" />}
          />
          <Card.Content>
            {selectedFoods.length === 0 ? (
              <Text style={styles.emptyText}>
                No has agregado alimentos aún. Toca el botón + para agregar.
              </Text>
            ) : (
              selectedFoods.map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <View style={styles.foodInfo}>
                    <Text variant="titleMedium">{food.name}</Text>
                    <TextInput
                      label="Cantidad (g)"
                      value={food.quantity.toString()}
                      onChangeText={(text) => updateQuantity(index, text)}
                      keyboardType="numeric"
                      mode="outlined"
                      style={styles.quantityInput}
                      dense
                      activeOutlineColor="#2E7D32"
                    />
                  </View>
                  <Button
                    mode="text"
                    icon="delete"
                    textColor="#F44336"
                    onPress={() => removeFood(index)}
                  >
                    Eliminar
                  </Button>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Botones de acción */}
        {selectedFoods.length > 0 && (
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              icon="calculator"
              onPress={handleCalculate}
              loading={calculating}
              disabled={calculating}
              style={styles.calculateButton}
            >
              Calcular Nutrición
            </Button>
            <Button
              mode="outlined"
              icon="delete-sweep"
              onPress={clearAll}
              style={styles.clearButton}
            >
              Limpiar Todo
            </Button>
          </View>
        )}

        {/* Resultados */}
        {totalNutrition && (
          <Card style={styles.card}>
            <Card.Title
              title="Información Nutricional Total"
              titleVariant="titleLarge"
              left={(props) => <MaterialCommunityIcons name="chart-box" {...props} size={24} color="#2E7D32" />}
            />
            <Card.Content>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <MaterialCommunityIcons name="fire" size={32} color="#FF5722" />
                  <Text variant="headlineSmall" style={styles.nutritionValue}>
                    {totalNutrition.calories.toFixed(0)}
                  </Text>
                  <Text variant="bodySmall" style={styles.nutritionLabel}>Calorías</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <MaterialCommunityIcons name="food-drumstick" size={32} color="#795548" />
                  <Text variant="headlineSmall" style={styles.nutritionValue}>
                    {totalNutrition.protein.toFixed(1)}g
                  </Text>
                  <Text variant="bodySmall" style={styles.nutritionLabel}>Proteína</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <MaterialCommunityIcons name="bread-slice" size={32} color="#FFC107" />
                  <Text variant="headlineSmall" style={styles.nutritionValue}>
                    {totalNutrition.carbohydrates.toFixed(1)}g
                  </Text>
                  <Text variant="bodySmall" style={styles.nutritionLabel}>Carbohidratos</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <MaterialCommunityIcons name="water" size={32} color="#03A9F4" />
                  <Text variant="headlineSmall" style={styles.nutritionValue}>
                    {totalNutrition.fat.toFixed(1)}g
                  </Text>
                  <Text variant="bodySmall" style={styles.nutritionLabel}>Grasas</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <MaterialCommunityIcons name="barley" size={32} color="#8BC34A" />
                  <Text variant="headlineSmall" style={styles.nutritionValue}>
                    {totalNutrition.fiber.toFixed(1)}g
                  </Text>
                  <Text variant="bodySmall" style={styles.nutritionLabel}>Fibra</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <MaterialCommunityIcons name="shaker" size={32} color="#9E9E9E" />
                  <Text variant="headlineSmall" style={styles.nutritionValue}>
                    {totalNutrition.sodium.toFixed(0)}mg
                  </Text>
                  <Text variant="bodySmall" style={styles.nutritionLabel}>Sodio</Text>
                </View>
              </View>

              <Divider style={styles.divider} />

              <Text variant="titleMedium" style={styles.mineralsTitle}>
                Minerales y Vitaminas
              </Text>
              <View style={styles.mineralsGrid}>
                <View style={styles.mineralItem}>
                  <Text variant="bodyMedium">Hierro: {totalNutrition.iron.toFixed(1)}mg</Text>
                </View>
                <View style={styles.mineralItem}>
                  <Text variant="bodyMedium">Calcio: {totalNutrition.calcium.toFixed(1)}mg</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* FAB para agregar alimentos */}
      <FAB
        icon="plus"
        label="Agregar Alimento"
        style={styles.fab}
        onPress={() => setShowFoodModal(true)}
        color="#fff"
      />

      {/* Modal de selección de alimentos */}
      <Portal>
        <Modal
          visible={showFoodModal}
          onDismiss={() => setShowFoodModal(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge">Seleccionar Alimento</Text>
            <Button onPress={() => setShowFoodModal(false)}>Cerrar</Button>
          </View>

          <TextInput
            label="Buscar alimento..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            style={styles.searchInput}
            left={<TextInput.Icon icon="magnify" />}
            activeOutlineColor="#2E7D32"
          />

          <ScrollView style={styles.foodsList}>
            {filteredFoods.map((food) => (
              <List.Item
                key={food._id}
                title={food.name}
                description={`${food.category} - ${food.region}`}
                left={(props) => <List.Icon {...props} icon="food-apple" />}
                onPress={() => addFood(food)}
                style={styles.foodListItem}
              />
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    margin: 16,
    backgroundColor: '#E8F5E9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: '#1B5E20',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  foodInfo: {
    flex: 1,
  },
  quantityInput: {
    marginTop: 8,
    maxWidth: 120,
  },
  actionsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  calculateButton: {
    marginBottom: 12,
  },
  clearButton: {
    borderColor: '#F44336',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  nutritionValue: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
  },
  nutritionLabel: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  mineralsTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#2E7D32',
  },
  mineralsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mineralItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2E7D32',
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    margin: 16,
  },
  foodsList: {
    maxHeight: 400,
  },
  foodListItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});