// src/modules/provider/components/ProductCard.js
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProductCard({ product, onToggleStatus, onEdit }) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {product.images && product.images.length > 0 ? (
          <Image
            source={{ uri: product.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        {/* Badge de estado */}
        <View style={[styles.statusBadge, product.active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>
            {product.active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.category}>{product.category}</Text>
          </View>
          
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="pricetag" size={16} color="#4CAF50" />
            <Text style={styles.price}>S/ {product.price.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cube" size={16} color="#666" />
            <Text style={styles.stock}>
              Stock: {product.stock} {product.unit}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.toggleButton, product.active ? styles.deactivateButton : styles.activateButton]}
          onPress={onToggleStatus}
        >
          <Ionicons
            name={product.active ? 'eye-off' : 'eye'}
            size={18}
            color="white"
          />
          <Text style={styles.toggleButtonText}>
            {product.active ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveBadge: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  category: {
    fontSize: 13,
    color: '#666',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 5,
  },
  stock: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  deactivateButton: {
    backgroundColor: '#757575',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
});