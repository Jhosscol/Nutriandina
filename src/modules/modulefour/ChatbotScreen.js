import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';

const API_URL = 'http://192.168.1.8:3000/api';

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadSuggestions();
    // Mensaje de bienvenida
    setMessages([{
      _id: 'welcome',
      role: 'assistant',
      content: '¡Hola! 👋 Soy tu asistente nutricional. Puedo ayudarte con información sobre alimentación saludable, recetas andinas, y responder tus dudas sobre nutrición. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }]);
  }, []);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const loadSuggestions = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/chatbot/suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const sendMessage = async (text) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    setShowSuggestions(false);
    setInputText('');

    // Agregar mensaje del usuario
    const userMessage = {
      _id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Debes iniciar sesión para usar el chatbot');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          conversationId
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Actualizar conversationId si es una nueva conversación
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }

        // Agregar respuesta del bot
        const botMessage = {
          _id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(data.timestamp)
        };

        setMessages(prev => [...prev, botMessage]);

        // Scroll al final
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'No se pudo enviar el mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Hubo un problema al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleNewConversation = () => {
    Alert.alert(
      'Nueva Conversación',
      '¿Deseas iniciar una nueva conversación? Se perderá el historial actual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar nueva',
          onPress: () => {
            setConversationId(null);
            setMessages([{
              _id: 'welcome-new',
              role: 'assistant',
              content: '¡Nueva conversación iniciada! ¿En qué puedo ayudarte?',
              timestamp: new Date()
            }]);
            setShowSuggestions(true);
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    const time = new Date(item.timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer
      ]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="nutrition" size={20} color="#fff" />
          </View>
        )}

        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.botText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isUser ? styles.userTime : styles.botTime
          ]}>
            {time}
          </Text>
        </View>

        {isUser && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Ionicons name="nutrition" size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Nutribot</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? 'Escribiendo...' : 'En línea'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={handleNewConversation}
        >
          <Ionicons name="add-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={
          loading && (
            <View style={styles.typingIndicator}>
              <View style={styles.botAvatar}>
                <Ionicons name="nutrition" size={20} color="#fff" />
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            </View>
          )
        }
      />

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && messages.length <= 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Preguntas sugeridas:</Text>
          <View style={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Ionicons name="bulb-outline" size={16} color="#4CAF50" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu pregunta..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || loading) && styles.sendButtonDisabled
          ]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() && !loading ? '#fff' : '#999'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2
  },
  newChatButton: {
    padding: 8
  },
  messagesList: {
    padding: 15,
    paddingBottom: 10
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
    maxWidth: '85%'
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  botMessageContainer: {
    alignSelf: 'flex-start'
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%'
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4
  },
  userText: {
    color: '#fff'
  },
  botText: {
    color: '#333'
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right'
  },
  botTime: {
    color: '#999'
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15
  },
  typingBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999'
  },
  suggestionsContainer: {
    padding: 15,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10
  },
  suggestionsList: {
    gap: 8
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0'
  }
});