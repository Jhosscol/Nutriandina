// backend/middleware/auth.js
const admin = require('firebase-admin');

/**
 * Middleware para proteger rutas con autenticación de Firebase
 */
exports.protect = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No autorizado',
        message: 'Token no proporcionado' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar el token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Agregar información del usuario a req
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    console.log('✅ Usuario autenticado:', req.user.email);
    
    next();
  } catch (error) {
    console.error('❌ Error de autenticación:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Por favor inicia sesión nuevamente' 
      });
    }
    
    return res.status(401).json({ 
      error: 'No autorizado',
      message: 'Token inválido' 
    });
  }
};

/**
 * Middleware opcional - no requiere autenticación pero la usa si está disponible
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
    }
    
    next();
  } catch (error) {
    // Si falla, continuar sin usuario
    next();
  }
};