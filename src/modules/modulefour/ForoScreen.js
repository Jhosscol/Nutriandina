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
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

const API_URL = 'http://192.168.1.8:3000/api';

export default function ForoScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');
  const [newComment, setNewComment] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { id: null, label: 'Todos', icon: 'apps' },
    { id: 'tips', label: 'Tips', icon: 'bulb' },
    { id: 'experiencia', label: 'Experiencias', icon: 'heart' },
    { id: 'alimentos', label: 'Alimentos', icon: 'nutrition' },
    { id: 'general', label: 'General', icon: 'chatbubbles' }
  ];

  useEffect(() => {
    loadPosts();
  }, [selectedCategory]);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const loadPosts = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);

      const token = await getToken();
      const url = selectedCategory
        ? `${API_URL}/forum?category=${selectedCategory}&page=${pageNum}&limit=20`
        : `${API_URL}/forum?page=${pageNum}&limit=20`;

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(url, { headers });
      const data = await response.json();

      if (append) {
        setPosts([...posts, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setHasMore(data.pagination.page < data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
      Alert.alert('Error', 'No se pudieron cargar los posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'El contenido no puede estar vacío');
      return;
    }

    if (newPostContent.length > 500) {
      Alert.alert('Error', 'El contenido no puede exceder 500 caracteres');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión para publicar');
        return;
      }

      const response = await fetch(`${API_URL}/forum`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newPostContent,
          category: newPostCategory,
          tags: []
        })
      });

      if (response.ok) {
        Alert.alert('¡Éxito!', 'Post publicado correctamente');
        setShowNewPostModal(false);
        setNewPostContent('');
        setNewPostCategory('general');
        loadPosts();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'No se pudo publicar el post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Hubo un problema al publicar');
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión para dar like');
        return;
      }

      const response = await fetch(`${API_URL}/forum/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Actualizar el post localmente
        setPosts(posts.map(post => {
          if (post._id === postId) {
            const liked = post.isLikedByUser;
            return {
              ...post,
              isLikedByUser: !liked,
              likesCount: liked ? post.likesCount - 1 : post.likesCount + 1
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'El comentario no puede estar vacío');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión para comentar');
        return;
      }

      const response = await fetch(`${API_URL}/forum/${selectedPost._id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        // Recargar el post con comentarios actualizados
        const postResponse = await fetch(`${API_URL}/forum/${selectedPost._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const updatedPost = await postResponse.json();
        setSelectedPost(updatedPost);

        // Actualizar en la lista
        setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'No se pudo agregar el comentario');
    }
  };

  const handleDeletePost = async (postId) => {
    Alert.alert(
      'Eliminar Post',
      '¿Estás seguro de que deseas eliminar este post?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              const response = await fetch(`${API_URL}/forum/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (response.ok) {
                setPosts(posts.filter(p => p._id !== postId));
                Alert.alert('Éxito', 'Post eliminado');
              }
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'No se pudo eliminar el post');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadPosts(page + 1, true);
    }
  };

  const renderPost = ({ item }) => {
    const date = new Date(item.createdAt);
    const timeAgo = getTimeAgo(date);

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View style={styles.postHeaderInfo}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
          {item.category !== 'general' && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          )}
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item._id)}
          >
            <Ionicons
              name={item.isLikedByUser ? 'heart' : 'heart-outline'}
              size={20}
              color={item.isLikedByUser ? '#F44336' : '#666'}
            />
            <Text style={styles.actionText}>{item.likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedPost(item);
              setShowCommentsModal(true);
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{item.commentsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Ahora';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Foro</Text>
        <Text style={styles.headerSubtitle}>Comparte y aprende con la comunidad</Text>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={selectedCategory === item.id ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item.id && styles.categoryChipTextActive
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Posts List */}
      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.postsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore && posts.length > 0 ? (
              <ActivityIndicator size="small" color="#4CAF50" style={{ marginVertical: 20 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ddd" />
              <Text style={styles.emptyText}>No hay posts aún</Text>
              <Text style={styles.emptySubtext}>¡Sé el primero en compartir algo!</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewPostModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* New Post Modal */}
      <Modal
        visible={showNewPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNewPostModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Post</Text>
              <TouchableOpacity onPress={() => setShowNewPostModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={styles.postInput}
                placeholder="¿Qué quieres compartir?"
                multiline
                maxLength={500}
                value={newPostContent}
                onChangeText={setNewPostContent}
                autoFocus
              />

              <Text style={styles.charCount}>
                {newPostContent.length}/500
              </Text>

              <View style={styles.categorySelector}>
                <Text style={styles.label}>Categoría:</Text>
                <View style={styles.categoryButtons}>
                  {categories.slice(1).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryButton,
                        newPostCategory === cat.id && styles.categoryButtonActive
                      ]}
                      onPress={() => setNewPostCategory(cat.id)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          newPostCategory === cat.id && styles.categoryButtonTextActive
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
                  styles.publishButton,
                  !newPostContent.trim() && styles.publishButtonDisabled
                ]}
                onPress={handleCreatePost}
                disabled={!newPostContent.trim()}
              >
                <Text style={styles.publishButtonText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <View style={styles.modalBody}>
                <View style={styles.postPreview}>
                  <Text style={styles.postPreviewContent}>{selectedPost.content}</Text>
                  <Text style={styles.commentsCount}>
                    {selectedPost.commentsCount} comentario(s)
                  </Text>
                </View>

                <FlatList
                  data={selectedPost.comments || []}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                      <View style={styles.avatarTiny}>
                        <Ionicons name="person" size={14} color="#fff" />
                      </View>
                      <View style={styles.commentContent}>
                        <Text style={styles.commentUser}>{item.userEmail}</Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                      </View>
                    </View>
                  )}
                  style={styles.commentsList}
                  ListEmptyComponent={
                    <Text style={styles.noComments}>No hay comentarios aún</Text>
                  }
                />

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
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  categoriesList: {
    paddingHorizontal: 15,
    paddingVertical: 12
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
    gap: 6
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50'
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666'
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  postsList: {
    padding: 15,
    paddingBottom: 80
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  postHeaderInfo: {
    flex: 1
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  },
  categoryBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600'
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 20
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionText: {
    fontSize: 14,
    color: '#666'
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
    fontSize: 18,
    fontWeight: '600',
    color: '#999'
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#ccc'
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
  postInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 10
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginBottom: 20
  },
  categorySelector: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10
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
  publishButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  publishButtonDisabled: {
    backgroundColor: '#ccc'
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  postPreview: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15
  },
  postPreviewContent: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8
  },
  commentsCount: {
    fontSize: 12,
    color: '#666'
  },
  commentsList: {
    maxHeight: 300,
    marginBottom: 15
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15
  },
  avatarTiny: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  commentContent: {
    flex: 1
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  noComments: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    paddingVertical: 20
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
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