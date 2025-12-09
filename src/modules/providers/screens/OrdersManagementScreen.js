// src/modules/provider/screens/OrdersManagementScreen.js
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
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
import { db } from '../../../config/firebase';
import OrderItem from '../components/OrderItem';
import { useProviderAuth } from '../context/ProviderAuthContext';

export default function OrdersManagementScreen({ navigation }) {
  const { provider } = useProviderAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, processing, completed, cancelled

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, orders]);

  const loadOrders = async () => {
    setLoading(true);
    
    try {
      // Obtener órdenes donde el proveedor tiene productos
      const ordersQuery = query(
        collection(db, 'orders'),
        where('providerId', '==', provider.uid)
      );

      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = [];

      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Ordenar por fecha más reciente
      ordersData.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setOrders(ordersData);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      Alert.alert('Error', 'No se pudieron cargar las órdenes');
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === filter));
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });

      await loadOrders();
      Alert.alert('Éxito', 'Estado de la orden actualizado');
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const counts = getStatusCounts();

  const renderOrder = ({ item }) => (
    <OrderItem
      order={item}
      onUpdateStatus={(newStatus) => handleUpdateStatus(item.id, newStatus)}
    />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No hay órdenes</Text>
      <Text style={styles.emptySubtitle}>
        Aquí aparecerán las órdenes de tus productos
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todos ({counts.all})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pendientes ({counts.pending})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'processing' && styles.filterButtonActive]}
          onPress={() => setFilter('processing')}
        >
          <Text style={[styles.filterText, filter === 'processing' && styles.filterTextActive]}>
            En proceso ({counts.processing})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completadas ({counts.completed})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de órdenes */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
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
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: '#FF9800',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 15,
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});