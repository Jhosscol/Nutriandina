import { DefaultTheme } from 'react-native-paper';

// Colores inspirados en la cultura andina
export const colors = {
  // Colores principales
  primary: '#8B4513', // Marrón tierra andina
  secondary: '#FF6B35', // Naranja cálido (ají)
  tertiary: '#4A7C59', // Verde andino (hojas de coca)
  
  // Colores de acento
  accent: '#F7B801', // Dorado (maíz)
  gold: '#DAA520',
  
  // Colores de fondo
  background: '#F5F5F5',
  surface: '#FFFFFF',
  
  // Colores de texto
  text: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  
  // Colores de estado
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Colores para condiciones médicas
  diabetes: '#FF6B6B',
  hipertension: '#4ECDC4',
  colesterol: '#FFE66D',
  
  // Gradientes
  gradientStart: '#8B4513',
  gradientEnd: '#CD853F',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    error: colors.error,
  },
  roundness: 12,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  small: {
    fontSize: 12,
    color: colors.textLight,
  },
};