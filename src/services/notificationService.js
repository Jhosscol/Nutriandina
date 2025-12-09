// Servicio de notificaciones push con notifee
import notifee, {
    AndroidImportance,
    RepeatFrequency,
    TriggerType
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class NotificationService {
  
  // Inicializar el servicio de notificaciones
  static async initialize() {
    try {
      // Solicitar permisos
      await notifee.requestPermission();
      
      // Crear canales de notificación para Android
      await this.createNotificationChannels();
      
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  // Crear canales de notificación (Android)
  static async createNotificationChannels() {
    await notifee.createChannel({
      id: 'meal_reminders',
      name: 'Recordatorios de Comidas',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    await notifee.createChannel({
      id: 'water_reminders',
      name: 'Recordatorios de Agua',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
    });

    await notifee.createChannel({
      id: 'health_tracking',
      name: 'Seguimiento de Salud',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.createChannel({
      id: 'orders',
      name: 'Pedidos',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.createChannel({
      id: 'tips',
      name: 'Consejos Nutricionales',
      importance: AndroidImportance.LOW,
    });
  }

  // Programar recordatorio de comida
  static async scheduleMealReminder(mealTime, mealName, mealType) {
    try {
      const [hours, minutes] = mealTime.split(':');
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: this.getNextMealTime(parseInt(hours), parseInt(minutes)),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      const notificationId = await notifee.createTriggerNotification(
        {
          title: `⏰ Hora de ${mealType}`,
          body: `Es momento de consumir: ${mealName}`,
          android: {
            channelId: 'meal_reminders',
            pressAction: {
              id: 'meal_reminder',
              launchActivity: 'default',
            },
            actions: [
              {
                title: 'Completado',
                pressAction: {
                  id: 'complete_meal',
                },
              },
              {
                title: 'Posponer 15 min',
                pressAction: {
                  id: 'snooze_meal',
                },
              },
            ],
          },
        },
        trigger
      );

      // Guardar ID de notificación
      await this.saveNotificationId('meal', mealType, notificationId);
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling meal reminder:', error);
      return null;
    }
  }

  // Programar recordatorio de agua
  static async scheduleWaterReminders(intervalMinutes = 120) {
    try {
      const reminders = [];
      const startHour = 8; // 8 AM
      const endHour = 22; // 10 PM
      
      for (let hour = startHour; hour < endHour; hour += intervalMinutes / 60) {
        const trigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: this.getNextMealTime(Math.floor(hour), (hour % 1) * 60),
          repeatFrequency: RepeatFrequency.DAILY,
        };

        const notificationId = await notifee.createTriggerNotification(
          {
            title: '💧 Hidratación',
            body: '¡No olvides beber agua!',
            android: {
              channelId: 'water_reminders',
              pressAction: {
                id: 'water_reminder',
              },
              actions: [
                {
                  title: 'Registrar',
                  pressAction: {
                    id: 'log_water',
                  },
                },
              ],
            },
          },
          trigger
        );

        reminders.push(notificationId);
      }

      await this.saveNotificationId('water', 'reminders', reminders);
      return reminders;
    } catch (error) {
      console.error('Error scheduling water reminders:', error);
      return [];
    }
  }

  // Recordatorio para medir presión arterial
  static async scheduleBloodPressureReminder(time = '08:00') {
    try {
      const [hours, minutes] = time.split(':');
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: this.getNextMealTime(parseInt(hours), parseInt(minutes)),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      const notificationId = await notifee.createTriggerNotification(
        {
          title: '🩺 Medir Presión Arterial',
          body: 'Es hora de registrar tu presión arterial',
          android: {
            channelId: 'health_tracking',
            pressAction: {
              id: 'bp_reminder',
            },
            actions: [
              {
                title: 'Registrar Ahora',
                pressAction: {
                  id: 'log_bp',
                },
              },
            ],
          },
        },
        trigger
      );

      await this.saveNotificationId('health', 'blood_pressure', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling BP reminder:', error);
      return null;
    }
  }

  // Recordatorio para medir glucosa
  static async scheduleGlucoseReminder(times = ['07:00', '13:00', '19:00']) {
    try {
      const reminders = [];
      
      for (const time of times) {
        const [hours, minutes] = time.split(':');
        const trigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: this.getNextMealTime(parseInt(hours), parseInt(minutes)),
          repeatFrequency: RepeatFrequency.DAILY,
        };

        const notificationId = await notifee.createTriggerNotification(
          {
            title: '🩸 Medir Glucosa',
            body: 'Registra tu nivel de glucosa en sangre',
            android: {
              channelId: 'health_tracking',
              pressAction: {
                id: 'glucose_reminder',
              },
              actions: [
                {
                  title: 'Registrar',
                  pressAction: {
                    id: 'log_glucose',
                  },
                },
              ],
            },
          },
          trigger
        );

        reminders.push(notificationId);
      }

      await this.saveNotificationId('health', 'glucose', reminders);
      return reminders;
    } catch (error) {
      console.error('Error scheduling glucose reminders:', error);
      return [];
    }
  }

  // Notificación de consejo del día
  static async scheduleDailyTip(time = '09:00') {
    try {
      const tips = [
        '🌾 La quinua es una proteína completa que contiene todos los aminoácidos esenciales.',
        '💪 El tarwi tiene más proteína que la carne y es excelente para veganos.',
        '⚡ La maca aumenta tu energía de forma natural sin cafeína.',
        '🩸 El yacón ayuda a regular los niveles de azúcar en sangre.',
        '🦴 La kiwicha es rica en calcio, ideal para la salud ósea.',
        '💚 Los alimentos andinos son naturalmente libres de gluten.',
        '🏃 Combina alimentos andinos con ejercicio para mejores resultados.',
      ];

      const [hours, minutes] = time.split(':');
      const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: this.getNextMealTime(parseInt(hours), parseInt(minutes)),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      const randomTip = tips[Math.floor(Math.random() * tips.length)];

      const notificationId = await notifee.createTriggerNotification(
        {
          title: '💡 Consejo NutriAndina',
          body: randomTip,
          android: {
            channelId: 'tips',
            pressAction: {
              id: 'daily_tip',
            },
          },
        },
        trigger
      );

      return notificationId;
    } catch (error) {
      console.error('Error scheduling daily tip:', error);
      return null;
    }
  }

  // Notificación de actualización de pedido
  static async sendOrderNotification(orderStatus, orderId) {
    try {
      const statusMessages = {
        processing: {
          title: '📦 Pedido en Proceso',
          body: `Tu pedido #${orderId} está siendo preparado`,
        },
        shipped: {
          title: '🚚 Pedido Enviado',
          body: `Tu pedido #${orderId} está en camino`,
        },
        delivered: {
          title: '✅ Pedido Entregado',
          body: `Tu pedido #${orderId} ha sido entregado`,
        },
      };

      const message = statusMessages[orderStatus];
      
      await notifee.displayNotification({
        title: message.title,
        body: message.body,
        android: {
          channelId: 'orders',
          pressAction: {
            id: 'order_update',
            launchActivity: 'default',
          },
        },
      });
    } catch (error) {
      console.error('Error sending order notification:', error);
    }
  }

  // Notificación de descuento o promoción
  static async sendPromotionNotification(title, message, couponCode = null) {
    try {
      await notifee.displayNotification({
        title: `🎉 ${title}`,
        body: couponCode ? `${message}\nCódigo: ${couponCode}` : message,
        android: {
          channelId: 'tips',
          pressAction: {
            id: 'promotion',
          },
          largeIcon: 'ic_launcher',
        },
      });
    } catch (error) {
      console.error('Error sending promotion notification:', error);
    }
  }

  // Notificación de meta alcanzada
  static async sendAchievementNotification(achievement) {
    try {
      await notifee.displayNotification({
        title: `🏆 ¡Logro Desbloqueado!`,
        body: achievement,
        android: {
          channelId: 'tips',
          pressAction: {
            id: 'achievement',
          },
        },
      });
    } catch (error) {
      console.error('Error sending achievement notification:', error);
    }
  }

  // Cancelar notificación específica
  static async cancelNotification(notificationId) {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancelar todas las notificaciones de un tipo
  static async cancelNotificationsByType(type) {
    try {
      const ids = await this.getNotificationIds(type);
      if (ids) {
        if (Array.isArray(ids)) {
          await Promise.all(ids.map(id => notifee.cancelNotification(id)));
        } else {
          await notifee.cancelNotification(ids);
        }
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  // Cancelar todas las notificaciones
  static async cancelAllNotifications() {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Guardar IDs de notificaciones
  static async saveNotificationId(category, type, id) {
    try {
      const key = `notification_${category}_${type}`;
      await AsyncStorage.setItem(key, JSON.stringify(id));
    } catch (error) {
      console.error('Error saving notification ID:', error);
    }
  }

  // Obtener IDs de notificaciones
  static async getNotificationIds(type) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const notificationKeys = keys.filter(key => key.startsWith(`notification_${type}`));
      
      if (notificationKeys.length > 0) {
        const data = await AsyncStorage.getItem(notificationKeys[0]);
        return JSON.parse(data);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting notification IDs:', error);
      return null;
    }
  }

  // Calcular siguiente hora de comida
  static getNextMealTime(hours, minutes) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // Si ya pasó la hora de hoy, programar para mañana
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    return scheduledTime.getTime();
  }

  // Configurar recordatorios según perfil
  static async setupProfileReminders(profile) {
    try {
      // Cancelar notificaciones anteriores
      await this.cancelAllNotifications();
      
      // Programar recordatorios de comidas
      if (profile.mealReminders) {
        await this.scheduleMealReminder('08:00', 'Desayuno nutritivo', 'Desayuno');
        await this.scheduleMealReminder('13:00', 'Almuerzo balanceado', 'Almuerzo');
        await this.scheduleMealReminder('19:00', 'Cena ligera', 'Cena');
      }
      
      // Programar recordatorios de agua
      if (profile.waterReminders) {
        await this.scheduleWaterReminders(120); // Cada 2 horas
      }
      
      // Programar recordatorios de salud según condiciones
      if (profile.healthConditions?.includes('hypertension')) {
        await this.scheduleBloodPressureReminder('08:00');
      }
      
      if (profile.healthConditions?.includes('diabetes')) {
        await this.scheduleGlucoseReminder(['07:00', '13:00', '19:00']);
      }
      
      // Programar consejo diario
      await this.scheduleDailyTip('09:00');
      
      console.log('Profile reminders configured');
    } catch (error) {
      console.error('Error setting up profile reminders:', error);
    }
  }

  // Verificar si las notificaciones están habilitadas
  static async areNotificationsEnabled() {
    try {
      const settings = await notifee.getNotificationSettings();
      return settings.authorizationStatus === 1; // AUTHORIZED
    } catch (error) {
      console.error('Error checking notification settings:', error);
      return false;
    }
  }

  // Abrir configuración de notificaciones
  static async openNotificationSettings() {
    try {
      await notifee.openNotificationSettings();
    } catch (error) {
      console.error('Error opening notification settings:', error);
    }
  }
}

export default NotificationService;