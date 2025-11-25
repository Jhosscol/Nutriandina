import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();

  const dailyTip = {
    title: "Consejo del día",
    content: "La quinua contiene todos los aminoácidos esenciales, siendo una proteína completa ideal para tu dieta.",
    icon: "lightbulb",
  };

  const healthMetrics = [
    { label: 'Calorías', value: '1,850', target: '2,000', color: colors.success },
    { label: 'Proteínas', value: '85g', target: '100g', color: colors.info },
    { label: 'Agua', value: '1.5L', target: '2L', color: colors.accent },
  ];

  const andeanFoods = [
    { id: 1, name: 'Quinua', image: '🌾', benefits: 'Alta en proteínas' },
    { id: 2, name: 'Kiwicha', image: '🌱', benefits: 'Rica en calcio' },
    { id: 3, name: 'Tarwi', image: '🫘', benefits: 'Alto en fibra' },
    { id: 4, name: 'Maca', image: '🥔', benefits: 'Energizante natural' },
  ];

  const quickActions = [
    { id: 1, title: 'Mi Plan', icon: 'food-apple', color: colors.primary },
    { id: 2, title: 'Recetas', icon: 'chef-hat', color: colors.secondary },
    { id: 3, title: 'Seguimiento', icon: 'chart-line', color: colors.tertiary },
    { id: 4, title: 'Consulta', icon: 'doctor', color: colors.accent },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.name || 'Usuario'}!</Text>
          <Text style={styles.subGreeting}>¿Cómo te sientes hoy?</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell" size={24} color={colors.text} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* Daily Tip Card */}
      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Icon name={dailyTip.icon} size={24} color={colors.accent} />
          <Text style={styles.tipTitle}>{dailyTip.title}</Text>
        </View>
        <Text style={styles.tipContent}>{dailyTip.content}</Text>
      </View>

      {/* Health Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tu progreso hoy</Text>
        <View style={styles.metricsContainer}>
          {healthMetrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={[styles.metricValue, { color: metric.color }]}>
                {metric.value}
              </Text>
              <Text style={styles.metricTarget}>de {metric.target}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(parseInt(metric.value) / parseInt(metric.target)) * 100}%`,
                      backgroundColor: metric.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Icon name={action.icon} size={28} color={colors.surface} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Andean Foods Spotlight */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alimentos Andinos</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foodsScroll}
        >
          {andeanFoods.map((food) => (
            <TouchableOpacity key={food.id} style={styles.foodCard}>
              <Text style={styles.foodImage}>{food.image}</Text>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodBenefits}>{food.benefits}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Premium Banner */}
      <TouchableOpacity style={styles.premiumBanner}>
        <View style={styles.premiumContent}>
          <Icon name="crown" size={32} color={colors.accent} />
          <View style={styles.premiumText}>
            <Text style={styles.premiumTitle}>Hazte Premium</Text>
            <Text style={styles.premiumSubtitle}>
              Accede a planes personalizados y más beneficios
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color={colors.surface} />
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
  },
  greeting: {
    ...typography.h2,
  },
  subGreeting: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  notificationButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  tipCard: {
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTitle: {
    ...typography.h3,
    color: colors.surface,
    marginLeft: spacing.sm,
  },
  tipContent: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
  },
  seeAll: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  metricTarget: {
    ...typography.small,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - spacing.lg * 3) / 2,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  foodsScroll: {
    paddingRight: spacing.lg,
  },
  foodCard: {
    width: 140,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  foodImage: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  foodName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  foodBenefits: {
    ...typography.small,
    textAlign: 'center',
  },
  premiumBanner: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  premiumText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  premiumTitle: {
    ...typography.h3,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  premiumSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
  },
});

export default HomeScreen;