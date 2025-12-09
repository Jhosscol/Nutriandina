import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

const HealthProfileScreen = ({ navigation }) => {
  const { updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    healthConditions: [],
    goals: [],
    allergies: [],
    dietaryPreferences: [],
  });

  const healthConditions = [
    { id: 'diabetes', name: 'Diabetes', icon: 'water', color: colors.diabetes },
    { id: 'hypertension', name: 'Hipertensión', icon: 'heart-pulse', color: colors.hipertension },
    { id: 'cholesterol', name: 'Colesterol Alto', icon: 'chemical-weapon', color: colors.colesterol },
    { id: 'obesity', name: 'Obesidad', icon: 'scale-bathroom', color: colors.warning },
    { id: 'none', name: 'Ninguna', icon: 'check-circle', color: colors.success },
  ];

  const goals = [
    { id: 'lose_weight', name: 'Bajar de peso', icon: 'trending-down' },
    { id: 'gain_weight', name: 'Ganar peso', icon: 'trending-up' },
    { id: 'maintain', name: 'Mantener peso', icon: 'minus' },
    { id: 'health', name: 'Mejorar salud', icon: 'heart' },
    { id: 'energy', name: 'Más energía', icon: 'lightning-bolt' },
  ];

  const activityLevels = [
    { id: 'sedentary', name: 'Sedentario', description: 'Poco o ningún ejercicio' },
    { id: 'light', name: 'Ligero', description: '1-3 días/semana' },
    { id: 'moderate', name: 'Moderado', description: '3-5 días/semana' },
    { id: 'active', name: 'Activo', description: '6-7 días/semana' },
    { id: 'very_active', name: 'Muy Activo', description: 'Ejercicio intenso diario' },
  ];

  const toggleSelection = (field, value) => {
    setProfile(prev => {
      const currentValues = prev[field];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(v => v !== value),
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value],
        };
      }
    });
  };

  const selectSingle = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!profile.age || !profile.gender || !profile.weight || !profile.height) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }
    }
    if (step === 2) {
      if (profile.healthConditions.length === 0) {
        Alert.alert('Error', 'Por favor selecciona al menos una opción');
        return;
      }
    }
    if (step === 3) {
      if (profile.goals.length === 0) {
        Alert.alert('Error', 'Por favor selecciona al menos un objetivo');
        return;
      }
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    const result = await updateUserProfile({
      ...profile,
      profileComplete: true,
    });

    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Información Básica</Text>
      <Text style={styles.stepSubtitle}>Necesitamos conocerte mejor</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Edad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 30"
          keyboardType="numeric"
          value={profile.age}
          onChangeText={(text) => selectSingle('age', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Género</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              profile.gender === 'male' && styles.selectedButton,
            ]}
            onPress={() => selectSingle('gender', 'male')}
          >
            <Icon
              name="human-male"
              size={24}
              color={profile.gender === 'male' ? colors.surface : colors.primary}
            />
            <Text
              style={[
                styles.genderText,
                profile.gender === 'male' && styles.selectedText,
              ]}
            >
              Hombre
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              profile.gender === 'female' && styles.selectedButton,
            ]}
            onPress={() => selectSingle('gender', 'female')}
          >
            <Icon
              name="human-female"
              size={24}
              color={profile.gender === 'female' ? colors.surface : colors.primary}
            />
            <Text
              style={[
                styles.genderText,
                profile.gender === 'female' && styles.selectedText,
              ]}
            >
              Mujer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="70"
            keyboardType="numeric"
            value={profile.weight}
            onChangeText={(text) => selectSingle('weight', text)}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
          <Text style={styles.label}>Altura (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="170"
            keyboardType="numeric"
            value={profile.height}
            onChangeText={(text) => selectSingle('height', text)}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Condiciones de Salud</Text>
      <Text style={styles.stepSubtitle}>
        Selecciona las que apliquen a tu situación
      </Text>

      <View style={styles.optionsGrid}>
        {healthConditions.map((condition) => (
          <TouchableOpacity
            key={condition.id}
            style={[
              styles.conditionCard,
              profile.healthConditions.includes(condition.id) &&
                styles.selectedCard,
              { borderColor: condition.color },
            ]}
            onPress={() => toggleSelection('healthConditions', condition.id)}
          >
            <Icon
              name={condition.icon}
              size={32}
              color={
                profile.healthConditions.includes(condition.id)
                  ? condition.color
                  : colors.textLight
              }
            />
            <Text
              style={[
                styles.conditionName,
                profile.healthConditions.includes(condition.id) &&
                  styles.selectedText,
              ]}
            >
              {condition.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tus Objetivos</Text>
      <Text style={styles.stepSubtitle}>¿Qué quieres lograr?</Text>

      <View style={styles.goalsList}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalItem,
              profile.goals.includes(goal.id) && styles.selectedGoalItem,
            ]}
            onPress={() => toggleSelection('goals', goal.id)}
          >
            <Icon
              name={goal.icon}
              size={24}
              color={
                profile.goals.includes(goal.id)
                  ? colors.primary
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.goalName,
                profile.goals.includes(goal.id) && styles.selectedGoalText,
              ]}
            >
              {goal.name}
            </Text>
            {profile.goals.includes(goal.id) && (
              <Icon name="check-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Nivel de Actividad</Text>
      <Text style={styles.stepSubtitle}>¿Qué tan activo eres?</Text>

      <View style={styles.activityList}>
        {activityLevels.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.activityItem,
              profile.activityLevel === level.id && styles.selectedActivityItem,
            ]}
            onPress={() => selectSingle('activityLevel', level.id)}
          >
            <View style={styles.activityContent}>
              <Text
                style={[
                  styles.activityName,
                  profile.activityLevel === level.id && styles.selectedActivityText,
                ]}
              >
                {level.name}
              </Text>
              <Text style={styles.activityDescription}>{level.description}</Text>
            </View>
            {profile.activityLevel === level.id && (
              <Icon name="check-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.progressContainer}>
          <Text style={styles.stepIndicator}>
            Paso {step} de 4
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]}
            />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>
            {step === 4 ? 'Finalizar' : 'Continuar'}
          </Text>
          <Icon name="arrow-right" size={20} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  stepIndicator: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: spacing.lg,
  },
  stepTitle: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    ...typography.caption,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedButton: {
    backgroundColor: colors.primary,
  },
  genderText: {
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.sm,
    color: colors.primary,
  },
  selectedText: {
    color: colors.surface,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  conditionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
  },
  conditionName: {
    ...typography.body,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  goalsList: {
    gap: spacing.md,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGoalItem: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
  },
  goalName: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.md,
  },
  selectedGoalText: {
    fontWeight: '600',
    color: colors.primary,
  },
  activityList: {
    gap: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedActivityItem: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  selectedActivityText: {
    color: colors.primary,
  },
  activityDescription: {
    ...typography.caption,
  },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    ...typography.h3,
    color: colors.surface,
    marginRight: spacing.sm,
  },
});

export default HealthProfileScreen;