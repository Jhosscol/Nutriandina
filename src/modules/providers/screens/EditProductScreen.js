// src/modules/provider/screens/EditProductScreen.js
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
import { productManagementService } from '../services/productManagement';

export default function EditProductScreen({ route, navigation }) {
  const { product } = route.params;
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState(product.images || []);
  const [newImages, setNewImages] = useState([]);

  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    price: product.price.toString() || '',
    category: product.category || 'Granos',
    stock: product.stock.toString() || '',
    unit: product.unit || 'kg',
    origin: product.origin || '',
    nutritionalInfo: {
      calories: product.nutritionalInfo?.calories?.toString() || '',
      protein: product.nutritionalInfo?.protein?.toString() || '',
      carbs: product.nutritionalInfo?.carbs?.toString() || '',
      fats: product.nutritionalInfo?.fats?.toString() || ''
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
    if (images.length + newImages.length >= 5) {
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
      setNewImages([...newImages, result.assets[0].uri]);
    }
  };

  const removeExistingImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const { name, description, price, stock } = formData;

    if (!name || !description || !price || !stock) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return false;
    }

    if (images.length + newImages.length === 0) {
      Alert.alert('Error', 'El producto debe tener al menos una imagen');
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
      let finalImages = [...images];

      // Subir nuevas imágenes si existen
      if (newImages.length > 0) {
        const uploadResult = await productManagementService.uploadProductImages(
          product.id,
          newImages
        );

        if (uploadResult.success) {
          finalImages = [...finalImages, ...uploadResult.urls];
        }
      }

      // Actualizar producto
      const updateData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: finalImages,
        nutritionalInfo: {
          calories: formData.nutritionalInfo.calories ? parseFloat(formData.nutritionalInfo.calories) : 0,
          protein: formData.nutritionalInfo.protein ? parseFloat(formData.nutritionalInfo.protein) : 0,
          carbs: formData.nutritionalInfo.carbs ? parseFloat(formData.nutritionalInfo.carbs) : 0,
          fats: formData.nutritionalInfo.fats ? parseFloat(formData.nutritionalInfo.fats) : 0,
        }
      };

      const result = await productManagementService.updateProduct(
        product.id,
        updateData
      );

      if (result.success) {
        Alert.alert(
          'Producto actualizado',
          'Los cambios se guardaron correctamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el producto');
      console.error(error);
    }

    setLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar producto',
      '¿Estás seguro? Esta acción no se puede deshacer',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await productManagementService.deleteProduct(product.id);
            setLoading(false);

            if (result.success) {
              Alert.alert('Producto eliminado', '', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('ProductList')
                }
              ]);
            } else {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Producto</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Imágenes */}
        <View style={styles.section}>
          <Text style={styles.label}>Imágenes del producto *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <View key={`existing-${index}`} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeExistingImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#f44336" />
                </TouchableOpacity>
              </View>
            ))}
            {newImages.map((uri, index) => (
              <View key={`new-${index}`} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeNewImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#f44336" />
                </TouchableOpacity>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NUEVA</Text>
                </View>
              </View>
            ))}
            {images.length + newImages.length < 5 && (
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

        {/* Información nutricional */}
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
            <Text style={styles.submitButtonText}>Guardar Cambios</Text>
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
  newBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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
    backgroundColor: '#2196F3',
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