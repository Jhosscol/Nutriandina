// src/modules/nutrition/screens/ShoppingListScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Checkbox, Chip, Divider, Text } from 'react-native-paper';
import { getShoppingList } from '../services/nutritionApi';

export default function ShoppingListScreen({ route, navigation }) {
  const { week } = route.params;
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    loadShoppingList();
  }, [week]);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const response = await getShoppingList(week);
      
      console.log('✅ Lista de compras obtenida');
      console.log(`📦 Total de items: ${response.data?.items?.length || 0}`);
      
      setShoppingList(response.data);
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      Alert.alert('Error', 'No se pudo cargar la lista de compras: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getItemsByCategory = () => {
    // SIN CATEGORIZACIÓN - Devolver todos los items en una sola categoría
    if (!shoppingList || !shoppingList.items) {
      console.warn('⚠️ No hay shoppingList o items');
      return {};
    }
    
    if (!Array.isArray(shoppingList.items)) {
      console.error('❌ items NO es un array:', typeof shoppingList.items);
      return {};
    }
    
    console.log(`✅ Mostrando ${shoppingList.items.length} items (sin categorización)`);
    
    // Devolver todos los items en una sola categoría "Lista de Compras"
    return {
      'todos': shoppingList.items
    };
  };

  const getCategoryIcon = (category) => {
    return 'cart-outline'; // Ícono simple de carrito para todos
  };

  const getCategoryLabel = (category) => {
    return 'Lista de Compras'; // Título simple sin categorías
  };

  const getCheckedCount = () => {
    return Object.values(checkedItems).filter(Boolean).length;
  };

  const getTotalItems = () => {
    const total = shoppingList?.items?.length || 0;
    console.log('🔍 getTotalItems:', total);
    return total;
  };

  const shareList = () => {
    Alert.alert('Compartir', 'Función de compartir en desarrollo');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando lista de compras...</Text>
      </View>
    );
  }

  console.log('🔍 RENDER - shoppingList:', shoppingList ? 'Existe' : 'null');
  console.log('🔍 RENDER - items.length:', shoppingList?.items?.length);

  if (!shoppingList || !shoppingList.items || shoppingList.items.length === 0) {
    console.warn('⚠️ Mostrando pantalla vacía');
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="cart-off" size={80} color="#999" />
        <Text variant="titleMedium" style={styles.emptyText}>
          Lista de compras vacía
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          No hay ingredientes para esta semana
        </Text>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        >
          Volver
        </Button>
      </View>
    );
  }

  const itemsByCategory = getItemsByCategory();
  const totalItems = getTotalItems();
  const progress = totalItems > 0 ? getCheckedCount() / totalItems : 0;

  console.log('✅ Renderizando lista con', totalItems, 'items');

  return (
    <View style={styles.container}>
      {/* Header con progreso */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <View>
              <Text variant="titleLarge" style={styles.weekTitle}>
                Semana {week}
              </Text>
              <Text variant="bodyMedium" style={styles.progressText}>
                {getCheckedCount()} de {totalItems} items comprados
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text variant="headlineSmall" style={styles.progressPercentage}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <ScrollView>
        {/* Consejo */}
        <Card style={styles.tipCard}>
          <Card.Content>
            <View style={styles.tipRow}>
              <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FF9800" />
              <Text style={styles.tipText}>
                💡 Compra todos los ingredientes al inicio de la semana para facilitar tu preparación diaria
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Items sin categorización */}
        {Object.entries(itemsByCategory).length === 0 ? (
          <Card style={styles.categoryCard}>
            <Card.Content>
              <Text>No se pudieron cargar los items</Text>
            </Card.Content>
          </Card>
        ) : (
          Object.entries(itemsByCategory).map(([category, items]) => (
            <Card key={category} style={styles.categoryCard}>
              <Card.Content>
                <View style={styles.categoryHeader}>
                  <MaterialCommunityIcons
                    name={getCategoryIcon(category)}
                    size={28}
                    color="#2E7D32"
                  />
                  <Text variant="titleLarge" style={styles.categoryTitle}>
                    {getCategoryLabel(category)}
                  </Text>
                  <Chip style={styles.categoryChip}>
                    {items.length}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                {items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Checkbox
                      status={checkedItems[`${category}-${index}`] ? 'checked' : 'unchecked'}
                      onPress={() => toggleItem(`${category}-${index}`)}
                      color="#2E7D32"
                    />
                    <View style={styles.itemInfo}>
                      <Text
                        variant="titleMedium"
                        style={[
                          styles.itemName,
                          checkedItems[`${category}-${index}`] && styles.itemChecked
                        ]}
                      >
                        {item.foodName || item.name || 'Sin nombre'}
                      </Text>
                      <Text variant="bodySmall" style={styles.itemQuantity}>
                        {item.totalQuantity 
                          ? `${item.totalQuantity} ${item.unit || ''}`
                          : item.quantity || '0'
                        }
                      </Text>
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))
        )}

        {/* Botón para comprar en marketplace */}
        <Card style={styles.marketplaceCard}>
          <Card.Content>
            <View style={styles.marketplaceContent}>
              <MaterialCommunityIcons name="store" size={48} color="#2E7D32" />
              <Text variant="titleMedium" style={styles.marketplaceTitle}>
                ¿Listo para comprar?
              </Text>
              <Text variant="bodyMedium" style={styles.marketplaceText}>
                Encuentra estos ingredientes andinos en nuestro Marketplace
              </Text>
              <Button
                mode="contained"
                icon="cart"
                onPress={() => navigation.navigate('Marketplace')}
                style={styles.marketplaceButton}
                disabled
              >
                Ir al Marketplace
              </Button>
              <Text variant="bodySmall" style={styles.comingSoon}>
                Próximamente disponible
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Botones de acción flotantes */}
      <View style={styles.fabContainer}>
        <Button
          mode="contained"
          icon="share-variant"
          onPress={shareList}
          style={styles.shareButton}
        >
          Compartir Lista
        </Button>
      </View>
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
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#999',
  },
  headerCard: {
    margin: 16,
    backgroundColor: '#E8F5E9',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekTitle: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  progressText: {
    color: '#666',
    marginTop: 4,
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tipCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF8E1',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    color: '#F57C00',
  },
  categoryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  categoryChip: {
    backgroundColor: '#E8F5E9',
  },
  divider: {
    marginVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 8,
  },
  itemName: {
    fontSize: 16,
  },
  itemChecked: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemQuantity: {
    color: '#666',
    marginTop: 2,
  },
  marketplaceCard: {
    margin: 16,
    marginTop: 8,
  },
  marketplaceContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  marketplaceTitle: {
    fontWeight: '600',
    marginTop: 12,
    color: '#2E7D32',
  },
  marketplaceText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  marketplaceButton: {
    paddingHorizontal: 24,
  },
  comingSoon: {
    color: '#999',
    marginTop: 8,
    fontStyle: 'italic',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  shareButton: {
    backgroundColor: '#2E7D32',
  },
});