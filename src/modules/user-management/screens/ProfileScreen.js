// modules/user-management/screens/ProfileScreen.js
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, IconButton, List, Text } from 'react-native-paper';
import { obtenerPerfilSalud } from '../../../services/mongodb';
import { useAuth } from '../context/AuthContext';
import { getBMICategory } from '../utils/calculations'; // ✅ Agregar este import

export default function ProfileScreen({ navigation }) {
  const { user, userProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [perfilMongo, setPerfilMongo] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);

  // Cargar perfil desde MongoDB
  useEffect(() => {
    cargarPerfilDesdeMongoDB();
  }, []);

  const cargarPerfilDesdeMongoDB = async () => {
    try {
      setCargandoPerfil(true);
      console.log('🔍 Cargando perfil desde MongoDB...');
      
      const perfil = await obtenerPerfilSalud();
      
      if (perfil) {
        console.log('✅ Perfil cargado desde MongoDB:', perfil);
        setPerfilMongo(perfil);
      } else {
        console.log('⚠️ No hay perfil en MongoDB');
      }
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
    } finally {
      setCargandoPerfil(false);
    }
  };

  // ✅ FUNCIÓN CORREGIDA: Calcular nivel de riesgo
  const calcularNivelRiesgo = (perfil) => {
    if (!perfil) return null;
    
    let riskScore = 0;
    
    // Factores de riesgo basados en condiciones
    const condicionesAltoRiesgo = ['diabetes_type1', 'diabetes_type2', 'heart_disease', 'kidney_disease'];
    const condicionesRiesgoModerado = ['hypertension', 'high_cholesterol', 'obesity'];
    
    // Contar condiciones de alto riesgo
    const condicionesAltas = perfil.condicionesSalud?.filter(c => 
      condicionesAltoRiesgo.includes(c)
    ).length || 0;
    
    // Contar condiciones de riesgo moderado
    const condicionesModeradas = perfil.condicionesSalud?.filter(c => 
      condicionesRiesgoModerado.includes(c)
    ).length || 0;
    
    riskScore += condicionesAltas * 3;
    riskScore += condicionesModeradas * 1;
    
    // Factor de IMC
    const imc = perfil.imc;
    if (imc) {
      if (imc < 18.5) riskScore += 2; // Bajo peso
      else if (imc > 30) riskScore += 3; // Obesidad
      else if (imc > 27) riskScore += 1; // Sobrepeso
    }
    
    // Factor de edad (si está disponible)
    if (perfil.edad) {
      if (perfil.edad > 65) riskScore += 2;
      else if (perfil.edad > 55) riskScore += 1;
    }
    
    // Factor de fumador
    if (perfil.fumador) riskScore += 2;
    
    // Clasificar nivel de riesgo
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  };

  // Calcular estadísticas desde MongoDB
  const stats = perfilMongo ? {
    activeGoals: perfilMongo.preferencias?.objetivosSalud?.length || 0,
    totalConditions: perfilMongo.condicionesSalud?.length || 0,
    totalAllergies: perfilMongo.alergiasAlimentarias?.length || 0,
    riskLevel: calcularNivelRiesgo(perfilMongo)
  } : {
    activeGoals: 0,
    totalConditions: 0,
    totalAllergies: 0,
    riskLevel: null
  };
  
  const bmi = perfilMongo?.imc || null;
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

  if (cargandoPerfil) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando perfil...</Text>
      </View>
    );
  }

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
            {perfilMongo && (
              <View style={styles.completeBadge}>
                <IconButton icon="check-decagram" size={16} iconColor="#2E7D32" />
                <Text variant="bodySmall" style={styles.completeText}>
                  Perfil Completo
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
        <Card.Title 
          title="Resumen de Salud" 
          right={(props) => (
            <IconButton 
              {...props} 
              icon="refresh" 
              onPress={cargarPerfilDesdeMongoDB}
            />
          )}
        />
        <Card.Content>
          {perfilMongo ? (
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
                  Objetivos
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
          ) : (
            <Text variant="bodyMedium" style={styles.emptyText}>
              Completa el cuestionario de salud para ver tus estadísticas
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Información Detallada */}
      {perfilMongo && (
        <Card style={styles.card}>
          <Card.Title title="Información Personal" />
          <Card.Content>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Edad:</Text>
              <Text variant="bodyMedium">{perfilMongo.edad} años</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Peso:</Text>
              <Text variant="bodyMedium">{perfilMongo.peso} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Altura:</Text>
              <Text variant="bodyMedium">{perfilMongo.altura} cm</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Actividad:</Text>
              <Text variant="bodyMedium">
                {perfilMongo.nivelActividad === 'sedentary' ? 'Sedentario' :
                 perfilMongo.nivelActividad === 'light' ? 'Ligero' :
                 perfilMongo.nivelActividad === 'moderate' ? 'Moderado' :
                 perfilMongo.nivelActividad === 'active' ? 'Activo' : 'Muy Activo'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Género:</Text>
              <Text variant="bodyMedium">
                {perfilMongo.genero === 'male' ? 'Masculino' :
                 perfilMongo.genero === 'female' ? 'Femenino' : 'Otro'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>Fumador:</Text>
              <Text variant="bodyMedium">{perfilMongo.fumador ? 'Sí' : 'No'}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Navegación */}
      <Card style={styles.card}>
        <List.Item
          title="Actualizar Cuestionario"
          description="Modificar condiciones o preferencias"
          left={props => <List.Icon {...props} icon="clipboard-text" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('HealthQuestionnaire')}
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
                stats.riskLevel === 'high' ? '🔴 Alto' :
                stats.riskLevel === 'medium' ? '🟡 Moderado' : '🟢 Bajo'
              }
            </Text>
            <Text variant="bodyMedium" style={styles.riskDescription}>
              {stats.riskLevel === 'high' 
                ? 'Te recomendamos consultar con un especialista regularmente y monitorear tus condiciones de cerca.'
                : stats.riskLevel === 'medium'
                ? 'Mantén un seguimiento constante de tu salud y sigue las recomendaciones médicas.'
                : '¡Excelente! Continúa con tus buenos hábitos y mantén un estilo de vida saludable.'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  completeText: {
    color: '#2E7D32',
    marginLeft: -8,
    fontWeight: '600',
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
    textAlign: 'center',
  },
  statCategory: {
    marginTop: 4,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontWeight: '600',
    color: '#666',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  riskCard: {
    borderLeftWidth: 4,
  },
  riskTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  riskDescription: {
    color: '#666',
    lineHeight: 20,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
    borderColor: '#D32F2F',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    color: '#999',
  },
});