// src/modules/provider/screens/ProviderProfileSetupScreen.js
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useProviderAuth } from '../context/ProviderAuthContext';
import { providerProfileService } from '../services/providerProfile';

export default function ProviderProfileSetupScreen() {
  const { provider, refreshProviderProfile } = useProviderAuth();
  const [loading, setLoading] = useState(false);
  const [logoUri, setLogoUri] = useState(null);

  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      region: '',
      postalCode: ''
    },
    description: ''
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesitan permisos para acceder a las fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    const { ownerName, phone, address, description } = formData;

    if (!ownerName || !phone || !description) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return false;
    }

    if (!address.street || !address.city || !address.region) {
      Alert.alert('Error', 'Por favor completa la dirección completa');
      return false;
    }

    const phoneRegex = /^[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Ingresa un número de teléfono válido (9 dígitos)');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Subir logo si existe
      if (logoUri) {
        const logoResult = await providerProfileService.uploadLogo(
          provider.uid,
          logoUri
        );
        
        if (!logoResult.success) {
          Alert.alert('Error', 'No se pudo subir el logo');
          setLoading(false);
          return;
        }
      }

      // 2. Guardar perfil
      const result = await providerProfileService.completeProfile(
        provider.uid,
        formData
      );

      if (result.success) {
        await refreshProviderProfile();
        Alert.alert(
          'Perfil completado',
          '¡Bienvenido a NutriAndina! Ahora puedes empezar a vender tus productos'
        );
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar el perfil');
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="business" size={60} color="#FF9800" />
        <Text style={styles.title}>Completa tu Perfil</Text>
        <Text style={styles.subtitle}>
          Necesitamos algunos datos para configurar tu tienda
        </Text>
      </View>

      <View style={styles.form}>
        {/* Logo del negocio */}
        <View style={styles.logoSection}>
          <Text style={styles.label}>Logo del negocio</Text>
          <TouchableOpacity style={styles.logoButton} onPress={pickImage}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="camera" size={40} color="#999" />
                <Text style={styles.logoText}>Toca para subir</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Nombre del propietario */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del propietario *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            value={formData.ownerName}
            onChangeText={(value) => updateFormData('ownerName', value)}
          />
        </View>

        {/* Teléfono */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 987654321"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            keyboardType="phone-pad"
            maxLength={9}
          />
        </View>

        {/* Dirección */}
        <Text style={styles.sectionTitle}>Dirección del negocio</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Calle y número *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Av. Los Andes 123"
            value={formData.address.street}
            onChangeText={(value) => updateAddress('street', value)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Ciudad *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Lima"
              value={formData.address.city}
              onChangeText={(value) => updateAddress('city', value)}
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Región *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Lima"
              value={formData.address.region}
              onChangeText={(value) => updateAddress('region', value)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Código postal</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 15001"
            value={formData.address.postalCode}
            onChangeText={(value) => updateAddress('postalCode', value)}
            keyboardType="number-pad"
          />
        </View>

        {/* Descripción */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción del negocio *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Cuéntanos sobre tu negocio, los productos que ofreces, tu historia..."
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.hint}>Mínimo 50 caracteres</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Completar Perfil</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  form: {
    padding: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoButton: {
    marginTop: 10,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});