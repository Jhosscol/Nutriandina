// src/modules/provider/components/OrderItem.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderItem({ order, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'En proceso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = (newStatus) => {
    Alert.alert(
      'Cambiar estado',
      `¿Cambiar el estado a "${getStatusText(newStatus)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => onUpdateStatus(newStatus)
        }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>Orden #{order.id.slice(-6)}</Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          {/* Información del cliente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={styles.text}>{order.customerName || 'No especificado'}</Text>
            <Text style={styles.text}>{order.customerEmail || ''}</Text>
          </View>

          {/* Items de la orden */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Productos</Text>
            {order.items && order.items.map((item, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                  {item.quantity} x S/ {item.price.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>S/ {order.total.toFixed(2)}</Text>
          </View>

          {/* Acciones de cambio de estado */}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>Cambiar estado:</Text>
              <View style={styles.actionButtons}>
                {order.status === 'pending' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                    onPress={() => handleStatusChange('processing')}
                  >
                    <Ionicons name="time" size={18} color="white" />
                    <Text style={styles.actionButtonText}>En proceso</Text>
                  </TouchableOpacity>
                )}

                {order.status === 'processing' && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={() => handleStatusChange('completed')}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="white" />
                    <Text style={styles.actionButtonText}>Completar</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#f44336' }]}
                  onPress={() => handleStatusChange('cancelled')}
                >
                  <Ionicons name="close-circle" size={18} color="white" />
                  <Text style={styles.actionButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  headerLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionsContainer: {
    marginTop: 10,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
});