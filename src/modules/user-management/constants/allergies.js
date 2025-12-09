// modules/user-management/constants/allergies.js

export const FOOD_ALLERGIES = [
  {
    id: 'milk',
    name: 'Leche y Lácteos',
    category: 'common',
    severity: 'high',
    alternatives: ['Leche de quinua', 'Leche de soya', 'Leche de coco']
  },
  {
    id: 'eggs',
    name: 'Huevos',
    category: 'common',
    severity: 'high',
    alternatives: ['Semillas de chía molidas', 'Puré de manzana']
  },
  {
    id: 'fish',
    name: 'Pescado',
    category: 'common',
    severity: 'high',
    alternatives: ['Tarwi (proteína vegetal)', 'Quinua']
  },
  {
    id: 'shellfish',
    name: 'Mariscos',
    category: 'common',
    severity: 'high',
    alternatives: ['Algas marinas', 'Champiñones']
  },
  {
    id: 'treenuts',
    name: 'Frutos Secos (nueces, almendras)',
    category: 'common',
    severity: 'high',
    alternatives: ['Semillas de calabaza', 'Semillas de girasol']
  },
  {
    id: 'peanuts',
    name: 'Maní',
    category: 'common',
    severity: 'high',
    alternatives: ['Mantequilla de semillas de girasol']
  },
  {
    id: 'wheat',
    name: 'Trigo',
    category: 'common',
    severity: 'medium',
    alternatives: ['Harina de quinua', 'Harina de amaranto', 'Harina de papa']
  },
  {
    id: 'soy',
    name: 'Soya',
    category: 'common',
    severity: 'medium',
    alternatives: ['Tarwi', 'Frijoles']
  },
  {
    id: 'gluten',
    name: 'Gluten',
    category: 'common',
    severity: 'medium',
    alternatives: ['Quinua', 'Amaranto', 'Maíz', 'Papa', 'Yuca']
  },
  {
    id: 'lactose',
    name: 'Lactosa',
    category: 'intolerance',
    severity: 'medium',
    alternatives: ['Leche de quinua', 'Queso sin lactosa']
  },
  {
    id: 'corn',
    name: 'Maíz',
    category: 'other',
    severity: 'medium',
    alternatives: ['Quinua', 'Papa', 'Yuca']
  },
  {
    id: 'citrus',
    name: 'Cítricos',
    category: 'other',
    severity: 'low',
    alternatives: ['Aguaymanto', 'Tumbo']
  },
  {
    id: 'strawberry',
    name: 'Fresas',
    category: 'other',
    severity: 'low',
    alternatives: ['Aguaymanto', 'Arándanos andinos']
  },
  {
    id: 'tomato',
    name: 'Tomate',
    category: 'other',
    severity: 'low',
    alternatives: ['Ají amarillo (en pequeñas cantidades)', 'Rocoto']
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    category: 'other',
    severity: 'low',
    alternatives: ['Algarrobina']
  },
  {
    id: 'sulfites',
    name: 'Sulfitos',
    category: 'additives',
    severity: 'medium',
    alternatives: ['Alimentos frescos sin conservantes']
  },
  {
    id: 'msg',
    name: 'Glutamato Monosódico (MSG)',
    category: 'additives',
    severity: 'low',
    alternatives: ['Especias naturales', 'Sal de maras']
  }
];

export const ALLERGY_CATEGORIES = {
  common: 'Alergias Comunes',
  intolerance: 'Intolerancias',
  other: 'Otras Alergias',
  additives: 'Aditivos'
};

export const SEVERITY_LEVELS = {
  high: {
    label: 'Alta',
    color: '#D32F2F',
    description: 'Puede causar reacciones severas'
  },
  medium: {
    label: 'Media',
    color: '#F57C00',
    description: 'Puede causar molestias moderadas'
  },
  low: {
    label: 'Baja',
    color: '#FBC02D',
    description: 'Puede causar molestias leves'
  }
};

// Alergias que requieren atención médica inmediata
export const CRITICAL_ALLERGIES = [
  'milk', 'eggs', 'fish', 'shellfish', 'treenuts', 'peanuts'
];