// src/modules/provider/screens/ProviderDashboardScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import StatisticsCard from '../components/StatisticsCard';
import { useProviderAuth } from '../context/ProviderAuthContext';
import { productManagementService } from '../services/productManagement';
import { providerAuthService } from '../services/providerAuth';

export default function ProviderDashboardScreen({ navigation }) {
  const { provider, providerProfile } = useProviderAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    pendingOrders: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const result = await productManagementService.getProviderProducts(provider.uid);
      
      if (result.success) {
        setProducts(result.products);
        setStats({
          totalProducts: result.products.length,
          activeProducts: result.products.filter(p => p.active).length,
          totalSales: providerProfile?.totalSales || 0,
          pendingOrders: 0 // TODO: Implementar cuando esté el sistema de órdenes
        });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await providerAuthService.logout();
          }
        }
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.businessName}>{providerProfile?.businessName}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.statsGrid}>
          <StatisticsCard
            icon="cube-outline"
            title="Productos"
            value={stats.totalProducts}
            color="#4CAF50"
          />
          <StatisticsCard
            icon="checkmark-circle-outline"
            title="Activos"
            value={stats.activeProducts}
            color="#2196F3"
          />
          <StatisticsCard
            icon="trending-up-outline"
            title="Ventas"
            value={`S/ ${stats.totalSales}`}
            color="#FF9800"
          />
          <StatisticsCard
            icon="time-outline"
            title="Pendientes"
            value={stats.pendingOrders}
            color="#9C27B0"
          />
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle" size={32} color="#4CAF50" />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Agregar Producto</Text>
            <Text style={styles.actionSubtitle}>Publica un nuevo producto</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ProductList')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="list" size={32} color="#2196F3" />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Mis Productos</Text>
            <Text style={styles.actionSubtitle}>
              Gestiona tu catálogo ({stats.totalProducts})
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('OrdersManagement')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="receipt" size={32} color="#FF9800" />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Pedidos</Text>
            <Text style={styles.actionSubtitle}>
              Ver y gestionar pedidos
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ProviderProfile')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="person" size={32} color="#9C27B0" />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Mi Perfil</Text>
            <Text style={styles.actionSubtitle}>Editar información</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Productos recientes */}
      {products.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Últimos productos agregados</Text>
          {products.slice(0, 3).map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>S/ {product.price}</Text>
              </View>
              <View style={styles.productBadge}>
                <Text style={styles.productStock}>Stock: {product.stock}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  recentContainer: {
    padding: 20,
  },
  productItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  productBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  productStock: {
    fontSize: 12,
    color: '#666',
  },
});