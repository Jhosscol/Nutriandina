// modules/user-management/screens/HealthQuestionnaireScreen.js
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, ProgressBar, Surface, Text } from 'react-native-paper';
import { guardarPerfilSalud } from '../../../services/mongodb';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import storageService from '../services/storageService';

// Importar los pasos del cuestionario
import { Alert } from 'react-native'; // ✅ Agregar este import al inicio
import Step1BasicInfo from '../components/health/HealthQuestionnaireStep1';
import Step2Conditions from '../components/health/HealthQuestionnaireStep2';
import Step3Allergies from '../components/health/HealthQuestionnaireStep3';
import Step4Preferences from '../components/health/HealthQuestionnaireStep4';
import Step5Summary from '../components/health/HealthSummary';

const TOTAL_STEPS = 5;

export default function HealthQuestionnaireScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const { saveHealthData } = useHealthData();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    basicInfo: {},
    conditions: [],
    allergies: [],
    preferences: {}
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar progreso guardado si existe
  useEffect(() => {
    loadSavedProgress();
  }, []);

  const loadSavedProgress = async () => {
    try {
      const savedProgress = await storageService.getQuestionnaireProgress();
      if (savedProgress) {
        // Determinar el último paso completado
        const steps = Object.keys(savedProgress).map(key => parseInt(key.replace('step', '')));
        const lastStep = Math.max(...steps);
        
        // Cargar datos guardados
        setFormData({
          basicInfo: savedProgress.step1 || {},
          conditions: savedProgress.step2 || [],
          allergies: savedProgress.step3 || [],
          preferences: savedProgress.step4 || {}
        });
        
        // Ir al siguiente paso no completado
        setCurrentStep(Math.min(lastStep + 1, TOTAL_STEPS));
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  };

  const saveProgress = async (step, data) => {
    try {
      await storageService.saveQuestionnaireProgress(`step${step}`, data);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNext = async (stepData) => {
    // Actualizar datos del formulario
    const updatedData = { ...formData };
    
    switch (currentStep) {
      case 1:
        updatedData.basicInfo = stepData;
        break;
      case 2:
        updatedData.conditions = stepData;
        break;
      case 3:
        updatedData.allergies = stepData;
        break;
      case 4:
        updatedData.preferences = stepData;
        break;
    }
    
    setFormData(updatedData);
    
    // Guardar progreso
    await saveProgress(currentStep, stepData);
    
    // Ir al siguiente paso
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      console.log('🟢 === INICIO GUARDADO DE PERFIL ===');
      console.log('📦 Datos completos a guardar:', JSON.stringify(formData, null, 2));
      
      // Guardar en MongoDB
      console.log('📡 Llamando a guardarPerfilSalud...');
      const resultado = await guardarPerfilSalud(formData);
      
      console.log('✅ Respuesta de guardarPerfilSalud:', JSON.stringify(resultado, null, 2));
      
      if (resultado.success) {
        console.log('✅ Perfil guardado exitosamente en MongoDB');
        console.log('📋 ID del perfil:', resultado.id || resultado._id);
        
        // También guardar en el contexto local
        await saveHealthData(formData);
        
        // Marcar perfil como completo
        await updateProfile({ isProfileComplete: true });
        
        console.log('✅ Perfil marcado como completo');
        
        // Limpiar progreso guardado
        await storageService.clearQuestionnaireProgress();
        
        console.log('🎉 === FIN GUARDADO EXITOSO ===');
        
        // ✅ MOSTRAR ALERT DE ÉXITO
        Alert.alert(
          '¡Perfil Completado! 🎉',
          'Tu plan nutricional personalizado está listo. Ahora puedes explorar recetas andinas, crear planes de comidas y alcanzar tus objetivos de salud.',
          [
            {
              text: 'Empezar',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
              }
            }
          ],
          { cancelable: false } // No se puede cerrar tocando fuera
        );
        
      } else {
        console.error('❌ resultado.success es false');
        console.error('❌ Detalles:', resultado);
        throw new Error(resultado.message || 'Error al guardar en MongoDB');
      }
    } catch (error) {
      console.error('💥 === ERROR EN HANDLECOMPLETE ===');
      console.error('💥 Error tipo:', error.name);
      console.error('💥 Error mensaje:', error.message);
      console.error('💥 Error stack:', error.stack);
      console.error('💥 Error completo:', JSON.stringify(error, null, 2));
      
      setErrors({ 
        submit: `Error al guardar: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: formData,
      onNext: handleNext,
      onBack: handleBack
    };

    switch (currentStep) {
      case 1:
        return <Step1BasicInfo {...stepProps} initialData={formData.basicInfo} />;
      case 2:
        return <Step2Conditions {...stepProps} initialData={formData.conditions} />;
      case 3:
        return <Step3Allergies {...stepProps} initialData={formData.allergies} />;
      case 4:
        return <Step4Preferences {...stepProps} initialData={formData.preferences} />;
      case 5:
        return (
          <Step5Summary
            data={formData}
            onComplete={handleComplete}
            onBack={handleBack}
            loading={loading}
            error={errors.submit}
            navigation={navigation}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const titles = {
      1: 'Información Básica',
      2: 'Condiciones de Salud',
      3: 'Alergias Alimentarias',
      4: 'Preferencias y Hábitos',
      5: 'Resumen y Confirmación'
    };
    return titles[currentStep] || '';
  };

  const progress = currentStep / TOTAL_STEPS;

  return (
    <View style={styles.container}>
      {/* Header con progreso */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleBack}
          />
          <Text variant="titleMedium" style={styles.headerTitle}>
            Cuestionario de Salud
          </Text>
          <View style={styles.stepIndicator}>
            <Text variant="bodyMedium" style={styles.stepText}>
              {currentStep}/{TOTAL_STEPS}
            </Text>
          </View>
        </View>
        
        <Text variant="bodyLarge" style={styles.stepTitle}>
          {getStepTitle()}
        </Text>
        
        <ProgressBar
          progress={progress}
          color="#2E7D32"
          style={styles.progressBar}
        />
      </Surface>

      {/* Contenido del paso actual */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      {/* Información de ayuda */}
      {currentStep < TOTAL_STEPS && (
        <Surface style={styles.helpCard} elevation={1}>
          <Text variant="bodySmall" style={styles.helpText}>
            💡 Puedes salir en cualquier momento. Tu progreso se guardará automáticamente.
          </Text>
        </Surface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepIndicator: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  stepTitle: {
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  helpCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE082',
  },
  helpText: {
    color: '#F57C00',
    textAlign: 'center',
  },
});