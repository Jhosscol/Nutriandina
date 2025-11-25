import {
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors, spacing, typography } from '../../config/theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          {/* Aquí irá tu logo */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>🌾</Text>
          </View>
          <Text style={styles.appName}>NutriAndina</Text>
          <Text style={styles.tagline}>
            Nutrición ancestral para tu salud moderna
          </Text>
        </View>

        <Image
          source={require('../../assets/welcome-image.png')} // Agrega tu imagen
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <FeatureItem 
          icon="🥗"
          title="Planes Personalizados"
          description="Basados en tu condición de salud"
        />
        <FeatureItem 
          icon="🌽"
          title="Alimentos Andinos"
          description="Quinua, kiwicha, tarwi y más"
        />
        <FeatureItem 
          icon="🛒"
          title="Marketplace Local"
          description="Productos frescos y auténticos"
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.primaryButtonText}>Comenzar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureTextContainer}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingTop: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 40,
  },
  appName: {
    ...typography.h1,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  heroImage: {
    width: width * 0.8,
    height: height * 0.25,
  },
  featuresContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.caption,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    ...typography.h3,
    color: colors.surface,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    ...typography.h3,
    color: colors.primary,
  },
});

export default WelcomeScreen;