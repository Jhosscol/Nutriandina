// modules/user-management/utils/validation.js

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'El email es requerido' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email inválido' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  // Opcional: validar que tenga mayúsculas, números, etc.
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasNumber = /\d/.test(password);
  
  return { isValid: true };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' };
  }
  
  return { isValid: true };
};

export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'El nombre es requerido' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'El nombre es muy largo' };
  }
  
  return { isValid: true };
};

export const validateAge = (age) => {
  const ageNum = parseInt(age);
  
  if (!age || isNaN(ageNum)) {
    return { isValid: false, error: 'La edad es requerida' };
  }
  
  if (ageNum < 1 || ageNum > 120) {
    return { isValid: false, error: 'Edad inválida' };
  }
  
  if (ageNum < 18) {
    return { isValid: false, error: 'Debes ser mayor de 18 años' };
  }
  
  return { isValid: true };
};

export const validateWeight = (weight) => {
  const weightNum = parseFloat(weight);
  
  if (!weight || isNaN(weightNum)) {
    return { isValid: false, error: 'El peso es requerido' };
  }
  
  if (weightNum < 20 || weightNum > 300) {
    return { isValid: false, error: 'Peso fuera de rango válido (20-300 kg)' };
  }
  
  return { isValid: true };
};

export const validateHeight = (height) => {
  const heightNum = parseFloat(height);
  
  if (!height || isNaN(heightNum)) {
    return { isValid: false, error: 'La altura es requerida' };
  }
  
  if (heightNum < 100 || heightNum > 250) {
    return { isValid: false, error: 'Altura fuera de rango válido (100-250 cm)' };
  }
  
  return { isValid: true };
};

export const validateGlucose = (glucose, type = 'fasting') => {
  const glucoseNum = parseFloat(glucose);
  
  if (!glucose || isNaN(glucoseNum)) {
    return { isValid: false, error: 'El nivel de glucosa es requerido' };
  }
  
  if (glucoseNum < 40 || glucoseNum > 600) {
    return { isValid: false, error: 'Valor de glucosa fuera de rango (40-600 mg/dL)' };
  }
  
  // Advertencias según tipo
  if (type === 'fasting' && glucoseNum > 126) {
    return { 
      isValid: true, 
      warning: 'Glucosa en ayunas elevada. Consulta con tu médico.' 
    };
  }
  
  if (type === 'postprandial' && glucoseNum > 200) {
    return { 
      isValid: true, 
      warning: 'Glucosa postprandial muy alta. Consulta con tu médico.' 
    };
  }
  
  return { isValid: true };
};

export const validateBloodPressure = (systolic, diastolic) => {
  const sysNum = parseInt(systolic);
  const diaNum = parseInt(diastolic);
  
  if (!systolic || !diastolic || isNaN(sysNum) || isNaN(diaNum)) {
    return { isValid: false, error: 'Ambos valores son requeridos' };
  }
  
  if (sysNum < 70 || sysNum > 200) {
    return { isValid: false, error: 'Presión sistólica fuera de rango (70-200)' };
  }
  
  if (diaNum < 40 || diaNum > 130) {
    return { isValid: false, error: 'Presión diastólica fuera de rango (40-130)' };
  }
  
  if (sysNum <= diaNum) {
    return { isValid: false, error: 'La presión sistólica debe ser mayor que la diastólica' };
  }
  
  // Advertencias
  if (sysNum >= 140 || diaNum >= 90) {
    return { 
      isValid: true, 
      warning: 'Presión arterial elevada. Consulta con tu médico.' 
    };
  }
  
  if (sysNum < 90 || diaNum < 60) {
    return { 
      isValid: true, 
      warning: 'Presión arterial baja. Monitorea tus síntomas.' 
    };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone) => {
  // Formato peruano: +51 999 999 999 o 999999999
  const phoneRegex = /^(\+51)?[0-9]{9}$/;
  
  if (!phone) {
    return { isValid: false, error: 'El teléfono es requerido' };
  }
  
  const cleanPhone = phone.replace(/\s/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Teléfono inválido (9 dígitos)' };
  }
  
  return { isValid: true };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { 
      isValid: false, 
      error: `${fieldName} es requerido` 
    };
  }
  
  return { isValid: true };
};

export const validateArray = (array, fieldName, minLength = 1) => {
  if (!Array.isArray(array) || array.length < minLength) {
    return { 
      isValid: false, 
      error: `Debes seleccionar al menos ${minLength} ${fieldName}` 
    };
  }
  
  return { isValid: true };
};

export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(fields).forEach(field => {
    const validation = fields[field];
    if (validation && !validation.isValid) {
      errors[field] = validation.error;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

// Validar fecha de nacimiento
export const validateBirthDate = (date) => {
  if (!date) {
    return { isValid: false, error: 'La fecha de nacimiento es requerida' };
  }
  
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (age < 18) {
    return { isValid: false, error: 'Debes ser mayor de 18 años' };
  }
  
  if (age > 120) {
    return { isValid: false, error: 'Fecha de nacimiento inválida' };
  }
  
  return { isValid: true, age };
};

// Validar género
export const validateGender = (gender) => {
  const validGenders = ['male', 'female', 'other'];
  
  if (!gender || !validGenders.includes(gender)) {
    return { isValid: false, error: 'Debes seleccionar un género' };
  }
  
  return { isValid: true };
};

// Validar nivel de actividad
export const validateActivityLevel = (level) => {
  const validLevels = ['sedentary', 'light', 'moderate', 'active', 'veryActive'];
  
  if (!level || !validLevels.includes(level)) {
    return { isValid: false, error: 'Debes seleccionar un nivel de actividad' };
  }
  
  return { isValid: true };
};