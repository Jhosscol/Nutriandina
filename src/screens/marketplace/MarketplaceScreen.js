import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../config/theme';

const { width } = Dimensions.get('window');

const MarketplaceScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'Todos', icon: 'grid' },
    { id: 'grains', name: 'Granos', icon: 'barley' },
    { id: 'seeds', name: 'Semillas', icon: 'seed' },
    { id: 'roots', name: 'Raíces', icon: 'sprout' },
    { id: 'organic', name: 'Orgánico', icon: 'leaf' },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Quinua Blanca Premium',
      description: 'Quinua orgánica de Puno',
      price: 18.50,
      unit: 'kg',
      image: '🌾',
      rating: 4.8,
      reviews: 156,
      discount: 15,
      seller: 'Asociación Quinua Real',
      origin: 'Puno, Perú',
      stock: 50,
    },
    {
      id: 2,
      name: 'Kiwicha Orgánica',
      description: 'Rica en proteínas y calcio',
      price: 22.00,
      unit: 'kg',
      image: '🌱',
      rating: 4.9,
      reviews: 89,
      discount: 0,
      seller: 'Granja Los Andes',
      origin: 'Cusco, Perú',
      stock: 30,
    },
    {
      id: 3,
      name: 'Tarwi Seco',
      description: 'Alto contenido de proteína',
      price: 16.00,
      unit: 'kg',
      image: '🫘',
      rating: 4.7,
      reviews: 67,
      discount: 10,
      seller: 'Campo Verde',
      origin: 'Ayacucho, Perú',
      stock: 40,
    },
    {
      id: 4,
      name: 'Maca en Polvo',
      description: 'Energizante natural',
      price: 35.00,
      unit: '500g',
      image: '🥔',
      rating: 5.0,
      reviews: 234,
      discount: 20,
      seller: 'Andes Naturales',
      origin: 'Junín, Perú',
      stock: 100,
    },
    {
      id: 5,
      name: 'Cañihua Negra',
      description: 'Superalimento andino',
      price: 20.00,
      unit: 'kg',
      image: '⚫',
      rating: 4.6,
      reviews: 45,
      discount: 0,
      seller: 'Granja Kollana',
      origin: 'Puno, Perú',
      stock: 25,
    },
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
    // Aquí puedes agregar una notificación
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <Text style={styles.headerSubtitle}>Productos frescos de los Andes</Text>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Icon name="cart" size={24} color={colors.text} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos andinos..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCategories = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesScroll}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Icon
            name={category.icon}
            size={18}
            color={
              selectedCategory === category.id ? colors.surface : colors.primary
            }
          />
          <Text
            style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.categoryChipTextActive,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBanner = () => (
    <View style={styles.banner}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>🎉 Envío Gratis</Text>
        <Text style={styles.bannerText}>
          En compras mayores a S/ 50
        </Text>
      </View>
      <Icon name="truck-fast" size={32} color={colors.accent} />
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderCategories()}
        {renderBanner()}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos Destacados</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </View>

        {/* Trust Badges */}
        <View style={styles.trustSection}>
          <TrustBadge
            icon="shield-check"
            title="Pago Seguro"
            description="Protegemos tus datos"
          />
          <TrustBadge
            icon="truck-delivery"
            title="Envío Rápido"
            description="2-3 días hábiles"
          />
          <TrustBadge
            icon="certificate"
            title="100% Orgánico"
            description="Productos certificados"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const ProductCard = ({ product, onAddToCart }) => {
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Text style={styles.productImage}>{product.image}</Text>
        {product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <View style={styles.productTitleContainer}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
          </View>
        </View>

        <View style={styles.productMeta}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={colors.accent} />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewsText}>({product.reviews})</Text>
          </View>
          <View style={styles.originBadge}>
            <Icon name="map-marker" size={12} color={colors.textSecondary} />
            <Text style={styles.originText}>{product.origin}</Text>
          </View>
        </View>

        <View style={styles.sellerContainer}>
          <Icon name="store" size={14} color={colors.textSecondary} />
          <Text style={styles.sellerText}>{product.seller}</Text>
        </View>

        <View style={styles.productFooter}>
          <View style={styles.priceContainer}>
            {product.discount > 0 && (
              <Text style={styles.originalPrice}>
                S/ {product.price.toFixed(2)}
              </Text>
            )}
            <Text style={styles.price}>
              S/ {discountedPrice.toFixed(2)}
              <Text style={styles.unit}> /{product.unit}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddToCart(product)}
          >
            <Icon name="cart-plus" size={20} color={colors.surface} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>

        {product.stock < 20 && (
          <View style={styles.stockWarning}>
            <Icon name="alert-circle" size={14} color={colors.warning} />
            <Text style={styles.stockWarningText}>
              ¡Solo quedan {product.stock} unidades!
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const TrustBadge = ({ icon, title, description }) => (
  <View style={styles.trustBadge}>
    <Icon name={icon} size={32} color={colors.primary} />
    <Text style={styles.trustTitle}>{title}</Text>
    <Text style={styles.trustDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
  },
  headerSubtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    ...typography.small,
    color: colors.surface,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    marginLeft: spacing.sm,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: colors.surface,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.h3,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  bannerText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
  },
  seeAll: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 120,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  productImage: {
    fontSize: 64,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    ...typography.small,
    color: colors.surface,
    fontWeight: '600',
  },
  productInfo: {
    padding: spacing.md,
  },
  productHeader: {
    marginBottom: spacing.sm,
  },
  productTitleContainer: {
    flex: 1,
  },
  productName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  productDescription: {
    ...typography.caption,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewsText: {
    ...typography.small,
    marginLeft: 4,
  },
  originBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  originText: {
    ...typography.small,
    marginLeft: 4,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sellerText: {
    ...typography.caption,
    marginLeft: spacing.xs,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    ...typography.caption,
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
  },
  unit: {
    ...typography.caption,
    fontWeight: 'normal',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  stockWarningText: {
    ...typography.small,
    color: colors.warning,
    marginLeft: spacing.xs,
  },
  trustSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  trustBadge: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  trustTitle: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  trustDescription: {
    ...typography.small,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default MarketplaceScreen;