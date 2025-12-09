// src/modules/provider/screens/AddProductScreen.js
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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
import { productManagementService } from '../services/productManagement';

export default function AddProductScreen({ navigation }) {
  const { provider, providerProfile } = useProviderAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Granos',
    stock: '',
    unit: 'kg',
    origin: '',
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fats: ''
    }
  });

  const categories = productManagementService.getCategories();
  const units = productManagementService.getUnits();

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNutritionalInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      nutritionalInfo: { ...prev.nutritionalInfo, [field]: value }
    }));
  };

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Límite alcanzado', 'Máximo 5 imágenes por producto');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesitan permisos para acceder a las fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const { name, description, price, stock } = formData;

    if (!name || !description || !price || !stock) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return false;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Agrega al menos una imagen del producto');
      return false;
    }

    if (parseFloat(price) <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return false;
    }

    if (parseInt(stock) < 0) {
      Alert.alert('Error', 'El stock no puede ser negativo');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Crear producto en Firestore
      const productResult = await productManagementService.createProduct(
        provider.uid,
        providerProfile.businessName,
        formData
      );

      if (!productResult.success) {
        throw new Error(productResult.error);
      }

      // 2. Subir imágenes
      const imagesResult = await productManagementService.uploadProductImages(
        productResult.productId,
        images
      );

      if (!imagesResult.success) {
        throw new Error('Error al subir imágenes');
      }

      // 3. Actualizar producto con URLs de imágenes
      await productManagementService.updateProduct(productResult.productId, {
        images: imagesResult.urls
      });

      Alert.alert(
        'Producto agregado',
        '¡Tu producto se publicó exitosamente!',
        [
          {
            text: 'Ver productos',
            onPress: () => navigation.navigate('ProductList')
          },
          {
            text: 'Agregar otro',
            onPress: () => {
              setFormData({
                name: '',
                description: '',
                price: '',
                category: 'Granos',
                stock: '',
                unit: 'kg',
                origin: '',
                nutritionalInfo: {
                  calories: '',
                  protein: '',
                  carbs: '',
                  fats: ''
                }
              });
              setImages([]);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el producto');
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Producto</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Imágenes */}
        <View style={styles.section}>
          <Text style={styles.label}>Imágenes del producto *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#f44336" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <Ionicons name="camera" size={32} color="#999" />
                <Text style={styles.addImageText}>Agregar</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <Text style={styles.label}>Nombre del producto *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Quinoa orgánica"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
          />

          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe tu producto..."
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            multiline
            numberOfLines={4}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Precio (S/) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.price}
                onChangeText={(value) => updateFormData('price', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.stock}
                onChangeText={(value) => updateFormData('stock', value)}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Categoría *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => updateFormData('category', value)}
                >
                  {categories.map((cat, index) => (
                    <Picker.Item key={index} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Unidad *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.unit}
                  onValueChange={(value) => updateFormData('unit', value)}
                >
                  {units.map((unit, index) => (
                    <Picker.Item key={index} label={unit} value={unit} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Origen</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Cusco, Perú"
            value={formData.origin}
            onChangeText={(value) => updateFormData('origin', value)}
          />
        </View>

        {/* Información nutricional (opcional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Nutricional (por 100g)</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Calorías (kcal)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.nutritionalInfo.calories}
                onChangeText={(value) => updateNutritionalInfo('calories', value)}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Proteínas (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.nutritionalInfo.protein}
                onChangeText={(value) => updateNutritionalInfo('protein', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Carbohidratos (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.nutritionalInfo.carbs}
                onChangeText={(value) => updateNutritionalInfo('carbs', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Grasas (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.nutritionalInfo.fats}
                onChangeText={(value) => updateNutritionalInfo('fats', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Publicar Producto</Text>
          )}
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
  section: {
    padding: 20,
    backgroundColor: 'white',
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
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    margin: 20,
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