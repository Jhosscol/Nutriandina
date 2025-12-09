// src/modules/providers/screens/ProviderProfile.js
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
import { providerAuthService } from '../services/providerAuth';
import { providerProfileService } from '../services/providerProfile';

export default function ProviderProfileScreen({ navigation }) {
  const { provider, providerProfile, refreshProviderProfile } = useProviderAuth();
  
  // ✅ VALIDACIÓN: Si no hay provider, muestra loading
  if (!provider || !provider.uid) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    ownerName: providerProfile?.ownerName || '',
    phone: providerProfile?.phone || '',
    description: providerProfile?.description || '',
  });

  const handleUpdate = async () => {
    setLoading(true);
    
    const result = await providerProfileService.updateProfile(provider.uid, formData);
    
    if (result.success) {
      await refreshProviderProfile();
      setEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } else {
      Alert.alert('Error', result.error);
    }
    
    setLoading(false);
  };

  const handleChangeLogo = async () => {
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
      setLoading(true);
      const uploadResult = await providerProfileService.uploadLogo(
        provider.uid,
        result.assets[0].uri
      );
      
      if (uploadResult.success) {
        await refreshProviderProfile();
        Alert.alert('Éxito', 'Logo actualizado correctamente');
      } else {
        Alert.alert('Error', uploadResult.error);
      }
      
      setLoading(false);
    }
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
            try {
              // ✅ Solo haz logout, el AppNavigator manejará la navegación automáticamente
              await providerAuthService.logout();
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Ionicons 
            name={editing ? "close" : "pencil"} 
            size={24} 
            color="#333" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <TouchableOpacity onPress={handleChangeLogo} disabled={loading}>
            {providerProfile?.logo ? (
              <Image 
                source={{ uri: providerProfile.logo }} 
                style={styles.logo} 
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="business" size={60} color="#ccc" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.businessName}>{providerProfile?.businessName}</Text>
          <Text style={styles.email}>{provider?.email}</Text>
        </View>

        {/* Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Negocio</Text>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Nombre del propietario</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.ownerName}
                onChangeText={(value) => setFormData({...formData, ownerName: value})}
                placeholder="Nombre completo"
              />
            ) : (
              <Text style={styles.value}>{providerProfile?.ownerName}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Teléfono</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => setFormData({...formData, phone: value})}
                placeholder="Teléfono"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{providerProfile?.phone}</Text>
            )}
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.value}>
              {providerProfile?.address?.street}, {providerProfile?.address?.city}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.label}>Descripción</Text>
            {editing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => setFormData({...formData, description: value})}
                placeholder="Descripción del negocio"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.value}>{providerProfile?.description}</Text>
            )}
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="star" size={32} color="#FF9800" />
              <Text style={styles.statValue}>
                {providerProfile?.rating?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>
                {providerProfile?.totalSales || 0}
              </Text>
              <Text style={styles.statLabel}>Ventas Totales</Text>
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        {editing && (
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#f44336" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
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
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF9800',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
  infoItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  logoutButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});