// modules/user-management/constants/metrics.js

export const HEALTH_METRICS = {
  weight: {
    id: 'weight',
    name: 'Peso',
    unit: 'kg',
    icon: 'scale-bathroom',
    color: '#E91E63',
    inputType: 'decimal',
    chartType: 'line',
    normalRange: null, // Depende del IMC
    frequency: 'weekly',
    description: 'Peso corporal en kilogramos'
  },
  height: {
    id: 'height',
    name: 'Altura',
    unit: 'cm',
    icon: 'human-male-height',
    color: '#9C27B0',
    inputType: 'decimal',
    chartType: null, // No se grafica (valor estático)
    normalRange: null,
    frequency: 'once',
    description: 'Altura en centímetros'
  },
  bmi: {
    id: 'bmi',
    name: 'IMC',
    unit: 'kg/m²',
    icon: 'calculator',
    color: '#673AB7',
    inputType: 'calculated',
    chartType: 'line',
    normalRange: { min: 18.5, max: 24.9 },
    frequency: 'auto',
    description: 'Índice de Masa Corporal',
    calculation: (weight, height) => {
      const heightInMeters = height / 100;
      return weight / (heightInMeters * heightInMeters);
    }
  },
  waist: {
    id: 'waist',
    name: 'Perímetro de Cintura',
    unit: 'cm',
    icon: 'ruler',
    color: '#FF5722',
    inputType: 'decimal',
    chartType: 'line',
    normalRange: { male: 94, female: 80 }, // Valores máximos
    frequency: 'weekly',
    description: 'Circunferencia de cintura en centímetros'
  },
  glucose: {
    id: 'glucose',
    name: 'Glucosa',
    unit: 'mg/dL',
    icon: 'water',
    color: '#FF9800',
    inputType: 'decimal',
    chartType: 'line',
    normalRange: { fasting: { min: 70, max: 100 }, postprandial: { min: 90, max: 140 } },
    frequency: 'daily',
    description: 'Nivel de glucosa en sangre',
    measurements: [
      { id: 'fasting', label: 'En Ayunas' },
      { id: 'postprandial', label: 'Post-prandial (2h)' },
      { id: 'random', label: 'Aleatorio' }
    ]
  },
  bloodPressure: {
    id: 'bloodPressure',
    name: 'Presión Arterial',
    unit: 'mmHg',
    icon: 'heart-pulse',
    color: '#F44336',
    inputType: 'dual', // Sistólica/Diastólica
    chartType: 'line',
    normalRange: {
      systolic: { min: 90, max: 120 },
      diastolic: { min: 60, max: 80 }
    },
    frequency: 'daily',
    description: 'Presión arterial sistólica/diastólica'
  },
  heartRate: {
    id: 'heartRate',
    name: 'Frecuencia Cardíaca',
    unit: 'bpm',
    icon: 'heart',
    color: '#E91E63',
    inputType: 'integer',
    chartType: 'line',
    normalRange: { min: 60, max: 100 },
    frequency: 'optional',
    description: 'Latidos por minuto en reposo'
  },
  bodyFat: {
    id: 'bodyFat',
    name: 'Grasa Corporal',
    unit: '%',
    icon: 'percent',
    color: '#FF5722',
    inputType: 'decimal',
    chartType: 'line',
    normalRange: {
      male: { min: 10, max: 20 },
      female: { min: 18, max: 28 }
    },
    frequency: 'monthly',
    description: 'Porcentaje de grasa corporal'
  },
  muscleMass: {
    id: 'muscleMass',
    name: 'Masa Muscular',
    unit: 'kg',
    icon: 'arm-flex',
    color: '#00BCD4',
    inputType: 'decimal',
    chartType: 'line',
    normalRange: null,
    frequency: 'monthly',
    description: 'Masa muscular en kilogramos'
  },
  waterIntake: {
    id: 'waterIntake',
    name: 'Consumo de Agua',
    unit: 'L',
    icon: 'water',
    color: '#03A9F4',
    inputType: 'decimal',
    chartType: 'bar',
    normalRange: { min: 2, max: 3 },
    frequency: 'daily',
    description: 'Litros de agua consumidos al día'
  },
  sleep: {
    id: 'sleep',
    name: 'Horas de Sueño',
    unit: 'h',
    icon: 'sleep',
    color: '#3F51B5',
    inputType: 'decimal',
    chartType: 'bar',
    normalRange: { min: 7, max: 9 },
    frequency: 'daily',
    description: 'Horas de sueño por noche'
  },
  steps: {
    id: 'steps',
    name: 'Pasos',
    unit: 'pasos',
    icon: 'walk',
    color: '#4CAF50',
    inputType: 'integer',
    chartType: 'bar',
    normalRange: { min: 8000, max: 10000 },
    frequency: 'daily',
    description: 'Número de pasos caminados'
  },
  cholesterol: {
    id: 'cholesterol',
    name: 'Colesterol Total',
    unit: 'mg/dL',
    icon: 'molecule',
    color: '#9C27B0',
    inputType: 'decimal',
    chartType: 'line',
    normalRange: { min: 125, max: 200 },
    frequency: 'monthly',
    description: 'Nivel de colesterol total',
    subtypes: [
      { id: 'ldl', label: 'LDL (Malo)', max: 100 },
      { id: 'hdl', label: 'HDL (Bueno)', min: 40 },
      { id: 'triglycerides', label: 'Triglicéridos', max: 150 }
    ]
  }
};

export const METRIC_CATEGORIES = {
  basic: ['weight', 'height', 'bmi'],
  cardiovascular: ['bloodPressure', 'heartRate'],
  metabolic: ['glucose', 'cholesterol'],
  body_composition: ['bodyFat', 'muscleMass', 'waist'],
  lifestyle: ['waterIntake', 'sleep', 'steps']
};

export const METRIC_FREQUENCIES = {
  once: 'Una vez',
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  optional: 'Opcional',
  auto: 'Automático'
};

export const BMI_CATEGORIES = {
  underweight: { min: 0, max: 18.4, label: 'Bajo peso', color: '#2196F3' },
  normal: { min: 18.5, max: 24.9, label: 'Normal', color: '#4CAF50' },
  overweight: { min: 25, max: 29.9, label: 'Sobrepeso', color: '#FF9800' },
  obese1: { min: 30, max: 34.9, label: 'Obesidad I', color: '#FF5722' },
  obese2: { min: 35, max: 39.9, label: 'Obesidad II', color: '#F44336' },
  obese3: { min: 40, max: 100, label: 'Obesidad III', color: '#D32F2F' }
};