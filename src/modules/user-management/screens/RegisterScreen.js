// modules/user-management/screens/RegisterScreen.js
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Snackbar, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validateName, validatePassword, validatePasswordMatch } from '../utils/validation';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const nameValidation = validateName(formData.displayName);
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const passwordMatchValidation = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );

    const newErrors = {};
    
    if (!nameValidation.isValid) newErrors.displayName = nameValidation.error;
    if (!emailValidation.isValid) newErrors.email = emailValidation.error;
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.error;
    if (!passwordMatchValidation.isValid) newErrors.confirmPassword = passwordMatchValidation.error;
    if (!acceptTerms) newErrors.terms = 'Debes aceptar los términos y condiciones';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    console.log('🔵 Iniciando validación del formulario...');
    
    if (!validateForm()) {
      console.log('❌ Formulario inválido:', errors);
      setSnackbar({
        visible: true,
        message: 'Por favor corrige los errores en el formulario',
        type: 'error'
      });
      return;
    }

    console.log('✅ Formulario válido');
    console.log('📧 Email:', formData.email);
    console.log('👤 Nombre:', formData.displayName);
    
    setLoading(true);

    try {
      console.log('🔵 Llamando a register()...');
      const result = await register(
        formData.email,
        formData.password,
        formData.displayName
      );
      
      console.log('📦 Resultado recibido:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ Registro exitoso!');
        setSnackbar({
          visible: true,
          message: result.message || '¡Cuenta creada! Revisa tu email para verificar tu cuenta.',
          type: 'success'
        });
        
        setTimeout(() => {
          console.log('🔵 Navegando a HealthQuestionnaire...');
          navigation.navigate('HealthQuestionnaire');
        }, 2000);
      } else {
        console.log('❌ Registro falló:', result.error);
        setSnackbar({
          visible: true,
          message: result.error || 'Error al crear cuenta',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('💥 Error capturado en catch:', error);
      console.error('💥 Error name:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      
      setSnackbar({
        visible: true,
        message: error.message || 'Error inesperado. Intenta nuevamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      console.log('🔵 Proceso de registro finalizado');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Crear Cuenta
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Únete a NutriAndina
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Nombre Completo"
            value={formData.displayName}
            onChangeText={(value) => handleChange('displayName', value)}
            mode="outlined"
            error={!!errors.displayName}
            disabled={loading}
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
          />
          {errors.displayName && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.displayName}
            </Text>
          )}

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            disabled={loading}
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
          />
          {errors.email && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.email}
            </Text>
          )}

          <TextInput
            label="Contraseña"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            mode="outlined"
            secureTextEntry={!showPassword}
            error={!!errors.password}
            disabled={loading}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />
          {errors.password && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.password}
            </Text>
          )}

          <TextInput
            label="Confirmar Contraseña"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            error={!!errors.confirmPassword}
            disabled={loading}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            style={styles.input}
          />
          {errors.confirmPassword && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.confirmPassword}
            </Text>
          )}

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={acceptTerms ? 'checked' : 'unchecked'}
              onPress={() => setAcceptTerms(!acceptTerms)}
              disabled={loading}
            />
            <Text variant="bodyMedium" style={styles.checkboxLabel}>
              Acepto los{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Terms')}
              >
                términos y condiciones
              </Text>{' '}
              y la{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Privacy')}
              >
                política de privacidad
              </Text>
            </Text>
          </View>
          {errors.terms && (
            <Text variant="bodySmall" style={styles.errorText}>
              {errors.terms}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
          >
            Crear Cuenta
          </Button>

          <View style={styles.footer}>
            <Text variant="bodyMedium">¿Ya tienes cuenta? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
              compact
            >
              Inicia Sesión
            </Button>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={snackbar.type === 'success' ? styles.snackbarSuccess : styles.snackbarError}
      >
        {snackbar.message}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 8,
    marginLeft: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
  },
  link: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 6,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  snackbarSuccess: {
    backgroundColor: '#4CAF50',
  },
  snackbarError: {
    backgroundColor: '#D32F2F',
  },
});