// src/modules/marketplace/screens/ProductDetailScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { cloudinaryService } from '../../../services/cloudinaryService';
import { cartService } from '../services/cart';
import { marketplaceProductsService } from '../services/products';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inCart, setInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  useEffect(() => {
    loadProduct();
    checkIfInCart();
  }, [productId]);

  // Recargar estado del carrito cuando volvemos a esta pantalla
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkIfInCart();
    });

    return unsubscribe;
  }, [navigation, productId]);

  const loadProduct = async () => {
    setLoading(true);

    const productResult = await marketplaceProductsService.getProductById(productId);
    
    if (productResult.success) {
      setProduct(productResult.product);

      const relatedResult = await marketplaceProductsService.getRecommendedProducts(
        productResult.product.category,
        productId
      );

      if (relatedResult.success) {
        setRelatedProducts(relatedResult.products);
      }
    } else {
      Alert.alert('Error', 'No se pudo cargar el producto');
      navigation.goBack();
    }

    setLoading(false);
  };

  const checkIfInCart = async () => {
    const isInCart = await cartService.isInCart(productId);
    setInCart(isInCart);
    
    if (isInCart) {
      const qty = await cartService.getProductQuantity(productId);
      setCartQuantity(qty);
      // Si está en el carrito, mostramos la cantidad actual del carrito
      setQuantity(qty);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (quantity > product.stock) {
      Alert.alert('Error', 'No hay suficiente stock disponible');
      return;
    }

    if (inCart) {
      // Si ya está en el carrito, actualizamos la cantidad
      const result = await cartService.updateQuantity(productId, quantity);
      
      if (result.success) {
        setCartQuantity(quantity);
        Alert.alert(
          'Carrito actualizado',
          `Cantidad actualizada: ${quantity} ${product.unit} de ${product.name}`,
          [
            { text: 'Seguir comprando', style: 'cancel' },
            {
              text: 'Ver carrito',
              onPress: () => navigation.navigate('Cart')
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo actualizar el carrito');
      }
    } else {
      // Si no está en el carrito, lo agregamos
      const result = await cartService.addToCart(product, quantity);
      
      if (result.success) {
        setInCart(true);
        setCartQuantity(quantity);
        Alert.alert(
          'Agregado al carrito',
          `${quantity} ${product.unit} de ${product.name}`,
          [
            { text: 'Seguir comprando', style: 'cancel' },
            {
              text: 'Ver carrito',
              onPress: () => navigation.navigate('Cart')
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudo agregar al carrito');
      }
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert('Stock máximo', 'No hay más unidades disponibles');
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <View>
            <Ionicons name="cart-outline" size={24} color="#333" />
            {cartQuantity > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartQuantity}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Imágenes del producto con Cloudinary optimizado */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setSelectedImage(Math.round(x / width));
            }}
            scrollEventThrottle={16}
          >
            {product.images && product.images.length > 0 ? (
              product.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ 
                    uri: cloudinaryService.getProductImageUrl(image, 'large')
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={80} color="#ccc" />
              </View>
            )}
          </ScrollView>

          {/* Indicador de imágenes */}
          {product.images && product.images.length > 1 && (
            <View style={styles.imageIndicator}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === selectedImage && styles.activeDot
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Información del producto */}
        <View style={styles.infoSection}>
          <View style={styles.providerInfo}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ProviderProfileMarketplace', {
                  providerId: product.providerId
                })
              }
            >
              <Text style={styles.providerName}>{product.providerName}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.category}>{product.category}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>S/ {product.price.toFixed(2)}</Text>
            <Text style={styles.unit}>por {product.unit}</Text>
          </View>

          {product.origin && (
            <View style={styles.originContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.originText}>Origen: {product.origin}</Text>
            </View>
          )}

          <View style={styles.stockContainer}>
            <Ionicons
              name={product.stock > 10 ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={product.stock > 10 ? '#4CAF50' : '#FF9800'}
            />
            <Text style={styles.stockText}>
              {product.stock > 0
                ? `${product.stock} ${product.unit} disponibles`
                : 'Sin stock'}
            </Text>
          </View>

          {/* Indicador de que está en el carrito */}
          {inCart && (
            <View style={styles.inCartBanner}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.inCartText}>
                Ya tienes {cartQuantity} {product.unit} en tu carrito
              </Text>
            </View>
          )}

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Información nutricional */}
          {product.nutritionalInfo &&
            Object.values(product.nutritionalInfo).some((v) => v > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Información Nutricional (por 100g)
                </Text>
                <View style={styles.nutritionGrid}>
                  {product.nutritionalInfo.calories > 0 && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Calorías</Text>
                      <Text style={styles.nutritionValue}>
                        {product.nutritionalInfo.calories} kcal
                      </Text>
                    </View>
                  )}
                  {product.nutritionalInfo.protein > 0 && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Proteínas</Text>
                      <Text style={styles.nutritionValue}>
                        {product.nutritionalInfo.protein}g
                      </Text>
                    </View>
                  )}
                  {product.nutritionalInfo.carbs > 0 && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Carbohidratos</Text>
                      <Text style={styles.nutritionValue}>
                        {product.nutritionalInfo.carbs}g
                      </Text>
                    </View>
                  )}
                  {product.nutritionalInfo.fats > 0 && (
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionLabel}>Grasas</Text>
                      <Text style={styles.nutritionValue}>
                        {product.nutritionalInfo.fats}g
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

          {/* Productos relacionados con Cloudinary */}
          {relatedProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>También te puede interesar</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {relatedProducts.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.relatedCard}
                    onPress={() => {
                      navigation.push('ProductDetail', { productId: item.id });
                    }}
                  >
                    {item.images && item.images[0] ? (
                      <Image
                        source={{ 
                          uri: cloudinaryService.getThumbnailUrl(item.images[0], 200)
                        }}
                        style={styles.relatedImage}
                      />
                    ) : (
                      <View style={styles.relatedImagePlaceholder}>
                        <Ionicons name="image-outline" size={30} color="#ccc" />
                      </View>
                    )}
                    <Text style={styles.relatedName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.relatedPrice}>
                      S/ {item.price.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer con cantidad y botón de agregar */}
      <View style={styles.footer}>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Cantidad:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Ionicons 
                name="remove" 
                size={20} 
                color={quantity <= 1 ? '#ccc' : '#333'} 
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={incrementQuantity}
              disabled={quantity >= product.stock}
            >
              <Ionicons 
                name="add" 
                size={20} 
                color={quantity >= product.stock ? '#ccc' : '#333'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            product.stock === 0 && styles.addButtonDisabled
          ]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Ionicons name="cart" size={20} color="white" />
          <Text style={styles.addButtonText}>
            {product.stock === 0 
              ? 'Sin stock' 
              : inCart 
                ? 'Actualizar carrito' 
                : 'Agregar al carrito'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageSection: {
    marginTop: 70,
  },
  productImage: {
    width: width,
    height: 350,
  },
  imagePlaceholder: {
    width: width,
    height: 350,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  infoSection: {
    padding: 20,
  },
  providerInfo: {
    marginBottom: 10,
  },
  providerName: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  unit: {
    fontSize: 16,
    color: '#666',
  },
  originContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  originText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stockText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  inCartBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  inCartText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginRight: '2%',
    marginBottom: 10,
  },
  nutritionLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  relatedCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: 120,
  },
  relatedImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedName: {
    fontSize: 13,
    color: '#333',
    padding: 10,
    height: 45,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  footer: {
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
  },
  quantityButton: {
    padding: 10,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});