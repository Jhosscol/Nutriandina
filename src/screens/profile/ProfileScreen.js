import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const stats = [
    { label: 'Días activos', value: '28', icon: 'calendar-check' },
    { label: 'Recetas favoritas', value: '15', icon: 'heart' },
    { label: 'Compras', value: '8', icon: 'shopping' },
  ];

  const menuSections = [
    {
      title: 'Cuenta',
      items: [
        {
          id: 'edit-profile',
          icon: 'account-edit',
          label: 'Editar Perfil',
          subtitle: 'Actualiza tu información personal',
          onPress: () => {},
        },
        {
          id: 'health-profile',
          icon: 'heart-pulse',
          label: 'Perfil de Salud',
          subtitle: 'Condiciones y objetivos',
          onPress: () => {},
        },
        {
          id: 'subscription',
          icon: 'crown',
          label: 'Suscripción Premium',
          subtitle: user?.subscription === 'premium' ? 'Activa' : 'Mejora tu plan',
          badge: user?.subscription !== 'premium' ? 'Mejorar' : null,
          badgeColor: colors.accent,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Mi Actividad',
      items: [
        {
          id: 'orders',
          icon: 'package-variant',
          label: 'Mis Pedidos',
          subtitle: 'Historial de compras',
          onPress: () => {},
        },
        {
          id: 'favorites',
          icon: 'heart',
          label: 'Favoritos',
          subtitle: 'Productos y recetas guardadas',
          onPress: () => {},
        },
        {
          id: 'progress',
          icon: 'chart-line',
          label: 'Mi Progreso',
          subtitle: 'Estadísticas de salud',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Configuración',
      items: [
        {
          id: 'notifications',
          icon: 'bell',
          label: 'Notificaciones',
          subtitle: 'Gestiona tus alertas',
          toggle: true,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'language',
          icon: 'translate',
          label: 'Idioma',
          subtitle: 'Español',
          onPress: () => {},
        },
        {
          id: 'privacy',
          icon: 'shield-account',
          label: 'Privacidad',
          subtitle: 'Controla tu información',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Soporte',
      items: [
        {
          id: 'help',
          icon: 'help-circle',
          label: 'Centro de Ayuda',
          subtitle: 'FAQs y tutoriales',
          onPress: () => {},
        },
        {
          id: 'contact',
          icon: 'email',
          label: 'Contáctanos',
          subtitle: 'Estamos aquí para ayudarte',
          onPress: () => {},
        },
        {
          id: 'about',
          icon: 'information',
          label: 'Acerca de NutriAndina',
          subtitle: 'Versión 1.0.0',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={80} color={colors.primary} />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={16} color={colors.surface} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.subscription === 'premium' && (
            <View style={styles.premiumBadge}>
              <Icon name="crown" size={16} color={colors.accent} />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Icon name={stat.icon} size={20} color={colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menuCard}>
            {section.items.map((item, itemIndex) => (
              <MenuItem
                key={item.id}
                item={item}
                isLast={itemIndex === section.items.length - 1}
              />
            ))}
          </View>
        </View>
      ))}

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="logout" size={20} color={colors.error} />
        <Text style={styles.signOutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Hecho con ❤️ en los Andes del Perú
        </Text>
        <Text style={styles.footerVersion}>Versión 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const MenuItem = ({ item, isLast }) => {
  if (item.toggle) {
    return (
      <View style={[styles.menuItem, !isLast && styles.menuItemBorder]}>
        <View style={styles.menuItemLeft}>
          <View style={styles.iconContainer}>
            <Icon name={item.icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.menuItemText}>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
            {item.subtitle && (
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E0E0E0', true: colors.primary }}
          thumbColor={item.value ? colors.surface : '#F4F4F4'}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Icon name={item.icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemLabel}>{item.label}</Text>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.badge && (
          <View
            style={[
              styles.badge,
              item.badgeColor && { backgroundColor: item.badgeColor },
            ]}
          >
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <Icon name="chevron-right" size={20} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  userName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 184, 1, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  premiumText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.small,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  menuItemSubtitle: {
    ...typography.small,
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  badgeText: {
    ...typography.small,
    color: colors.surface,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.error,
  },
  signOutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  footerVersion: {
    ...typography.small,
  },
});

export default ProfileScreen;