// src/modules/provider/screens/ProductListScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import ProductCard from '../components/ProductCard';
import { useProviderAuth } from '../context/ProviderAuthContext';
import { productManagementService } from '../services/productManagement';

export default function ProductListScreen({ navigation }) {
  const { provider } = useProviderAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, products]);

  const loadProducts = async () => {
    setLoading(true);
    const result = await productManagementService.getProviderProducts(provider.uid);
    
    if (result.success) {
      setProducts(result.products);
    } else {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredProducts(products);
    } else if (filter === 'active') {
      setFilteredProducts(products.filter(p => p.active));
    } else if (filter === 'inactive') {
      setFilteredProducts(products.filter(p => !p.active));
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activar' : 'desactivar';

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} producto`,
      `¿Estás seguro que deseas ${action} este producto?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const result = await productManagementService.toggleProductStatus(
              productId,
              newStatus
            );

            if (result.success) {
              await loadProducts();
              Alert.alert('Éxito', `Producto ${newStatus ? 'activado' : 'desactivado'}`);
            } else {
              Alert.alert('Error', 'No se pudo cambiar el estado del producto');
            }
          }
        }
      ]
    );
  };

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { product });
  };

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onToggleStatus={() => handleToggleStatus(item.id, item.active)}
      onEdit={() => handleEditProduct(item)}
    />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No tienes productos</Text>
      <Text style={styles.emptySubtitle}>
        Comienza agregando tu primer producto
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.addButtonText}>Agregar Producto</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Productos</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
          <Ionicons name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todos ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Activos ({products.filter(p => p.active).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'inactive' && styles.filterButtonActive]}
          onPress={() => setFilter('inactive')}
        >
          <Text style={[styles.filterText, filter === 'inactive' && styles.filterTextActive]}>
            Inactivos ({products.filter(p => !p.active).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#FF9800',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});