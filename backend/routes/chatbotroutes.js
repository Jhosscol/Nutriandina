const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

/**
 * MÓDULO DE CHATBOT
 * Chatbot con integración de OpenAI para consultas sobre nutrición
 */

module.exports = (db, verificarToken) => {
  
  // ===== ENVIAR MENSAJE AL CHATBOT =====
  router.post('/chat', verificarToken, async (req, res) => {
    try {
      const { message, conversationId } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ 
          error: 'El mensaje es requerido'
        });
      }

      // Obtener o crear conversación
      let conversation;
      
      if (conversationId && ObjectId.isValid(conversationId)) {
        conversation = await db.collection('chatbot_conversations').findOne({
          _id: new ObjectId(conversationId),
          userId: req.user.uid
        });
      }

      if (!conversation) {
        // Crear nueva conversación
        conversation = {
          userId: req.user.uid,
          userEmail: req.user.email,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const result = await db.collection('chatbot_conversations').insertOne(conversation);
        conversation._id = result.insertedId;
      }

      // Agregar mensaje del usuario
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      // Obtener contexto del usuario (perfil de salud)
      const userProfile = await db.collection('perfiles_salud').findOne({
        userId: req.user.uid
      });

      // Preparar contexto para OpenAI
      const systemContext = `Eres un asistente nutricional especializado en alimentos andinos y nutrición saludable. 
Tu objetivo es ayudar a las personas con consejos sobre alimentación, recetas saludables y planes nutricionales.
Enfócate en ingredientes andinos como quinua, kiwicha, maca, cañihua, y otros superalimentos de la región.
${userProfile ? `
Información del usuario:
- Edad: ${userProfile.edad} años
- Género: ${userProfile.genero}
- Peso: ${userProfile.peso} kg
- Altura: ${userProfile.altura} cm
- IMC: ${userProfile.imc}
- Objetivo de salud: ${userProfile.objetivoSalud}
- Nivel de actividad: ${userProfile.nivelActividad}
` : ''}
Responde de manera clara, amigable y educativa.`;

      // Preparar historial de mensajes para OpenAI
      const messages = [
        { role: 'system', content: systemContext },
        ...conversation.messages.slice(-10).map(m => ({ // Últimos 10 mensajes
          role: m.role,
          content: m.content
        })),
        { role: 'user', content: message }
      ];

      // Llamar a OpenAI API
      let aiResponse;
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: messages,
            max_tokens: 800,
            temperature: 0.7
          })
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const data = await openaiResponse.json();
        aiResponse = data.choices[0].message.content;

      } catch (aiError) {
        console.error('❌ Error con OpenAI:', aiError);
        
        // Respuesta fallback si OpenAI falla
        aiResponse = `Lo siento, estoy teniendo problemas técnicos en este momento. 
Por favor, intenta nuevamente en unos momentos o consulta nuestras recetas y planes nutricionales disponibles en la app.`;
      }

      // Crear mensaje del asistente
      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      // Guardar ambos mensajes en la conversación
      await db.collection('chatbot_conversations').updateOne(
        { _id: conversation._id },
        {
          $push: {
            messages: {
              $each: [userMessage, assistantMessage]
            }
          },
          $set: { updatedAt: new Date() }
        }
      );

      console.log('✅ Mensaje procesado:', conversation._id);

      res.json({
        success: true,
        conversationId: conversation._id.toString(),
        message: aiResponse,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Error en chatbot:', error);
      res.status(500).json({ 
        error: 'Error al procesar mensaje',
        message: error.message 
      });
    }
  });

  // ===== OBTENER CONVERSACIONES DEL USUARIO =====
  router.get('/conversations', verificarToken, async (req, res) => {
    try {
      const conversations = await db.collection('chatbot_conversations')
        .find({ userId: req.user.uid })
        .sort({ updatedAt: -1 })
        .project({
          title: 1,
          createdAt: 1,
          updatedAt: 1,
          messageCount: { $size: '$messages' }
        })
        .toArray();

      res.json(conversations);

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener conversaciones',
        message: error.message 
      });
    }
  });

  // ===== OBTENER UNA CONVERSACIÓN ESPECÍFICA =====
  router.get('/conversations/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const conversation = await db.collection('chatbot_conversations').findOne({
        _id: new ObjectId(id),
        userId: req.user.uid
      });

      if (!conversation) {
        return res.status(404).json({ 
          error: 'Conversación no encontrada'
        });
      }

      res.json(conversation);

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener conversación',
        message: error.message 
      });
    }
  });

  // ===== ELIMINAR CONVERSACIÓN =====
  router.delete('/conversations/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const result = await db.collection('chatbot_conversations').deleteOne({
        _id: new ObjectId(id),
        userId: req.user.uid
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          error: 'Conversación no encontrada'
        });
      }

      res.json({ 
        success: true,
        message: 'Conversación eliminada'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al eliminar conversación',
        message: error.message 
      });
    }
  });

  // ===== LIMPIAR TODAS LAS CONVERSACIONES =====
  router.delete('/conversations', verificarToken, async (req, res) => {
    try {
      const result = await db.collection('chatbot_conversations').deleteMany({
        userId: req.user.uid
      });

      res.json({ 
        success: true,
        deletedCount: result.deletedCount,
        message: 'Conversaciones eliminadas'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al eliminar conversaciones',
        message: error.message 
      });
    }
  });

  // ===== OBTENER SUGERENCIAS DE PREGUNTAS =====
  router.get('/suggestions', verificarToken, async (req, res) => {
    try {
      // Obtener perfil del usuario para personalizar sugerencias
      const userProfile = await db.collection('perfiles_salud').findOne({
        userId: req.user.uid
      });

      let suggestions = [
        '¿Qué beneficios tiene la quinua?',
        '¿Cómo puedo preparar kiwicha?',
        'Dame recetas saludables con ingredientes andinos',
        '¿Qué alimentos me ayudan a aumentar masa muscular?',
        '¿Cuál es una dieta balanceada para mi?'
      ];

      // Personalizar según objetivo de salud
      if (userProfile?.objetivoSalud === 'perdida_peso') {
        suggestions.unshift('¿Qué alimentos me ayudan a perder peso de forma saludable?');
      } else if (userProfile?.objetivoSalud === 'ganancia_muscular') {
        suggestions.unshift('¿Qué debo comer para ganar músculo?');
      }

      res.json({ suggestions });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener sugerencias',
        message: error.message 
      });
    }
  });

  return router;
};