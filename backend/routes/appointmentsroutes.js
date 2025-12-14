const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

/**
 * MÓDULO DE CITAS (APPOINTMENTS)
 * Permite a los usuarios agendar citas virtuales con nutricionistas
 */

module.exports = (db, verificarToken) => {
  
  // ===== OBTENER NUTRICIONISTAS DISPONIBLES =====
 // ===== OBTENER NUTRICIONISTAS DISPONIBLES =====
// ===== OBTENER NUTRICIONISTAS DISPONIBLES =====
router.get('/nutritionists', verificarToken, async (req, res) => {
  try {
    console.log('🔍 ===== ENDPOINT /nutritionists LLAMADO =====');
    console.log('👤 Usuario:', req.user);
    console.log('📊 Buscando en MongoDB...');
    
    const nutritionists = await db.collection('nutritionists')
      .find({ 
        isActive: true, 
        isAvailable: true 
      })
      .project({
        name: 1,
        specialization: 1,
        bio: 1,
        rating: 1,
        totalConsultations: 1,
        consultationPrice: 1,
        phone: 1,
        email: 1
      })
      .toArray();
    
    console.log(`✅ Encontrados ${nutritionists.length} nutricionistas`);
    console.log('📦 Enviando respuesta JSON...');
    
    res.json(nutritionists);
  } catch (error) {
    console.error('❌ Error al obtener nutricionistas:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener nutricionistas',
      message: error.message 
    });
  }
});

  // ===== OBTENER HORARIOS DISPONIBLES DE UN NUTRICIONISTA =====
  router.get('/nutritionists/:id/availability', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { date } = req.query; // Formato: YYYY-MM-DD
      
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const nutritionist = await db.collection('nutritionists').findOne({
        _id: new ObjectId(id)
      });

      if (!nutritionist) {
        return res.status(404).json({ error: 'Nutricionista no encontrado' });
      }

      // Obtener citas ya agendadas para ese día
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const bookedAppointments = await db.collection('appointments')
        .find({
          nutritionistId: id,
          appointmentDate: {
            $gte: startOfDay,
            $lte: endOfDay
          },
          status: { $in: ['scheduled', 'confirmed'] }
        })
        .toArray();

      const bookedTimes = bookedAppointments.map(apt => 
        apt.appointmentDate.toISOString().substring(11, 16)
      );

      // Horarios disponibles (ejemplo: 9am - 6pm)
      const availableTimes = [];
      for (let hour = 9; hour < 18; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        if (!bookedTimes.includes(time)) {
          availableTimes.push(time);
        }
      }

      res.json({
        date,
        nutritionist: {
          id: nutritionist._id,
          name: nutritionist.name,
          specialization: nutritionist.specialization
        },
        availableTimes
      });

    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener disponibilidad',
        message: error.message 
      });
    }
  });

  // ===== CREAR NUEVA CITA =====
  router.post('/', verificarToken, async (req, res) => {
    try {
      const { 
        nutritionistId, 
        appointmentDate, 
        appointmentTime, 
        reason,
        notes 
      } = req.body;

      // Validaciones
      if (!nutritionistId || !appointmentDate || !appointmentTime) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos',
          message: 'nutritionistId, appointmentDate y appointmentTime son obligatorios'
        });
      }

      // Verificar que el nutricionista existe
      const nutritionist = await db.collection('nutritionists').findOne({
        _id: new ObjectId(nutritionistId)
      });

      if (!nutritionist) {
        return res.status(404).json({ error: 'Nutricionista no encontrado' });
      }

      // Combinar fecha y hora
      const [hours, minutes] = appointmentTime.split(':');
      const fullDate = new Date(appointmentDate);
      fullDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Verificar que no haya otra cita en ese horario
      const existingAppointment = await db.collection('appointments').findOne({
        nutritionistId,
        appointmentDate: fullDate,
        status: { $in: ['scheduled', 'confirmed'] }
      });

      if (existingAppointment) {
        return res.status(409).json({ 
          error: 'Horario no disponible',
          message: 'Ya existe una cita agendada en este horario'
        });
      }

      // Crear la cita
      const appointment = {
        userId: req.user.uid,
        userEmail: req.user.email,
        nutritionistId,
        nutritionistName: nutritionist.name,
        appointmentDate: fullDate,
        reason: reason || 'Consulta nutricional',
        notes: notes || '',
        status: 'scheduled', // scheduled, confirmed, completed, cancelled
        meetingLink: '', // Se generará cuando se confirme
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('appointments').insertOne(appointment);

      console.log('✅ Cita creada:', result.insertedId);

      res.status(201).json({
        success: true,
        message: 'Cita agendada exitosamente',
        data: { ...appointment, _id: result.insertedId }
      });

    } catch (error) {
      console.error('❌ Error al crear cita:', error);
      res.status(500).json({ 
        error: 'Error al crear cita',
        message: error.message 
      });
    }
  });

  // ===== OBTENER TODAS LAS CITAS DEL USUARIO =====
  router.get('/', verificarToken, async (req, res) => {
    try {
      const { status } = req.query;
      
      let filter = { userId: req.user.uid };
      if (status) {
        filter.status = status;
      }

      const appointments = await db.collection('appointments')
        .find(filter)
        .sort({ appointmentDate: -1 })
        .toArray();

      res.json(appointments);
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener citas',
        message: error.message 
      });
    }
  });

  // ===== OBTENER CITA POR ID =====
  router.get('/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const appointment = await db.collection('appointments').findOne({
        _id: new ObjectId(id),
        userId: req.user.uid
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      res.json(appointment);
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al obtener cita',
        message: error.message 
      });
    }
  });

  // ===== ACTUALIZAR CITA =====
  router.put('/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const result = await db.collection('appointments').updateOne(
        { 
          _id: new ObjectId(id),
          userId: req.user.uid
        },
        { 
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      res.json({ 
        success: true,
        message: 'Cita actualizada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al actualizar cita',
        message: error.message 
      });
    }
  });

  // ===== CANCELAR CITA =====
  router.delete('/:id', verificarToken, async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const result = await db.collection('appointments').updateOne(
        { 
          _id: new ObjectId(id),
          userId: req.user.uid
        },
        { 
          $set: {
            status: 'cancelled',
            cancelledAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      res.json({ 
        success: true,
        message: 'Cita cancelada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({ 
        error: 'Error al cancelar cita',
        message: error.message 
      });
    }
  });

  return router;
};