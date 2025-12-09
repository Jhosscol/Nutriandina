// src/modules/marketplace/screens/CheckoutScreen.js
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../user-management/context/AuthContext';
import { ordersService } from '../services/orders';

export default function CheckoutScreen({ route, navigation }) {
  const { cartItems } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: user?.email || '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      district: '',
      city: 'Lima',
      reference: ''
    },
    paymentMethod: 'card'
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field, value) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [field]: value }
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShippingCost = () => {
    return ordersService.calculateShippingCost(
      calculateSubtotal(),
      formData.shippingAddress.city
    );
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    return ordersService.calculateDiscount(calculateSubtotal(), appliedCoupon);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShippingCost();
    const discount = calculateDiscount();
    return subtotal + shipping - discount;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Ingresa un código de cupón');
      return;
    }

    setLoading(true);
    const result = await ordersService.applyCoupon(couponCode);
    setLoading(false);

    if (result.success) {
      setAppliedCoupon(result.coupon);
      Alert.alert('¡Cupón aplicado!', `Descuento aplicado correctamente`);
      setCouponCode('');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    Alert.alert('Cupón removido', 'El descuento ha sido eliminado');
  };

  const validateForm = () => {
    const { customerName, customerPhone, shippingAddress } = formData;

    if (!customerName || !customerPhone) {
      Alert.alert('Error', 'Por favor completa tu nombre y teléfono');
      return false;
    }

    if (!shippingAddress.street || !shippingAddress.district) {
      Alert.alert('Error', 'Por favor completa la dirección de envío');
      return false;
    }

    const phoneRegex = /^[0-9]{9}$/;
    if (!phoneRegex.test(customerPhone)) {
      Alert.alert('Error', 'Ingresa un teléfono válido (9 dígitos)');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);

    const orderData = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      shippingAddress: formData.shippingAddress,
      items: cartItems,
      subtotal: calculateSubtotal(),
      shippingCost: calculateShippingCost(),
      discount: calculateDiscount(),
      total: calculateTotal(),
      paymentMethod: formData.paymentMethod,
      couponCode: appliedCoupon?.code || ''
    };

    const result = await ordersService.createOrder(user.uid, orderData);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        '¡Pedido realizado!',
        'Tu pedido ha sido creado exitosamente',
        [
          {
            text: 'Ver pedido',
            onPress: () => {
              // TODO: Navegar a pantalla de órdenes
              navigation.navigate('Profile');
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Información de contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>

          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            value={formData.customerName}
            onChangeText={(value) => updateFormData('customerName', value)}
          />

          <Text style={styles.label}>Correo electrónico *</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            value={formData.customerEmail}
            onChangeText={(value) => updateFormData('customerEmail', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Teléfono *</Text>
          <TextInput
            style={styles.input}
            placeholder="987654321"
            value={formData.customerPhone}
            onChangeText={(value) => updateFormData('customerPhone', value)}
            keyboardType="phone-pad"
            maxLength={9}
          />
        </View>

        {/* Dirección de envío */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dirección de Envío</Text>

          <Text style={styles.label}>Dirección *</Text>
          <TextInput
            style={styles.input}
            placeholder="Calle y número"
            value={formData.shippingAddress.street}
            onChangeText={(value) => updateAddress('street', value)}
          />

          <Text style={styles.label}>Distrito *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Miraflores"
            value={formData.shippingAddress.district}
            onChangeText={(value) => updateAddress('district', value)}
          />

          <Text style={styles.label}>Ciudad *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.shippingAddress.city}
              onValueChange={(value) => updateAddress('city', value)}
            >
              <Picker.Item label="Lima" value="Lima" />
              <Picker.Item label="Callao" value="Callao" />
              <Picker.Item label="Provincia" value="Provincia" />
            </Picker>
          </View>

          <Text style={styles.label}>Referencia</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Casa azul, al lado del parque"
            value={formData.shippingAddress.reference}
            onChangeText={(value) => updateAddress('reference', value)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Método de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'card' && styles.paymentOptionActive
            ]}
            onPress={() => updateFormData('paymentMethod', 'card')}
          >
            <Ionicons name="card" size={24} color="#4CAF50" />
            <Text style={styles.paymentText}>Tarjeta de crédito/débito</Text>
            {formData.paymentMethod === 'card' && (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              formData.paymentMethod === 'cash' && styles.paymentOptionActive
            ]}
            onPress={() => updateFormData('paymentMethod', 'cash')}
          >
            <Ionicons name="cash" size={24} color="#4CAF50" />
            <Text style={styles.paymentText}>Pago contra entrega</Text>
            {formData.paymentMethod === 'cash' && (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        </View>

        {/* Cupón de descuento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cupón de Descuento</Text>

          {!appliedCoupon ? (
            <View style={styles.couponContainer}>
              <TextInput
                style={[styles.input, styles.couponInput]}
                placeholder="Código de cupón"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyCouponButton}
                onPress={handleApplyCoupon}
                disabled={loading}
              >
                <Text style={styles.applyCouponText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.appliedCouponContainer}>
              <View style={styles.appliedCouponInfo}>
                <Ionicons name="pricetag" size={20} color="#4CAF50" />
                <Text style={styles.appliedCouponCode}>
                  {appliedCoupon.code}
                </Text>
                <Text style={styles.appliedCouponValue}>
                  {appliedCoupon.type === 'percentage'
                    ? `-${appliedCoupon.value}%`
                    : `-S/ ${appliedCoupon.value}`}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Ionicons name="close-circle" size={24} color="#f44336" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Resumen del pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              S/ {calculateSubtotal().toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío:</Text>
            <Text style={styles.summaryValue}>
              S/ {calculateShippingCost().toFixed(2)}
            </Text>
          </View>

          {appliedCoupon && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>
                Descuento:
              </Text>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                -S/ {calculateDiscount().toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              S/ {calculateTotal().toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Realizar Pedido</Text>
              <Text style={styles.placeOrderTotal}>
                S/ {calculateTotal().toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  paymentOptionActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  paymentText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 15,
  },
  couponContainer: {
    flexDirection: 'row',
  },
  couponInput: {
    flex: 1,
    marginRight: 10,
  },
  applyCouponButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
  },
  applyCouponText: {
    color: 'white',
    fontWeight: '600',
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedCouponCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  appliedCouponValue: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 10,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeOrderTotal: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});