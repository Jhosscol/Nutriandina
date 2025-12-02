// modules/user-management/screens/ProfileScreen.js
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Divider, IconButton, List, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useHealthData } from '../context/HealthDataContext';
import { calculateBMI, getBMICategory } from '../utils/calculations';

export default function ProfileScreen({ navigation }) {
  const { user, userProfile, logout } = useAuth();
  const { healthData, getHealthStats } = useHealthData();
  const [loading, setLoading] = useState(false);

  const stats = getHealthStats();
  
  const bmi = userProfile?.currentWeight && userProfile?.height
    ? calculateBMI(userProfile.currentWeight, userProfile.height)
    : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
  };

  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || '?';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header con Avatar */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          {userProfile?.photoURL ? (
            <Avatar.Image 
              size={80} 
              source={{ uri: userProfile.photoURL }} 
            />
          ) : (
            <Avatar.Text 
              size={80} 
              label={getInitials()} 
              style={styles.avatar}
            />
          )}
          
          <View style={styles.headerInfo}>
            <Text variant="headlineSmall" style={styles.name}>
              {userProfile?.displayName || 'Usuario'}
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {user?.email}
            </Text>
            {user?.emailVerified && (
              <View style={styles.verifiedBadge}>
                <IconButton icon="check-circle" size={16} iconColor="#4CAF50" />
                <Text variant="bodySmall" style={styles.verifiedText}>
                  Verificado
                </Text>
              </View>
            )}
          </View>

          <IconButton
            icon="pencil"
            size={24}
            onPress={() => navigation.navigate('EditProfile')}
          />
        </Card.Content>
      </Card>

      {/* Estadísticas de Salud */}
      <Card style={styles.card}>
        <Card.Title title="Resumen de Salud" />
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {bmi ? bmi.toFixed(1) : '--'}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>IMC</Text>
              {bmiCategory && (
                <Text 
                  variant="labelSmall" 
                  style={[styles.statCategory, { color: bmiCategory.color }]}
                >
                  {bmiCategory.label}
                </Text>
              )}
            </View>

            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {stats.activeGoals}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Objetivos Activos
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {stats.totalConditions}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Condiciones
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {stats.totalAllergies}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Alergias
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Navegación */}
      <Card style={styles.card}>
        <List.Item
          title="Mis Métricas de Salud"
          description="Peso, glucosa, presión arterial, etc."
          left={props => <List.Icon {...props} icon="chart-line" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Metrics')}
        />
        <Divider />
        <List.Item
          title="Mis Objetivos"
          description="Ver y gestionar objetivos de salud"
          left={props => <List.Icon {...props} icon="target" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Goals')}
        />
        <Divider />
        <List.Item
          title="Historial de Actividad"
          description="Ver tu progreso histórico"
          left={props => <List.Icon {...props} icon="history" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ActivityHistory')}
        />
        <Divider />
        <List.Item
          title="Actualizar Cuestionario"
          description="Modificar condiciones o preferencias"
          left={props => <List.Icon {...props} icon="clipboard-text" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('HealthQuestionnaire')}
        />
      </Card>

      {/* Configuración */}
      <Card style={styles.card}>
        <List.Item
          title="Configuración"
          description="Notificaciones, privacidad, etc."
          left={props => <List.Icon {...props} icon="cog" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
        />
      </Card>

      {/* Nivel de Riesgo */}
      {stats.riskLevel && (
        <Card style={[
          styles.card,
          styles.riskCard,
          { 
            backgroundColor: 
              stats.riskLevel === 'high' ? '#FFEBEE' :
              stats.riskLevel === 'medium' ? '#FFF8E1' : '#E8F5E9'
          }
        ]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.riskTitle}>
              Nivel de Riesgo: {
                stats.riskLevel === 'high' ? 'Alto' :
                stats.riskLevel === 'medium' ? 'Moderado' : 'Bajo'
              }
            </Text>
            <Text variant="bodyMedium" style={styles.riskDescription}>
              {stats.riskLevel === 'high' 
                ? 'Te recomendamos consultar con un especialista regularmente.'
                : stats.riskLevel === 'medium'
                ? 'Mantén un seguimiento constante de tu salud.'
                : '¡Excelente! Continúa con tus buenos hábitos.'}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Cerrar Sesión */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        loading={loading}
        disabled={loading}
        style={styles.logoutButton}
        icon="logout"
        textColor="#D32F2F"
      >
        Cerrar Sesión
      </Button>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          NutriAndina v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2E7D32',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontWeight: 'bold',
  },
  email: {
    color: '#666',
    marginTop: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedText: {
    color: '#4CAF50',
    marginLeft: -8,
  },
  card: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  statCategory: {
    marginTop: 4,
    fontWeight: '600',
  },
  riskCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  riskTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  riskDescription: {
    color: '#666',
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    borderColor: '#D32F2F',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    color: '#999',
  },
});