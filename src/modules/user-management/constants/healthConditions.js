// modules/user-management/constants/healthConditions.js

export const HEALTH_CONDITIONS = [
  {
    id: 'diabetes_type1',
    name: 'Diabetes Tipo 1',
    category: 'metabolic',
    requiresMonitoring: ['glucose'],
    dietaryRestrictions: ['lowSugar', 'controlledCarbs']
  },
  {
    id: 'diabetes_type2',
    name: 'Diabetes Tipo 2',
    category: 'metabolic',
    requiresMonitoring: ['glucose', 'weight'],
    dietaryRestrictions: ['lowSugar', 'controlledCarbs', 'lowFat']
  },
  {
    id: 'hypertension',
    name: 'Hipertensión Arterial',
    category: 'cardiovascular',
    requiresMonitoring: ['bloodPressure', 'weight'],
    dietaryRestrictions: ['lowSodium', 'lowFat']
  },
  {
    id: 'hypotension',
    name: 'Hipotensión',
    category: 'cardiovascular',
    requiresMonitoring: ['bloodPressure'],
    dietaryRestrictions: []
  },
  {
    id: 'cholesterol',
    name: 'Colesterol Alto',
    category: 'cardiovascular',
    requiresMonitoring: ['weight'],
    dietaryRestrictions: ['lowFat', 'lowCholesterol']
  },
  {
    id: 'thyroid_hyper',
    name: 'Hipertiroidismo',
    category: 'endocrine',
    requiresMonitoring: ['weight'],
    dietaryRestrictions: ['lowIodine']
  },
  {
    id: 'thyroid_hypo',
    name: 'Hipotiroidismo',
    category: 'endocrine',
    requiresMonitoring: ['weight'],
    dietaryRestrictions: []
  },
  {
    id: 'celiac',
    name: 'Enfermedad Celíaca',
    category: 'digestive',
    requiresMonitoring: [],
    dietaryRestrictions: ['glutenFree']
  },
  {
    id: 'ibs',
    name: 'Síndrome de Intestino Irritable',
    category: 'digestive',
    requiresMonitoring: [],
    dietaryRestrictions: ['lowFodmap']
  },
  {
    id: 'gastritis',
    name: 'Gastritis',
    category: 'digestive',
    requiresMonitoring: [],
    dietaryRestrictions: ['lowAcid', 'lowSpice']
  },
  {
    id: 'kidney_disease',
    name: 'Enfermedad Renal',
    category: 'renal',
    requiresMonitoring: ['bloodPressure', 'weight'],
    dietaryRestrictions: ['lowSodium', 'lowProtein', 'lowPotassium']
  },
  {
    id: 'fatty_liver',
    name: 'Hígado Graso',
    category: 'hepatic',
    requiresMonitoring: ['weight'],
    dietaryRestrictions: ['lowFat', 'lowSugar']
  },
  {
    id: 'anemia',
    name: 'Anemia',
    category: 'hematologic',
    requiresMonitoring: [],
    dietaryRestrictions: ['ironRich']
  },
  {
    id: 'obesity',
    name: 'Obesidad',
    category: 'metabolic',
    requiresMonitoring: ['weight', 'waist'],
    dietaryRestrictions: ['calorieControl']
  },
  {
    id: 'prediabetes',
    name: 'Prediabetes',
    category: 'metabolic',
    requiresMonitoring: ['glucose', 'weight'],
    dietaryRestrictions: ['controlledCarbs', 'lowSugar']
  },
  {
    id: 'gout',
    name: 'Gota',
    category: 'metabolic',
    requiresMonitoring: [],
    dietaryRestrictions: ['lowPurine']
  }
];

export const CONDITION_CATEGORIES = {
  metabolic: 'Metabólicas',
  cardiovascular: 'Cardiovasculares',
  endocrine: 'Endocrinas',
  digestive: 'Digestivas',
  renal: 'Renales',
  hepatic: 'Hepáticas',
  hematologic: 'Hematológicas'
};

export const DIETARY_RESTRICTIONS = {
  lowSugar: {
    name: 'Bajo en Azúcar',
    description: 'Limitar azúcares simples y refinados'
  },
  controlledCarbs: {
    name: 'Carbohidratos Controlados',
    description: 'Control de cantidad y tipo de carbohidratos'
  },
  lowSodium: {
    name: 'Bajo en Sodio',
    description: 'Reducir consumo de sal y alimentos procesados'
  },
  lowFat: {
    name: 'Bajo en Grasas',
    description: 'Reducir grasas saturadas y trans'
  },
  lowCholesterol: {
    name: 'Bajo en Colesterol',
    description: 'Limitar alimentos ricos en colesterol'
  },
  glutenFree: {
    name: 'Sin Gluten',
    description: 'Eliminar trigo, cebada y centeno'
  },
  lowFodmap: {
    name: 'Bajo en FODMAPs',
    description: 'Reducir carbohidratos fermentables'
  },
  lowAcid: {
    name: 'Bajo en Ácidos',
    description: 'Evitar alimentos muy ácidos'
  },
  lowSpice: {
    name: 'Bajo en Picante',
    description: 'Evitar alimentos muy condimentados'
  },
  lowProtein: {
    name: 'Proteína Controlada',
    description: 'Limitar cantidad de proteína'
  },
  lowPotassium: {
    name: 'Bajo en Potasio',
    description: 'Reducir alimentos ricos en potasio'
  },
  ironRich: {
    name: 'Rico en Hierro',
    description: 'Priorizar alimentos con hierro'
  },
  calorieControl: {
    name: 'Control Calórico',
    description: 'Vigilar el total de calorías diarias'
  },
  lowPurine: {
    name: 'Bajo en Purinas',
    description: 'Evitar carnes rojas y mariscos'
  },
  lowIodine: {
    name: 'Bajo en Yodo',
    description: 'Limitar sal yodada y alimentos marinos'
  }
};