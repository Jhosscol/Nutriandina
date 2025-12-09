// modules/user-management/constants/goals.js

export const HEALTH_GOALS = [
  {
    id: 'weight_loss',
    title: 'Pérdida de Peso',
    description: 'Reducir peso de forma saludable y sostenible',
    icon: 'scale-bathroom',
    category: 'weight',
    color: '#E91E63',
    requiredMetrics: ['weight', 'waist'],
    recommendedActions: [
      'Control de porciones',
      'Actividad física regular',
      'Dieta balanceada con alimentos andinos'
    ],
    targetOptions: [
      { label: '0.5 kg por semana', value: 0.5 },
      { label: '1 kg por semana', value: 1 },
      { label: '1.5 kg por semana', value: 1.5 }
    ]
  },
  {
    id: 'weight_gain',
    title: 'Ganancia de Peso Saludable',
    description: 'Aumentar peso de forma controlada y nutritiva',
    icon: 'trending-up',
    category: 'weight',
    color: '#4CAF50',
    requiredMetrics: ['weight'],
    recommendedActions: [
      'Aumentar calorías saludables',
      'Consumir más proteínas',
      'Comidas frecuentes'
    ],
    targetOptions: [
      { label: '0.5 kg por semana', value: 0.5 },
      { label: '1 kg por semana', value: 1 }
    ]
  },
  {
    id: 'weight_maintain',
    title: 'Mantener Peso Actual',
    description: 'Estabilizar y mantener el peso saludable',
    icon: 'scale',
    category: 'weight',
    color: '#2196F3',
    requiredMetrics: ['weight'],
    recommendedActions: [
      'Balance calórico',
      'Alimentación consciente',
      'Ejercicio regular'
    ]
  },
  {
    id: 'diabetes_control',
    title: 'Control de Diabetes',
    description: 'Mantener niveles de glucosa estables',
    icon: 'water',
    category: 'disease_management',
    color: '#FF9800',
    requiredMetrics: ['glucose', 'weight'],
    recommendedActions: [
      'Monitoreo de glucosa',
      'Carbohidratos controlados',
      'Actividad física regular'
    ],
    targetRange: {
      fasting: { min: 70, max: 130 },
      postprandial: { min: 90, max: 180 }
    }
  },
  {
    id: 'blood_pressure_control',
    title: 'Control de Presión Arterial',
    description: 'Mantener presión arterial en rangos saludables',
    icon: 'heart-pulse',
    category: 'disease_management',
    color: '#F44336',
    requiredMetrics: ['bloodPressure'],
    recommendedActions: [
      'Reducir sodio',
      'Aumentar potasio',
      'Manejo del estrés'
    ],
    targetRange: {
      systolic: { min: 90, max: 120 },
      diastolic: { min: 60, max: 80 }
    }
  },
  {
    id: 'cholesterol_control',
    title: 'Control de Colesterol',
    description: 'Reducir niveles de colesterol malo',
    icon: 'molecule',
    category: 'disease_management',
    color: '#9C27B0',
    requiredMetrics: ['weight'],
    recommendedActions: [
      'Grasas saludables',
      'Fibra soluble',
      'Omega-3 de pescado'
    ]
  },
  {
    id: 'muscle_gain',
    title: 'Ganancia Muscular',
    description: 'Aumentar masa muscular magra',
    icon: 'arm-flex',
    category: 'fitness',
    color: '#00BCD4',
    requiredMetrics: ['weight'],
    recommendedActions: [
      'Proteína adecuada',
      'Entrenamiento de fuerza',
      'Recuperación apropiada'
    ]
  },
  {
    id: 'energy_boost',
    title: 'Aumentar Energía',
    description: 'Mejorar vitalidad y reducir fatiga',
    icon: 'lightning-bolt',
    category: 'wellness',
    color: '#FFEB3B',
    requiredMetrics: [],
    recommendedActions: [
      'Hierro y vitaminas B',
      'Hidratación adecuada',
      'Sueño de calidad'
    ]
  },
  {
    id: 'digestive_health',
    title: 'Salud Digestiva',
    description: 'Mejorar función digestiva',
    icon: 'stomach',
    category: 'wellness',
    color: '#8BC34A',
    requiredMetrics: [],
    recommendedActions: [
      'Fibra natural',
      'Probióticos',
      'Comidas regulares'
    ]
  },
  {
    id: 'immunity_boost',
    title: 'Fortalecer Sistema Inmune',
    description: 'Mejorar defensas naturales del cuerpo',
    icon: 'shield',
    category: 'wellness',
    color: '#03A9F4',
    requiredMetrics: [],
    recommendedActions: [
      'Vitamina C natural',
      'Antioxidantes',
      'Alimentación variada'
    ]
  },
  {
    id: 'healthy_pregnancy',
    title: 'Embarazo Saludable',
    description: 'Nutrición óptima durante el embarazo',
    icon: 'baby-carriage',
    category: 'special',
    color: '#FF69B4',
    requiredMetrics: ['weight'],
    recommendedActions: [
      'Ácido fólico',
      'Hierro y calcio',
      'Proteínas de calidad'
    ]
  },
  {
    id: 'healthy_aging',
    title: 'Envejecimiento Saludable',
    description: 'Mantener salud y vitalidad con la edad',
    icon: 'meditation',
    category: 'wellness',
    color: '#795548',
    requiredMetrics: ['weight', 'bloodPressure'],
    recommendedActions: [
      'Antioxidantes',
      'Calcio y vitamina D',
      'Proteína adecuada'
    ]
  }
];

export const GOAL_CATEGORIES = {
  weight: 'Peso Corporal',
  disease_management: 'Manejo de Enfermedades',
  fitness: 'Fitness y Rendimiento',
  wellness: 'Bienestar General',
  special: 'Necesidades Especiales'
};

export const GOAL_PRIORITIES = {
  high: { label: 'Alta', color: '#D32F2F' },
  medium: { label: 'Media', color: '#F57C00' },
  low: { label: 'Baja', color: '#388E3C' }
};