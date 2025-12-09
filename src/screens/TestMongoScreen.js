// src/screens/TestMongoScreen.js
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import {
    actualizarItem,
    crearItem,
    eliminarItem,
    obtenerItems
} from '../services/mongodb';

export default function TestMongoScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    cargarItems();
  }, []);

  const cargarItems = async () => {
    try {
      setLoading(true);
      const data = await obtenerItems();
      setItems(data);
      console.log('✅ Items cargados:', data.length);
    } catch (error) {
      console.error('Error cargando:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const agregarItem = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    try {
      const resultado = await crearItem({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || 'Sin descripción',
        activo: true
      });
      
      console.log('✅ Item creado:', resultado.id);
      setNombre('');
      setDescripcion('');
      Alert.alert('✅ Éxito', 'Item creado correctamente');
      cargarItems();
    } catch (error) {
      console.error('Error creando:', error);
      Alert.alert('❌ Error', error.message);
    }
  };

  const editarItem = async (id, nombreActual) => {
    Alert.prompt(
      'Editar Item',
      'Nuevo nombre:',
      async (nuevoNombre) => {
        if (nuevoNombre && nuevoNombre.trim()) {
          try {
            await actualizarItem(id, {
              nombre: nuevoNombre.trim()
            });
            Alert.alert('✅', 'Item actualizado');
            cargarItems();
          } catch (error) {
            Alert.alert('❌ Error', error.message);
          }
        }
      },
      'plain-text',
      nombreActual
    );
  };

  const borrarItem = async (id) => {
    Alert.alert(
      'Confirmar',
      '¿Eliminar este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarItem(id);
              Alert.alert('✅', 'Item eliminado');
              cargarItems();
            } catch (error) {
              Alert.alert('❌ Error', error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🍃 MongoDB Test</Text>
      <Text style={styles.subtitle}>Backend: Firebase Auth + MongoDB</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del item"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
        />
        <Button title="➕ Agregar Item" onPress={agregarItem} />
      </View>

      <View style={styles.header}>
        <Text style={styles.count}>Total: {items.length} items</Text>
        <Button title="🔄 Recargar" onPress={cargarItems} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNombre}>{item.nombre}</Text>
                <Text style={styles.itemDesc}>{item.descripcion}</Text>
                <Text style={styles.itemFecha}>
                  {new Date(item.createdAt).toLocaleString('es-PE')}
                </Text>
              </View>
              <View style={styles.buttons}>
                <Button 
                  title="✏️" 
                  onPress={() => editarItem(item._id.toString(), item.nombre)}
                />
                <Button 
                  title="🗑️" 
                  color="red"
                  onPress={() => borrarItem(item._id.toString())}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No hay items aún{'\n'}Presiona + para agregar uno
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  form: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  count: {
    fontSize: 16,
    color: '#666',
  },
  loading: {
    marginTop: 50,
  },
  item: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  itemDesc: {
    color: '#666',
    marginBottom: 5,
  },
  itemFecha: {
    fontSize: 12,
    color: '#999',
  },
  buttons: {
    flexDirection: 'row',
    gap: 5,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
    lineHeight: 24,
  },
});