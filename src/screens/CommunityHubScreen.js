// src/screens/CommunityHubScreen.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, FAB, Text } from 'react-native-paper';

export default function CommunityHubScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular carga
    setTimeout(() => setRefreshing(false), 1000);
  };

  const communityStats = {
    members: 1234,
    discussions: 567,
    articles: 89,
    activeNow: 45,
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.headerInfo}>
                <Text variant="headlineSmall" style={styles.title}>
                  Community Hub
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Conecta, aprende y comparte
                </Text>
              </View>
              <MaterialCommunityIcons name="account-group" size={60} color="#2E7D32" />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-multiple" size={20} color="#2E7D32" />
                <Text variant="labelSmall" style={styles.statLabel}>
                  {communityStats.members} miembros
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="circle" size={12} color="#4CAF50" />
                <Text variant="labelSmall" style={styles.statLabel}>
                  {communityStats.activeNow} activos
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Estadísticas Grid */}
        <Card style={styles.card}>
          <Card.Title
            title="Actividad de la Comunidad"
            titleVariant="titleLarge"
            left={(props) => <MaterialCommunityIcons name="chart-line" {...props} size={24} color="#2E7D32" />}
          />
          <Card.Content>
            <View style={styles.statsGrid}>
              <View style={styles.gridItem}>
                <MaterialCommunityIcons name="forum" size={32} color="#2E7D32" />
                <Text variant="headlineSmall" style={styles.gridValue}>
                  {communityStats.discussions}
                </Text>
                <Text variant="bodySmall" style={styles.gridLabel}>Discusiones</Text>
              </View>
              <View style={styles.gridItem}>
                <MaterialCommunityIcons name="book-open-variant" size={32} color="#388E3C" />
                <Text variant="headlineSmall" style={styles.gridValue}>
                  {communityStats.articles}
                </Text>
                <Text variant="bodySmall" style={styles.gridLabel}>Artículos</Text>
              </View>
              <View style={styles.gridItem}>
                <MaterialCommunityIcons name="account-group" size={32} color="#43A047" />
                <Text variant="headlineSmall" style={styles.gridValue}>
                  {communityStats.members}
                </Text>
                <Text variant="bodySmall" style={styles.gridLabel}>Miembros</Text>
              </View>
              <View style={styles.gridItem}>
                <MaterialCommunityIcons name="star" size={32} color="#66BB6A" />
                <Text variant="headlineSmall" style={styles.gridValue}>
                  4.8
                </Text>
                <Text variant="bodySmall" style={styles.gridLabel}>Rating</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Foro Card */}
        <Card style={styles.card} onPress={() => navigation.navigate('ForoMain')}>
          <Card.Content>
            <View style={styles.featureRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="forum" size={32} color="#2E7D32" />
              </View>
              <View style={styles.featureInfo}>
                <Text variant="titleLarge" style={styles.featureTitle}>Foro Comunitario</Text>
                <Text variant="bodyMedium" style={styles.featureDescription}>
                  Participa en discusiones y comparte experiencias
                </Text>
                <View style={styles.chipRow}>
                  <Chip icon="fire" compact style={styles.chip}>
                    Tendencias
                  </Chip>
                  <Chip icon="new-box" compact style={styles.chip}>
                    15 nuevas
                  </Chip>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </View>
          </Card.Content>
        </Card>

        {/* Blogs Card */}
        <Card style={styles.card} onPress={() => navigation.navigate('Blogs')}>
          <Card.Content>
            <View style={styles.featureRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="book-open-variant" size={32} color="#388E3C" />
              </View>
              <View style={styles.featureInfo}>
                <Text variant="titleLarge" style={styles.featureTitle}>Blogs y Artículos</Text>
                <Text variant="bodyMedium" style={styles.featureDescription}>
                  Lee y comparte contenido interesante
                </Text>
                <View style={styles.chipRow}>
                  <Chip icon="eye" compact style={styles.chip}>
                    1.2k vistas
                  </Chip>
                  <Chip icon="pencil" compact style={styles.chip}>
                    {communityStats.articles} posts
                  </Chip>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </View>
          </Card.Content>
        </Card>

        {/* Chatbot Card */}
        <Card style={styles.card} onPress={() => navigation.navigate('Chatbot')}>
          <Card.Content>
            <View style={styles.featureRow}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialCommunityIcons name="robot" size={32} color="#43A047" />
              </View>
              <View style={styles.featureInfo}>
                <Text variant="titleLarge" style={styles.featureTitle}>Asistente IA</Text>
                <Text variant="bodyMedium" style={styles.featureDescription}>
                  Obtén respuestas instantáneas con IA
                </Text>
                <View style={styles.chipRow}>
                  <Chip icon="flash" compact style={styles.chip}>
                    Rápido
                  </Chip>
                  <Chip icon="clock" compact style={styles.chip}>
                    24/7
                  </Chip>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
            </View>
          </Card.Content>
        </Card>

        {/* Características */}
        <Card style={styles.card}>
          <Card.Title
            title="¿Qué ofrece la comunidad?"
            titleVariant="titleLarge"
            left={(props) => <MaterialCommunityIcons name="information" {...props} size={24} color="#2E7D32" />}
          />
          <Card.Content>
            <View style={styles.benefitRow}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.benefitText}>Discusiones en tiempo real</Text>
            </View>
            <View style={styles.benefitRow}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.benefitText}>Contenido educativo de calidad</Text>
            </View>
            <View style={styles.benefitRow}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.benefitText}>Asistente inteligente disponible</Text>
            </View>
            <View style={styles.benefitRow}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.benefitText}>Conexión con expertos</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Acciones Rápidas */}
        <Card style={styles.card}>
          <Card.Title title="Acciones Rápidas" titleVariant="titleLarge" />
          <Card.Content>
            <View style={styles.actionsGrid}>
              <Button
                mode="outlined"
                icon="forum"
                onPress={() => navigation.navigate('ForoMain')}
                style={styles.actionButton}
              >
                Ir al Foro
              </Button>
              <Button
                mode="outlined"
                icon="pencil"
                onPress={() => navigation.navigate('Blogs')}
                style={styles.actionButton}
              >
                Escribir Blog
              </Button>
              <Button
                mode="outlined"
                icon="chat"
                onPress={() => navigation.navigate('Chatbot')}
                style={styles.actionButton}
              >
                Chat IA
              </Button>
              <Button
                mode="outlined"
                icon="bell"
                onPress={() => {}}
                style={styles.actionButton}
              >
                Notificaciones
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        label="Nueva Publicación"
        style={styles.fab}
        onPress={() => navigation.navigate('ForoMain')}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingVertical: 30,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#E8F5E9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  statLabel: {
    color: '#666',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 12,
  },
  gridValue: {
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  gridLabel: {
    color: '#666',
    marginTop: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: '#666',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2E7D32',
  },
});