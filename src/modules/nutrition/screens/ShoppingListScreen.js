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
      setShoppingList(response.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la lista de compras');
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
    if (!shoppingList || !shoppingList.items) return {};
    
    const grouped = {};
    shoppingList.items.forEach(item => {
      const category = item.category || 'otros';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cereal': return 'barley';
      case 'legumbre': return 'seed';
      case 'tuberculo': return 'potato';
      case 'fruta': return 'fruit-cherries';
      case 'verdura': return 'leaf';
      case 'proteina': return 'food-drumstick';
      case 'lacteo': return 'cheese';
      case 'fruto_seco': return 'peanut';
      default: return 'food';
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      cereal: 'Cereales',
      legumbre: 'Legumbres',
      tuberculo: 'Tubérculos',
      fruta: 'Frutas',
      verdura: 'Verduras',
      proteina: 'Proteínas',
      lacteo: 'Lácteos',
      fruto_seco: 'Frutos Secos',
      otros: 'Otros'
    };
    return labels[category] || category;
  };

  const getCheckedCount = () => {
    return Object.values(checkedItems).filter(Boolean).length;
  };

  const getTotalItems = () => {
    return shoppingList?.items?.length || 0;
  };

  const shareList = () => {
    // Aquí podrías implementar compartir la lista por WhatsApp, email, etc.
    Alert.alert('Compartir', 'Función de compartir en desarrollo');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Cargando lista de compras...</Text>
      </View>
    );
  }

  if (!shoppingList || !shoppingList.items || shoppingList.items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <MaterialCommunityIcons name="cart-off" size={80} color="#999" />
        <Text variant="titleMedium" style={styles.emptyText}>
          Lista de compras vacía
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          No hay ingredientes para esta semana
        </Text>
      </View>
    );
  }

  const itemsByCategory = getItemsByCategory();
  const progress = getTotalItems() > 0 ? getCheckedCount() / getTotalItems() : 0;

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
                {getCheckedCount()} de {getTotalItems()} items comprados
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

        {/* Items por categoría */}
        {Object.entries(itemsByCategory).map(([category, items]) => (
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
                      {item.foodName}
                    </Text>
                    <Text variant="bodySmall" style={styles.itemQuantity}>
                      {item.totalQuantity} {item.unit}
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}

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
                disabled // Deshabilitado hasta que el Módulo 4 esté listo
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