import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

const API_URL = 'http://192.168.1.8:3000/api'; // Cambiar según tu config

export default function CitasScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('mis-citas'); // mis-citas, nutricionistas
  const [appointments, setAppointments] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedNutritionist, setSelectedNutritionist] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (activeTab === 'mis-citas') {
        await loadAppointments(token);
      } else {
        await loadNutritionists(token);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudo cargar la información');
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async (token) => {
    const response = await fetch(`${API_URL}/appointments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setAppointments(data);
  };

  const loadNutritionists = async (token) => {
    const response = await fetch(`${API_URL}/appointments/nutritionists`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setNutritionists(data);
  };

  const loadAvailability = async (nutritionistId, date) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${API_URL}/appointments/nutritionists/${nutritionistId}/availability?date=${date}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setAvailableTimes(data.availableTimes || []);
    } catch (error) {
      console.error('Error loading availability:', error);
      Alert.alert('Error', 'No se pudo cargar los horarios disponibles');
    }
  };

  const handleCreateAppointment = async () => {
    if (!selectedDate || !selectedTime || !reason.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nutritionistId: selectedNutritionist._id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          reason,
          notes
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Cita agendada correctamente');
        setShowNewAppointmentModal(false);
        resetForm();
        setActiveTab('mis-citas');
        loadAppointments(token);
      } else {
        Alert.alert('Error', data.message || 'No se pudo agendar la cita');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      Alert.alert('Error', 'Hubo un problema al agendar la cita');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    Alert.alert(
      'Cancelar Cita',
      '¿Estás seguro de que deseas cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (response.ok) {
                Alert.alert('Éxito', 'Cita cancelada');
                loadAppointments(token);
              } else {
                Alert.alert('Error', 'No se pudo cancelar la cita');
              }
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'Hubo un problema');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setSelectedNutritionist(null);
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    setNotes('');
    setAvailableTimes([]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderAppointmentItem = ({ item }) => {
    const date = new Date(item.appointmentDate);
    const dateStr = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const getStatusColor = (status) => {
      switch (status) {
        case 'scheduled': return '#4CAF50';
        case 'confirmed': return '#2196F3';
        case 'completed': return '#9E9E9E';
        case 'cancelled': return '#F44336';
        default: return '#9E9E9E';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'scheduled': return 'Programada';
        case 'confirmed': return 'Confirmada';
        case 'completed': return 'Completada';
        case 'cancelled': return 'Cancelada';
        default: return status;
      }
    };

    return (
      <View style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.appointmentInfo}>
            <Text style={styles.nutritionistName}>{item.nutritionistName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.detailText}>{dateStr}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color="#666" />
            <Text style={styles.detailText}>{timeStr}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={18} color="#666" />
            <Text style={styles.detailText}>{item.reason}</Text>
          </View>
        </View>

        {item.status === 'scheduled' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item._id)}
          >
            <Text style={styles.cancelButtonText}>Cancelar cita</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderNutritionistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.nutritionistCard}
      onPress={() => {
        setSelectedNutritionist(item);
        setShowNewAppointmentModal(true);
      }}
    >
      <View style={styles.nutritionistHeader}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={30} color="#fff" />
        </View>
        <View style={styles.nutritionistInfo}>
          <Text style={styles.nutritionistName}>{item.name}</Text>
          <Text style={styles.specialization}>{item.specialization}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.consultations}>
              • {item.totalConsultations} consultas
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>

      <View style={styles.nutritionistFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>S/ {item.consultationPrice}</Text>
          <Text style={styles.priceLabel}>por consulta</Text>
        </View>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Agendar</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Citas</Text>
        <Text style={styles.headerSubtitle}>Agenda tu consulta nutricional</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mis-citas' && styles.activeTab]}
          onPress={() => setActiveTab('mis-citas')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={activeTab === 'mis-citas' ? '#4CAF50' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'mis-citas' && styles.activeTabText]}>
            Mis Citas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'nutricionistas' && styles.activeTab]}
          onPress={() => setActiveTab('nutricionistas')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'nutricionistas' ? '#4CAF50' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'nutricionistas' && styles.activeTabText]}>
            Nutricionistas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={activeTab === 'mis-citas' ? appointments : nutritionists}
          renderItem={activeTab === 'mis-citas' ? renderAppointmentItem : renderNutritionistItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={activeTab === 'mis-citas' ? 'calendar-outline' : 'people-outline'}
                size={64}
                color="#ddd"
              />
              <Text style={styles.emptyText}>
                {activeTab === 'mis-citas'
                  ? 'No tienes citas programadas'
                  : 'No hay nutricionistas disponibles'}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de Nueva Cita */}
      <Modal
        visible={showNewAppointmentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowNewAppointmentModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agendar Cita</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowNewAppointmentModal(false);
                  resetForm();
                }}
              >
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedNutritionist && (
                <View style={styles.selectedNutritionist}>
                  <Text style={styles.label}>Nutricionista:</Text>
                  <Text style={styles.nutritionistNameModal}>
                    {selectedNutritionist.name}
                  </Text>
                  <Text style={styles.specializationModal}>
                    {selectedNutritionist.specialization}
                  </Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Fecha *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={selectedDate}
                  onChangeText={(text) => {
                    setSelectedDate(text);
                    if (text.length === 10 && selectedNutritionist) {
                      loadAvailability(selectedNutritionist._id, text);
                    }
                  }}
                />
              </View>

              {availableTimes.length > 0 && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Horarios Disponibles *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.timeSlots}>
                      {availableTimes.map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={[
                            styles.timeSlot,
                            selectedTime === time && styles.timeSlotSelected
                          ]}
                          onPress={() => setSelectedTime(time)}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              selectedTime === time && styles.timeSlotTextSelected
                            ]}
                          >
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Motivo de la consulta *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Consulta nutricional"
                  value={reason}
                  onChangeText={setReason}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas adicionales</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Información adicional..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleCreateAppointment}>
                <Text style={styles.submitButtonText}>Confirmar Cita</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50'
  },
  tabText: {
    fontSize: 16,
    color: '#999'
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    padding: 15,
    paddingBottom: 30
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999'
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  appointmentInfo: {
    flex: 1
  },
  nutritionistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  appointmentDetails: {
    gap: 8
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  detailText: {
    fontSize: 14,
    color: '#666'
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600'
  },
  nutritionistCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  nutritionistHeader: {
    flexDirection: 'row',
    marginBottom: 12
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  nutritionistInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  specialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  consultations: {
    fontSize: 12,
    color: '#999'
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  nutritionistFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  priceLabel: {
    fontSize: 12,
    color: '#999'
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 5
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  modalBody: {
    padding: 20
  },
  selectedNutritionist: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  nutritionistNameModal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 5
  },
  specializationModal: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  timeSlots: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 5
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  timeSlotSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50'
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666'
  },
  timeSlotTextSelected: {
    color: '#fff',
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});