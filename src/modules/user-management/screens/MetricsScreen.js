// modules/user-management/screens/MetricsScreen.js
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, FAB, Modal, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { HEALTH_METRICS } from '../constants/metrics';
import { useHealthData } from '../context/HealthDataContext';
import { validateBloodPressure, validateGlucose, validateHeight, validateWeight } from '../utils/validation';

export default function MetricsScreen() {
  const { metrics, addMetric, getLatestMetric } = useHealthData();
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [metricValue, setMetricValue] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [glucoseType, setGlucoseType] = useState('fasting');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [latestMetrics, setLatestMetrics] = useState({});

  useEffect(() => {
    loadLatestMetrics();
  }, [metrics]);

  const loadLatestMetrics = async () => {
    const latest = {};
    const metricTypes = ['weight', 'height', 'bmi', 'glucose', 'bloodPressure', 'waist'];
    
    for (const type of metricTypes) {
      const metric = await getLatestMetric(type);
      if (metric) {
        latest[type] = metric;
      }
    }
    
    setLatestMetrics(latest);
  };

  const openAddMetricModal = (metricId) => {
    setSelectedMetric(HEALTH_METRICS[metricId]);
    setMetricValue('');
    setSystolic('');
    setDiastolic('');
    setError('');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMetric(null);
  };

  const validateMetric = () => {
    if (!selectedMetric) return false;

    switch (selectedMetric.id) {
      case 'weight':
        const weightVal = validateWeight(metricValue);
        if (!weightVal.isValid) {
          setError(weightVal.error);
          return false;
        }
        break;

      case 'height':
        const heightVal = validateHeight(metricValue);
        if (!heightVal.isValid) {
          setError(heightVal.error);
          return false;
        }
        break;

      case 'glucose':
        const glucoseVal = validateGlucose(metricValue, glucoseType);
        if (!glucoseVal.isValid) {
          setError(glucoseVal.error);
          return false;
        }
        if (glucoseVal.warning) {
          setError(glucoseVal.warning);
        }
        break;

      case 'bloodPressure':
        const bpVal = validateBloodPressure(systolic, diastolic);
        if (!bpVal.isValid) {
          setError(bpVal.error);
          return false;
        }
        if (bpVal.warning) {
          setError(bpVal.warning);
        }
        break;

      default:
        if (!metricValue || isNaN(parseFloat(metricValue))) {
          setError('Valor inválido');
          return false;
        }
    }

    return true;
  };

  const handleSaveMetric = async () => {
    if (!validateMetric()) return;

    setLoading(true);
    setError('');

    try {
      let value;

      if (selectedMetric.id === 'bloodPressure') {
        value = {
          systolic: parseInt(systolic),
          diastolic: parseInt(diastolic)
        };
      } else if (selectedMetric.id === 'glucose') {
        value = {
          value: parseFloat(metricValue),
          type: glucoseType
        };
      } else {
        value = parseFloat(metricValue);
      }

      const result = await addMetric(selectedMetric.id, value);

      if (result.success) {
        closeModal();
        loadLatestMetrics();
      } else {
        setError(result.error || 'Error al guardar métrica');
      }
    } catch (err) {
      setError('Error inesperado al guardar');
    } finally {
      setLoading(false);
    }
  };

  const formatMetricValue = (metric, value) => {
    if (!value) return '--';

    if (metric.id === 'bloodPressure') {
      return `${value.value?.systolic || value.systolic}/${value.value?.diastolic || value.diastolic} ${metric.unit}`;
    }

    if (metric.id === 'glucose' && value.value) {
      return `${value.value} ${metric.unit}`;
    }

    return `${value.value || value} ${metric.unit}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }

    return date.toLocaleDateString('es-PE', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getMetricStatusColor = (metric, value) => {
    if (!metric.normalRange || !value) return '#666';

    const numValue = typeof value === 'object' ? value.value : value;

    if (metric.id === 'bloodPressure') {
      const sys = value.systolic || value.value?.systolic;
      const dia = value.diastolic || value.value?.diastolic;
      
      if (sys >= metric.normalRange.systolic.min && 
          sys <= metric.normalRange.systolic.max &&
          dia >= metric.normalRange.diastolic.min && 
          dia <= metric.normalRange.diastolic.max) {
        return '#4CAF50';
      }
      return '#F44336';
    }

    if (numValue >= metric.normalRange.min && numValue <= metric.normalRange.max) {
      return '#4CAF50';
    }

    return '#F44336';
  };

  const mainMetrics = ['weight', 'height', 'bmi', 'bloodPressure', 'glucose', 'waist'];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Mis Métricas de Salud
        </Text>

        {mainMetrics.map(metricId => {
          const metric = HEALTH_METRICS[metricId];
          const latest = latestMetrics[metricId];

          return (
            <Card 
              key={metricId} 
              style={styles.metricCard}
              onPress={() => metric.inputType !== 'calculated' && openAddMetricModal(metricId)}
            >
              <Card.Content>
                <View style={styles.metricHeader}>
                  <View style={styles.metricInfo}>
                    <Text variant="titleMedium" style={styles.metricName}>
                      {metric.name}
                    </Text>
                    {latest && (
                      <Text variant="bodySmall" style={styles.metricDate}>
                        {formatDate(latest.timestamp)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.metricValue}>
                    <Text 
                      variant="headlineSmall" 
                      style={[
                        styles.valueText,
                        { color: getMetricStatusColor(metric, latest) }
                      ]}
                    >
                      {formatMetricValue(metric, latest)}
                    </Text>
                  </View>
                </View>

                {metric.normalRange && latest && (
                  <View style={styles.normalRange}>
                    <Text variant="bodySmall" style={styles.rangeText}>
                      Rango normal: {
                        metric.id === 'bloodPressure'
                          ? `${metric.normalRange.systolic.min}-${metric.normalRange.systolic.max}/${metric.normalRange.diastolic.min}-${metric.normalRange.diastolic.max}`
                          : `${metric.normalRange.min}-${metric.normalRange.max}`
                      } {metric.unit}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>

      {/* Modal para agregar métrica */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modal}
        >
          {selectedMetric && (
            <View>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Agregar {selectedMetric.name}
              </Text>

              {selectedMetric.inputType === 'dual' ? (
                // Presión Arterial (dual)
                <View>
                  <TextInput
                    label="Sistólica"
                    value={systolic}
                    onChangeText={setSystolic}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                  <TextInput
                    label="Diastólica"
                    value={diastolic}
                    onChangeText={setDiastolic}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </View>
              ) : selectedMetric.id === 'glucose' ? (
                // Glucosa con tipo
                <View>
                  <SegmentedButtons
                    value={glucoseType}
                    onValueChange={setGlucoseType}
                    buttons={[
                      { value: 'fasting', label: 'Ayunas' },
                      { value: 'postprandial', label: 'Post-comida' },
                      { value: 'random', label: 'Aleatorio' },
                    ]}
                    style={styles.segmentedButtons}
                  />
                  <TextInput
                    label={`Glucosa (${selectedMetric.unit})`}
                    value={metricValue}
                    onChangeText={setMetricValue}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                </View>
              ) : (
                // Input simple
                <TextInput
                  label={`${selectedMetric.name} (${selectedMetric.unit})`}
                  value={metricValue}
                  onChangeText={setMetricValue}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              )}

              {error && (
                <Text variant="bodySmall" style={styles.errorText}>
                  {error}
                </Text>
              )}

              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={closeModal}
                  style={styles.modalButton}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveMetric}
                  style={styles.modalButton}
                  loading={loading}
                  disabled={loading}
                >
                  Guardar
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        label="Agregar Métrica"
        onPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricCard: {
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontWeight: '600',
  },
  metricDate: {
    color: '#666',
    marginTop: 4,
  },
  metricValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontWeight: 'bold',
  },
  normalRange: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  rangeText: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});