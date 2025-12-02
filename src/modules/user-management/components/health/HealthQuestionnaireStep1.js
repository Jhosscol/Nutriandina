// modules/user-management/components/health/HealthQuestionnaireStep1.js
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, RadioButton, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { calculateBMI, getBMICategory } from '../../utils/calculations';
import { validateActivityLevel, validateAge, validateGender, validateHeight, validateWeight } from '../../utils/validation';

export default function HealthQuestionnaireStep1({ initialData = {}, onNext }) {
  const [formData, setFormData] = useState({
    age: initialData.age || '',
    gender: initialData.gender || '',
    weight: initialData.weight || '',
    height: initialData.height || '',
    activityLevel: initialData.activityLevel || '',
    smoker: initialData.smoker || false,
    alcohol: initialData.alcohol || 'none'
  });
  const [errors, setErrors] = useState({});
  const [bmiInfo, setBmiInfo] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Calcular IMC si cambian peso o altura
    if ((field === 'weight' || field === 'height') && formData.weight && formData.height) {
      const weight = field === 'weight' ? parseFloat(value) : parseFloat(formData.weight);
      const height = field === 'height' ? parseFloat(value) : parseFloat(formData.height);
      
      if (weight && height) {
        const bmi = calculateBMI(weight, height);
        const category = getBMICategory(bmi);
        setBmiInfo({ bmi, category });
      }
    }
  };

  const validateForm = () => {
    const ageVal = validateAge(formData.age);
    const weightVal = validateWeight(formData.weight);
    const heightVal = validateHeight(formData.height);
    const genderVal = validateGender(formData.gender);
    const activityVal = validateActivityLevel(formData.activityLevel);

    const newErrors = {};
    if (!ageVal.isValid) newErrors.age = ageVal.error;
    if (!weightVal.isValid) newErrors.weight = weightVal.error;
    if (!heightVal.isValid) newErrors.height = heightVal.error;
    if (!genderVal.isValid) newErrors.gender = genderVal.error;
    if (!activityVal.isValid) newErrors.activityLevel = activityVal.error;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="bodyLarge" style={styles.description}>
        Empecemos con información básica sobre ti. Esto nos ayudará a personalizar tu plan nutricional.
      </Text>

      {/* Edad */}
      <TextInput
        label="Edad"
        value={formData.age}
        onChangeText={(value) => handleChange('age', value)}
        mode="outlined"
        keyboardType="numeric"
        error={!!errors.age}
        left={<TextInput.Icon icon="cake" />}
        style={styles.input}
      />
      {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

      {/* Género */}
      <Text variant="titleMedium" style={styles.sectionTitle}>Género</Text>
      <RadioButton.Group
        onValueChange={(value) => handleChange('gender', value)}
        value={formData.gender}
      >
        <View style={styles.radioContainer}>
          <RadioButton.Item label="Masculino" value="male" />
          <RadioButton.Item label="Femenino" value="female" />
          <RadioButton.Item label="Otro" value="other" />
        </View>
      </RadioButton.Group>
      {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

      {/* Peso */}
      <TextInput
        label="Peso (kg)"
        value={formData.weight}
        onChangeText={(value) => handleChange('weight', value)}
        mode="outlined"
        keyboardType="decimal-pad"
        error={!!errors.weight}
        left={<TextInput.Icon icon="scale-bathroom" />}
        style={styles.input}
      />
      {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}

      {/* Altura */}
      <TextInput
        label="Altura (cm)"
        value={formData.height}
        onChangeText={(value) => handleChange('height', value)}
        mode="outlined"
        keyboardType="decimal-pad"
        error={!!errors.height}
        left={<TextInput.Icon icon="human-male-height" />}
        style={styles.input}
      />
      {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}

      {/* IMC Info */}
      {bmiInfo && (
        <Card style={styles.bmiCard}>
          <Card.Content>
            <Text variant="titleMedium">Tu IMC: {bmiInfo.bmi}</Text>
            <Text variant="bodyMedium" style={{ color: bmiInfo.category.color }}>
              {bmiInfo.category.label}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Nivel de Actividad */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Nivel de Actividad Física
      </Text>
      <SegmentedButtons
        value={formData.activityLevel}
        onValueChange={(value) => handleChange('activityLevel', value)}
        buttons={[
          { value: 'sedentary', label: 'Sedentario' },
          { value: 'light', label: 'Ligero' },
          { value: 'moderate', label: 'Moderado' },
          { value: 'active', label: 'Activo' },
        ]}
        style={styles.segmentedButtons}
      />
      {errors.activityLevel && <Text style={styles.errorText}>{errors.activityLevel}</Text>}

      {/* Fumador */}
      <Text variant="titleMedium" style={styles.sectionTitle}>¿Fumas?</Text>
      <SegmentedButtons
        value={formData.smoker ? 'yes' : 'no'}
        onValueChange={(value) => handleChange('smoker', value === 'yes')}
        buttons={[
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Sí' },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Consumo de Alcohol */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Consumo de Alcohol
      </Text>
      <SegmentedButtons
        value={formData.alcohol}
        onValueChange={(value) => handleChange('alcohol', value)}
        buttons={[
          { value: 'none', label: 'Nunca' },
          { value: 'occasional', label: 'Ocasional' },
          { value: 'frequent', label: 'Frecuente' },
        ]}
        style={styles.segmentedButtons}
      />

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.nextButton}
        icon="arrow-right"
        contentStyle={styles.buttonContent}
      >
        Continuar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  description: {
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 12,
    marginLeft: 12,
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  radioContainer: {
    marginBottom: 16,
  },
  bmiCard: {
    marginVertical: 16,
    backgroundColor: '#E8F5E9',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  nextButton: {
    marginTop: 24,
    paddingVertical: 6,
  },
  buttonContent: {
    flexDirection: 'row-reverse',
  },
});