import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserTypeSelectionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/logo.jpg')} // Tu logo
          style={styles.logo}
        />
        <Text style={styles.title}>Bienvenido a NutriAndina</Text>
        <Text style={styles.subtitle}>¿Cómo deseas continuar?</Text>
      </View>

      <View style={styles.optionsContainer}>
        {/* Opción Usuario Consumidor */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ConsumerAuth')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={50} color="#4CAF50" />
          </View>
          <Text style={styles.cardTitle}>Soy Usuario</Text>
          <Text style={styles.cardDescription}>
            Quiero mejorar mi salud con planes nutricionales personalizados
          </Text>
          <View style={styles.features}>
            <Text style={styles.feature}>✓ Planes nutricionales</Text>
            <Text style={styles.feature}>✓ Recetas andinas</Text>
            <Text style={styles.feature}>✓ Comprar productos</Text>
          </View>
        </TouchableOpacity>

        {/* Opción Proveedor */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ProviderAuth')}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="storefront" size={50} color="#FF9800" />
          </View>
          <Text style={styles.cardTitle}>Soy Proveedor</Text>
          <Text style={styles.cardDescription}>
            Quiero vender mis productos andinos en el marketplace
          </Text>
          <View style={styles.features}>
            <Text style={styles.feature}>✓ Vender productos</Text>
            <Text style={styles.feature}>✓ Gestionar inventario</Text>
            <Text style={styles.feature}>✓ Ver estadísticas</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  features: {
    marginTop: 10,
  },
  feature: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
});