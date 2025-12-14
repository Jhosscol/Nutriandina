const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

/**
 * MÓDULO DE BLOGS
 * Recomendaciones de videos educativos y URLs sobre alimentación
 */

module.exports = (db, verificarToken, verificarTokenOpcional) => {
  
  // ===== CREAR NUEVO BLOG/RECOMENDACIÓN =====
  router.post('/', verificarToken, async (req, res) => {
    try {
      const { 
        title, 
        description, 
        url, 
        type, // video, article, website
        category,
        tags,
        thumbnailUrl
      } = req.body;

      // Validaciones
      if (!title || !url) {
        return res.status(400).json({ 
          error: 'Título y URL son requeridos'
        });
      }

      // Validar que sea una URL válida
      try {
        new URL(url);
      } catch (e) {
        return res.status(400).json({ 
          error: 'URL inválida'
        });
      }

      // Crear blog
      const blog = {
        userId: req.user.uid,
        userEmail: req.user.email,
        title,
        description: description || '',
        url,
        type: type || 'article', // video, article, website
        category: category || 'general', // nutricion, recetas, salud, fitness, general
        tags: tags || [],
        thumbnailUrl: thumbnailUrl || '',
        views: 0,
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('blogs').insertOne(blog);

      console.log('✅ Blog creado:', result.insertedId);

      res.status(201).json({
        success: true,
        message: 'Recomendación creada exitosamente',
        data: { ...blog, _id: result.insertedId }
      });

    } catch (error) {
      console.error('❌ Error al crear blog:', error);
      res.status(500).json({ 
        error: 'Error al crear recomendación',
        message: error.message 
      });
    }
  });

  // ===== OBTENER BLOGS (CON FILTROS) =====
  router.get('/', verificarTokenOpcional, async (req, res) => {
    try {
      const { 
        category, 
        type, 
        search,
        page = 1, 
        limit = 20 
      } = req.query;
      
      let filter = { isActive: true };
      
      if (category) {
        filter.category = category;
      }
      
      if (type) {
        filter.type = type;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const blogs = await db.collection('blogs')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      // Obtener información de usuarios
      const userIds = [...new Set(blogs.map(b => b.userId))];
      const users = await db.collection('perfiles_salud')
        .find({ userId: { $in: userIds } })
        .project({ userId: 1, nombre: 1 })
        .toArray();

      const usersMap = {};
      users.forEach(u => {
        usersMap[u.userId] = u.nombre || 'Usuario';
      });

      // Enriquecer blogs con info de usuario
      const enrichedBlogs = blogs.map(blog => ({
        ...blog,
        userName: usersMap[blog.userId] || 'Usuario',
        isLikedByUser: req.user ? blog.likes.includes(req.user.uid) : false
      }));

      const total = await db.collection('blogs').countDocuments(filter);

      res.json({
        blogs: enrichedBlogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener recomendaciones',
        message: error.message 
      });
    }
  });

  // ===== OBTENER BLOG POR ID =====
  router.get('/:id', verificarTokenOpcional, async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      // Incrementar contador de vistas
      await db.collection('blogs').updateOne(
        { _id: new ObjectId(id) },
        { $inc: { views: 1 } }
      );

      const blog = await db.collection('blogs').findOne({
        _id: new ObjectId(id)
      });

      if (!blog) {
        return res.status(404).json({ error: 'Recomendación no encontrada' });
      }

      // Obtener nombre del usuario
      const user = await db.collection('perfiles_salud').findOne(
        { userId: blog.userId },
        { projection: { nombre: 1 } }
      );

      const enrichedBlog = {
        ...blog,
        userName: user?.nombre || 'Usuario',
        isLikedByUser: req.user ? blog.likes.includes(req.user.uid) : false
      };

      res.json(enrichedBlog);

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener recomendación',
        message: error.message 
      });
    }
  });

  // ===== ACTUALIZAR BLOG =====
  router.put('/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, url, type, category, tags, thumbnailUrl } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const updates = { updatedAt: new Date() };

      if (title) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (url) updates.url = url;
      if (type) updates.type = type;
      if (category) updates.category = category;
      if (tags) updates.tags = tags;
      if (thumbnailUrl !== undefined) updates.thumbnailUrl = thumbnailUrl;

      const result = await db.collection('blogs').updateOne(
        { 
          _id: new ObjectId(id),
          userId: req.user.uid
        },
        { $set: updates }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          error: 'Recomendación no encontrada o no tienes permiso'
        });
      }

      res.json({ 
        success: true,
        message: 'Recomendación actualizada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al actualizar recomendación',
        message: error.message 
      });
    }
  });

  // ===== ELIMINAR BLOG =====
  router.delete('/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      // Soft delete
      const result = await db.collection('blogs').updateOne(
        {
          _id: new ObjectId(id),
          userId: req.user.uid
        },
        {
          $set: {
            isActive: false,
            deletedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          error: 'Recomendación no encontrada o no tienes permiso'
        });
      }

      res.json({ 
        success: true,
        message: 'Recomendación eliminada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al eliminar recomendación',
        message: error.message 
      });
    }
  });

  // ===== DAR LIKE A UN BLOG =====
  router.post('/:id/like', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const blog = await db.collection('blogs').findOne({
        _id: new ObjectId(id)
      });

      if (!blog) {
        return res.status(404).json({ error: 'Recomendación no encontrada' });
      }

      const hasLiked = blog.likes.includes(userId);

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

      await db.collection('blogs').updateOne(
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

      const result = await db.collection('blogs').updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { comments: comment },
          $inc: { commentsCount: 1 },
          $set: { updatedAt: new Date() }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Recomendación no encontrada' });
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

  // ===== OBTENER RECOMENDACIONES POPULARES =====
  router.get('/featured/popular', verificarTokenOpcional, async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const blogs = await db.collection('blogs')
        .find({ isActive: true })
        .sort({ views: -1, likesCount: -1 })
        .limit(parseInt(limit))
        .toArray();

      res.json(blogs);

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener recomendaciones populares',
        message: error.message 
      });
    }
  });

  // ===== OBTENER MIS RECOMENDACIONES =====
  router.get('/user/me', verificarToken, async (req, res) => {
    try {
      const blogs = await db.collection('blogs')
        .find({ userId: req.user.uid, isActive: true })
        .sort({ createdAt: -1 })
        .toArray();

      res.json(blogs);

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener recomendaciones',
        message: error.message 
      });
    }
  });

  return router;
};