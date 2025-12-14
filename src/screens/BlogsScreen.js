import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

const API_URL = 'http://192.168.1.8:3000/api';

export default function BlogsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showNewBlogModal, setShowNewBlogModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('video');
  const [category, setCategory] = useState('nutricion');
  const [newComment, setNewComment] = useState('');

  const categories = [
    { id: null, label: 'Todos', icon: 'apps' },
    { id: 'nutricion', label: 'Nutrición', icon: 'nutrition' },
    { id: 'recetas', label: 'Recetas', icon: 'restaurant' },
    { id: 'salud', label: 'Salud', icon: 'fitness' },
    { id: 'fitness', label: 'Fitness', icon: 'barbell' }
  ];

  const types = [
    { id: null, label: 'Todos', icon: 'apps' },
    { id: 'video', label: 'Videos', icon: 'videocam' },
    { id: 'article', label: 'Artículos', icon: 'document-text' },
    { id: 'website', label: 'Sitios Web', icon: 'globe' }
  ];

  useEffect(() => {
    loadBlogs();
  }, [selectedCategory, selectedType, searchQuery]);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const loadBlogs = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);

      const token = await getToken();
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedType && { type: selectedType }),
        ...(searchQuery && { search: searchQuery })
      });

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_URL}/blogs?${params}`, { headers });
      const data = await response.json();

      if (append) {
        setBlogs([...blogs, ...data.blogs]);
      } else {
        setBlogs(data.blogs);
      }

      setHasMore(data.pagination.page < data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading blogs:', error);
      Alert.alert('Error', 'No se pudieron cargar las recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async () => {
    if (!title.trim() || !url.trim()) {
      Alert.alert('Error', 'Título y URL son requeridos');
      return;
    }

    // Validar URL
    try {
      new URL(url);
    } catch (e) {
      Alert.alert('Error', 'URL inválida');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión');
        return;
      }

      const response = await fetch(`${API_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          url,
          type,
          category,
          tags: []
        })
      });

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Recomendación publicada');
        setShowNewBlogModal(false);
        resetForm();
        loadBlogs();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'No se pudo publicar');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      Alert.alert('Error', 'Hubo un problema al publicar');
    }
  };

  const handleLike = async (blogId) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión para dar like');
        return;
      }

      const response = await fetch(`${API_URL}/blogs/${blogId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setBlogs(blogs.map(blog => {
          if (blog._id === blogId) {
            const liked = blog.isLikedByUser;
            return {
              ...blog,
              isLikedByUser: !liked,
              likesCount: liked ? blog.likesCount - 1 : blog.likesCount + 1
            };
          }
          return blog;
        }));
      }
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleOpenURL = async (blogId, url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se puede abrir esta URL');
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'No se pudo abrir el enlace');
    }
  };

  const handleViewBlog = async (blog) => {
    setSelectedBlog(blog);
    setShowDetailModal(true);

    // Cargar detalles completos
    try {
      const token = await getToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_URL}/blogs/${blog._id}`, { headers });
      const data = await response.json();
      setSelectedBlog(data);
    } catch (error) {
      console.error('Error loading blog details:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión');
        return;
      }

      const response = await fetch(`${API_URL}/blogs/${selectedBlog._id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        // Recargar detalles
        const blogResponse = await fetch(`${API_URL}/blogs/${selectedBlog._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const updatedBlog = await blogResponse.json();
        setSelectedBlog(updatedBlog);
        setBlogs(blogs.map(b => b._id === updatedBlog._id ? updatedBlog : b));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setType('video');
    setCategory('nutricion');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBlogs();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadBlogs(page + 1, true);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return 'videocam';
      case 'article': return 'document-text';
      case 'website': return 'globe';
      default: return 'link';
    }
  };

  const renderBlog = ({ item }) => (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => handleViewBlog(item)}
    >
      <View style={styles.blogHeader}>
        <View style={styles.typeIcon}>
          <Ionicons name={getTypeIcon(item.type)} size={24} color="#4CAF50" />
        </View>
        <View style={styles.blogHeaderInfo}>
          <Text style={styles.blogTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.blogAuthor}>Por {item.userName}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.blogDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      <View style={styles.blogFooter}>
        <View style={styles.blogStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => handleLike(item._id)}
          >
            <Ionicons
              name={item.isLikedByUser ? 'heart' : 'heart-outline'}
              size={16}
              color={item.isLikedByUser ? '#F44336' : '#666'}
            />
            <Text style={styles.statText}>{item.likesCount}</Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.commentsCount}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.openButton}
          onPress={() => handleOpenURL(item._id, item.url)}
        >
          <Text style={styles.openButtonText}>Abrir</Text>
          <Ionicons name="open-outline" size={16} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {item.category && (
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{item.category}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blogs</Text>
        <Text style={styles.headerSubtitle}>Aprende con contenido de calidad</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar videos, artículos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id || 'all'}
              style={[
                styles.filterChip,
                selectedCategory === cat.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={selectedCategory === cat.id ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat.id && styles.filterChipTextActive
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {types.map((t) => (
            <TouchableOpacity
              key={t.id || 'all'}
              style={[
                styles.filterChip,
                selectedType === t.id && styles.filterChipActive
              ]}
              onPress={() => setSelectedType(t.id)}
            >
              <Ionicons
                name={t.icon}
                size={16}
                color={selectedType === t.id ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedType === t.id && styles.filterChipTextActive
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Blogs List */}
      {loading && blogs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={blogs}
          renderItem={renderBlog}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.blogsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore && blogs.length > 0 ? (
              <ActivityIndicator size="small" color="#4CAF50" style={{ marginVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="library-outline" size={64} color="#ddd" />
              <Text style={styles.emptyText}>No hay recomendaciones</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewBlogModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* New Blog Modal */}
      <Modal
        visible={showNewBlogModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewBlogModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Recomendación</Text>
              <TouchableOpacity onPress={() => setShowNewBlogModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Título *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Los beneficios de la quinua"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>URL *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://..."
                  value={url}
                  onChangeText={setUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe el contenido..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.typeButtons}>
                  {types.slice(1).map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.typeButton,
                        type === t.id && styles.typeButtonActive
                      ]}
                      onPress={() => setType(t.id)}
                    >
                      <Ionicons
                        name={t.icon}
                        size={20}
                        color={type === t.id ? '#fff' : '#666'}
                      />
                      <Text
                        style={[
                          styles.typeButtonText,
                          type === t.id && styles.typeButtonTextActive
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoría</Text>
                <View style={styles.categoryButtons}>
                  {categories.slice(1).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryButton,
                        category === cat.id && styles.categoryButtonActive
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          category === cat.id && styles.categoryButtonTextActive
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!title.trim() || !url.trim()) && styles.submitButtonDisabled
                ]}
                onPress={handleCreateBlog}
                disabled={!title.trim() || !url.trim()}
              >
                <Text style={styles.submitButtonText}>Publicar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedBlog && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.detailTitle}>{selectedBlog.title}</Text>
                <Text style={styles.detailAuthor}>Por {selectedBlog.userName}</Text>

                {selectedBlog.description && (
                  <Text style={styles.detailDescription}>{selectedBlog.description}</Text>
                )}

                <TouchableOpacity
                  style={styles.visitButton}
                  onPress={() => handleOpenURL(selectedBlog._id, selectedBlog.url)}
                >
                  <Ionicons name="open-outline" size={20} color="#fff" />
                  <Text style={styles.visitButtonText}>Visitar enlace</Text>
                </TouchableOpacity>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Ionicons name="eye" size={20} color="#666" />
                    <Text style={styles.statValue}>{selectedBlog.views} vistas</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="heart" size={20} color="#F44336" />
                    <Text style={styles.statValue}>{selectedBlog.likesCount} likes</Text>
                  </View>
                </View>

                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>
                    Comentarios ({selectedBlog.commentsCount})
                  </Text>

                  {selectedBlog.comments && selectedBlog.comments.map((comment) => (
                    <View key={comment._id} style={styles.commentItem}>
                      <Text style={styles.commentUser}>{comment.userEmail}</Text>
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                  ))}

                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChangeText={setNewComment}
                    />
                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      <Ionicons
                        name="send"
                        size={20}
                        color={newComment.trim() ? '#4CAF50' : '#ccc'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9
  },
  searchContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  filterRow: {
    paddingHorizontal: 15,
    marginBottom: 8
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    gap: 4
  },
  filterChipActive: {
    backgroundColor: '#4CAF50'
  },
  filterChipText: {
    fontSize: 13,
    color: '#666'
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  blogsList: {
    padding: 15,
    paddingBottom: 80
  },
  blogCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  blogHeader: {
    flexDirection: 'row',
    marginBottom: 12
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  blogHeaderInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22
  },
  blogAuthor: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  },
  blogDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  blogStats: {
    flexDirection: 'row',
    gap: 15
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statText: {
    fontSize: 13,
    color: '#666'
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  openButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600'
  },
  categoryTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  categoryTagText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600'
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  modalBody: {
    padding: 20
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 6
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50'
  },
  typeButtonText: {
    fontSize: 13,
    color: '#666'
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50'
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666'
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  detailAuthor: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15
  },
  detailDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 20
  },
  visitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statValue: {
    fontSize: 14,
    color: '#666'
  },
  commentsSection: {
    marginTop: 20
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 10
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  }
});