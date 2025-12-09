// modules/user-management/screens/LoginScreen.js
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, Snackbar, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';

export default function LoginScreen({ navigation }) {
  const { login, loginWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', type: 'error' });

  const handleLogin = async () => {
    // Validar campos
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setErrors({
        email: emailValidation.error,
        password: passwordValidation.error
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // La navegación se manejará automáticamente por el AuthContext
        setSnackbar({
          visible: true,
          message: '¡Bienvenido a NutriAndina!',
          type: 'success'
        });
      } else {
        setSnackbar({
          visible: true,
          message: result.error || 'Error al iniciar sesión',
          type: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Error inesperado. Intenta nuevamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      
      if (!result.success) {
        setSnackbar({
          visible: true,
          message: result.error || 'Error al iniciar sesión con Google',
          type: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Error al iniciar sesión con Google',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo o Imagen */}
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            NutriAndina
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Nutrición Andina Personalizada
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
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
            value={password}
            onChangeText={setPassword}
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

          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
            style={styles.forgotButton}
          >
            ¿Olvidaste tu contraseña?
          </Button>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          >
            Iniciar Sesión
          </Button>

          <Divider style={styles.divider} />
          <Text variant="bodyMedium" style={styles.orText}>
            O continúa con
          </Text>

          <Button
            mode="outlined"
            onPress={handleGoogleLogin}
            disabled={loading}
            icon="google"
            style={styles.googleButton}
          >
            Google
          </Button>

          <View style={styles.footer}>
            <Text variant="bodyMedium">¿No tienes cuenta? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              compact
            >
              Regístrate
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
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  loginButton: {
    paddingVertical: 6,
    marginBottom: 20,
  },
  divider: {
    marginVertical: 20,
  },
  orText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  googleButton: {
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