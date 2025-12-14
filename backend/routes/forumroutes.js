const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

/**
 * MÓDULO DE FORO (FORUM)
 * Permite a los usuarios compartir tips, experiencias y alimentos
 * Similar a Twitter/X
 */

module.exports = (db, verificarToken, verificarTokenOpcional) => {
  
  // ===== CREAR NUEVO POST =====
  router.post('/', verificarToken, async (req, res) => {
    try {
      const { content, category, tags, images } = req.body;

      // Validaciones
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ 
          error: 'El contenido es requerido'
        });
      }

      if (content.length > 500) {
        return res.status(400).json({ 
          error: 'El contenido no puede exceder 500 caracteres'
        });
      }

      // Crear post
      const post = {
        userId: req.user.uid,
        userEmail: req.user.email,
        content,
        category: category || 'general', // tips, experiencia, alimentos, general
        tags: tags || [],
        images: images || [],
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        isEdited: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('forum_posts').insertOne(post);

      console.log('✅ Post creado:', result.insertedId);

      res.status(201).json({
        success: true,
        message: 'Post creado exitosamente',
        data: { ...post, _id: result.insertedId }
      });

    } catch (error) {
      console.error('❌ Error al crear post:', error);
      res.status(500).json({ 
        error: 'Error al crear post',
        message: error.message 
      });
    }
  });

  // ===== OBTENER POSTS (FEED) =====
  router.get('/', verificarTokenOpcional, async (req, res) => {
    try {
      console.log('📡 GET /api/forum - Obteniendo posts...');
      
      const { category, page = 1, limit = 20 } = req.query;
      
      let filter = {};
      if (category) {
        filter.category = category;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      console.log('🔍 Filtros:', filter);
      console.log('📄 Paginación: page', page, 'limit', limit, 'skip', skip);

      const posts = await db.collection('forum_posts')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      console.log('📦 Posts encontrados:', posts.length);

      // Obtener información de usuarios
      const userIds = [...new Set(posts.map(p => p.userId))];
      
      let usersMap = {};
      
      if (userIds.length > 0) {
        const users = await db.collection('perfiles_salud')
          .find({ userId: { $in: userIds } })
          .project({ userId: 1, nombre: 1 })
          .toArray();

        users.forEach(u => {
          usersMap[u.userId] = u.nombre || 'Usuario';
        });
      }

      // Enriquecer posts con info de usuario
      const enrichedPosts = posts.map(post => ({
        ...post,
        userName: usersMap[post.userId] || 'Usuario',
        isLikedByUser: req.user ? post.likes.includes(req.user.uid) : false
      }));

      const total = await db.collection('forum_posts').countDocuments(filter);

      const response = {
        posts: enrichedPosts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

      console.log('✅ Respuesta:', {
        postsCount: enrichedPosts.length,
        pagination: response.pagination
      });

      res.json(response);

    } catch (error) {
      console.error('❌ Error en GET /forum:', error);
      res.status(500).json({ 
        error: 'Error al obtener posts',
        message: error.message 
      });
    }
  });

  // ===== OBTENER POSTS DEL USUARIO (DEBE IR ANTES DE /:id) =====
  router.get('/user/me', verificarToken, async (req, res) => {
    try {
      console.log('📡 GET /api/forum/user/me');
      
      const posts = await db.collection('forum_posts')
        .find({ userId: req.user.uid })
        .sort({ createdAt: -1 })
        .toArray();

      // Obtener nombre del usuario
      const user = await db.collection('perfiles_salud').findOne(
        { userId: req.user.uid },
        { projection: { nombre: 1 } }
      );

      // Enriquecer posts con info de usuario
      const enrichedPosts = posts.map(post => ({
        ...post,
        userName: user?.nombre || 'Usuario',
        isLikedByUser: post.likes.includes(req.user.uid)
      }));

      // Mantener la misma estructura que el feed
      res.json({
        posts: enrichedPosts,
        pagination: {
          page: 1,
          limit: enrichedPosts.length,
          total: enrichedPosts.length,
          pages: 1
        }
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener posts',
        message: error.message 
      });
    }
  });

  // ===== OBTENER POST POR ID =====
  router.get('/:id', verificarTokenOpcional, async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const post = await db.collection('forum_posts').findOne({
        _id: new ObjectId(id)
      });

      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      // Obtener nombre del usuario
      const user = await db.collection('perfiles_salud').findOne(
        { userId: post.userId },
        { projection: { nombre: 1 } }
      );

      const enrichedPost = {
        ...post,
        userName: user?.nombre || 'Usuario',
        isLikedByUser: req.user ? post.likes.includes(req.user.uid) : false
      };

      res.json(enrichedPost);

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener post',
        message: error.message 
      });
    }
  });

  // ===== ACTUALIZAR POST =====
  router.put('/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { content, category, tags } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const updates = {
        isEdited: true,
        updatedAt: new Date()
      };

      if (content) updates.content = content;
      if (category) updates.category = category;
      if (tags) updates.tags = tags;

      const result = await db.collection('forum_posts').updateOne(
        { 
          _id: new ObjectId(id),
          userId: req.user.uid
        },
        { $set: updates }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          error: 'Post no encontrado o no tienes permiso'
        });
      }

      res.json({ 
        success: true,
        message: 'Post actualizado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al actualizar post',
        message: error.message 
      });
    }
  });

  // ===== ELIMINAR POST =====
  router.delete('/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const result = await db.collection('forum_posts').deleteOne({
        _id: new ObjectId(id),
        userId: req.user.uid
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          error: 'Post no encontrado o no tienes permiso'
        });
      }

      res.json({ 
        success: true,
        message: 'Post eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al eliminar post',
        message: error.message 
      });
    }
  });

  // ===== DAR LIKE A UN POST =====
  router.post('/:id/like', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const post = await db.collection('forum_posts').findOne({
        _id: new ObjectId(id)
      });

      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      const hasLiked = post.likes.includes(userId);

      let updateOperation;
      if (hasLiked) {
        // Quitar like
        updateOperation = {
          $pull: { likes: userId },
          $inc: { likesCount: -1 },
          $set: { updatedAt: new Date() }
        };
      } else {
        // Agregar like
        updateOperation = {
          $addToSet: { likes: userId },
          $inc: { likesCount: 1 },
          $set: { updatedAt: new Date() }
        };
      }

      await db.collection('forum_posts').updateOne(
        { _id: new ObjectId(id) },
        updateOperation
      );

      res.json({ 
        success: true,
        liked: !hasLiked,
        message: hasLiked ? 'Like removido' : 'Like agregado'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al dar like',
        message: error.message 
      });
    }
  });

  // ===== AGREGAR COMENTARIO =====
  router.post('/:id/comments', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ 
          error: 'El contenido del comentario es requerido'
        });
      }

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const comment = {
        _id: new ObjectId(),
        userId: req.user.uid,
        userEmail: req.user.email,
        content,
        createdAt: new Date()
      };

      const result = await db.collection('forum_posts').updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { comments: comment },
          $inc: { commentsCount: 1 },
          $set: { updatedAt: new Date() }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      res.status(201).json({
        success: true,
        message: 'Comentario agregado',
        data: comment
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al agregar comentario',
        message: error.message 
      });
    }
  });

  // ===== ELIMINAR COMENTARIO =====
  router.delete('/:postId/comments/:commentId', verificarToken, async (req, res) => {
    try {
      const { postId, commentId } = req.params;

      if (!ObjectId.isValid(postId) || !ObjectId.isValid(commentId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const result = await db.collection('forum_posts').updateOne(
        { 
          _id: new ObjectId(postId),
          'comments._id': new ObjectId(commentId),
          'comments.userId': req.user.uid
        },
        {
          $pull: { comments: { _id: new ObjectId(commentId) } },
          $inc: { commentsCount: -1 },
          $set: { updatedAt: new Date() }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          error: 'Comentario no encontrado o no tienes permiso'
        });
      }

      res.json({ 
        success: true,
        message: 'Comentario eliminado'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al eliminar comentario',
        message: error.message 
      });
    }
  });

  return router;
};