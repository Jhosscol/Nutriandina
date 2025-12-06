const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ====== FIREBASE ADMIN (para verificar tokens) ======
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

console.log('✅ Firebase Admin inicializado');

// ====== MONGODB ======
let db;
const client = new MongoClient(process.env.MONGODB_URI);

client.connect()
  .then(() => {
    db = client.db('nutriandina');
    console.log('✅ MongoDB conectado');
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

// ====== MIDDLEWARE DE AUTENTICACIÓN ======
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token no proporcionado',
        message: 'Debes incluir el token de Firebase en el header Authorization'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Agregar info del usuario al request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    next();
  } catch (error) {
    console.error('Error verificando token:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    }
    
    res.status(401).json({ 
      error: 'Token inválido',
      message: error.message 
    });
  }
};

// ====== RUTAS ======

// Health check (sin autenticación)
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'API Nutriandina + MongoDB funcionando',
    timestamp: new Date().toISOString()
  });
});

// ===== CRUD GENÉRICO =====

// CREATE - Crear documento
app.post('/api/:collection', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const datos = req.body;
    
    const documento = {
      ...datos,
      userId: req.user.uid,
      userEmail: req.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection(coleccion).insertOne(documento);
    
    res.json({ 
      success: true, 
      id: result.insertedId,
      message: 'Documento creado exitosamente'
    });
  } catch (error) {
    console.error('Error en CREATE:', error);
    res.status(500).json({ 
      error: 'Error al crear documento',
      message: error.message 
    });
  }
});

// READ - Obtener todos los documentos del usuario
app.get('/api/:collection', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    
    const documentos = await db.collection(coleccion)
      .find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(documentos);
  } catch (error) {
    console.error('Error en READ:', error);
    res.status(500).json({ 
      error: 'Error al obtener documentos',
      message: error.message 
    });
  }
});

// READ ONE - Obtener un documento específico
app.get('/api/:collection/:id', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const id = req.params.id;
    
    const documento = await db.collection(coleccion).findOne({
      _id: new ObjectId(id),
      userId: req.user.uid
    });
    
    if (!documento) {
      return res.status(404).json({ 
        error: 'Documento no encontrado',
        message: 'El documento no existe o no tienes permisos para verlo'
      });
    }
    
    res.json(documento);
  } catch (error) {
    console.error('Error en READ ONE:', error);
    res.status(500).json({ 
      error: 'Error al obtener documento',
      message: error.message 
    });
  }
});

// UPDATE - Actualizar documento
app.put('/api/:collection/:id', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const id = req.params.id;
    const datos = req.body;
    
    const result = await db.collection(coleccion).updateOne(
      { 
        _id: new ObjectId(id),
        userId: req.user.uid 
      },
      { 
        $set: {
          ...datos,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'Documento no encontrado',
        message: 'El documento no existe o no tienes permisos para actualizarlo'
      });
    }
    
    res.json({ 
      success: true, 
      modified: result.modifiedCount,
      message: 'Documento actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en UPDATE:', error);
    res.status(500).json({ 
      error: 'Error al actualizar documento',
      message: error.message 
    });
  }
});

// DELETE - Eliminar documento
app.delete('/api/:collection/:id', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const id = req.params.id;
    
    const result = await db.collection(coleccion).deleteOne({
      _id: new ObjectId(id),
      userId: req.user.uid
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        error: 'Documento no encontrado',
        message: 'El documento no existe o no tienes permisos para eliminarlo'
      });
    }
    
    res.json({ 
      success: true, 
      deleted: result.deletedCount,
      message: 'Documento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en DELETE:', error);
    res.status(500).json({ 
      error: 'Error al eliminar documento',
      message: error.message 
    });
  }
});

// ===== BÚSQUEDAS Y QUERIES AVANZADAS =====

// Buscar documentos con filtros
app.post('/api/:collection/search', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    const filtros = req.body.filters || {};
    
    const query = {
      userId: req.user.uid,
      ...filtros
    };
    
    const documentos = await db.collection(coleccion)
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(documentos);
  } catch (error) {
    console.error('Error en SEARCH:', error);
    res.status(500).json({ 
      error: 'Error al buscar documentos',
      message: error.message 
    });
  }
});

// Contar documentos
app.get('/api/:collection/count', verificarToken, async (req, res) => {
  try {
    const coleccion = req.params.collection;
    
    const count = await db.collection(coleccion).countDocuments({
      userId: req.user.uid
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error en COUNT:', error);
    res.status(500).json({ 
      error: 'Error al contar documentos',
      message: error.message 
    });
  }
});

// ====== MANEJO DE ERRORES ======
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// ====== INICIAR SERVIDOR ======
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🚀 Servidor corriendo en puerto ${PORT}      ║
║  📊 MongoDB conectado                      ║
║  🔐 Firebase Authentication activo         ║
║                                            ║
║  URL: http://localhost:${PORT}                ║
╚════════════════════════════════════════════╝
  `);
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await client.close();
  process.exit(0);
});