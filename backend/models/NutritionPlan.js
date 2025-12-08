// backend/models/NutritionPlan.js
const mongoose = require('mongoose');

const nutritionPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Datos del perfil de salud al momento de crear el plan
  userProfile: {
    age: Number,
    gender: String,
    weight: Number,
    height: Number,
    bmi: Number,
    activityLevel: String,
    smoker: Boolean,
    conditions: [String],
    allergies: [String],
    preferences: {
      vegetarian: Boolean,
      vegan: Boolean,
      selectedGoals: [String],
      dislikes: [String],
      favorites: [String]
    }
  },
  // Objetivos nutricionales calculados
  nutritionalGoals: {
    dailyCalories: Number,
    protein: Number, // g
    carbohydrates: Number, // g
    fat: Number, // g
    fiber: Number, // g
    sodium: Number, // mg
  },
  // Plan mensual (30 días)
  planType: {
    type: String,
    enum: ['semanal', 'mensual'],
    default: 'mensual'
  },
  duration: {
    type: Number, // días
    default: 30
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  
  // Menú diario para cada día del plan
  dailyMenus: [{
    day: {
      type: Number, // 1-30
      required: true
    },
    date: Date,
    meals: {
      breakfast: {
        recipeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe'
        },
        recipeName: String,
        servings: Number,
        nutrition: {
          calories: Number,
          protein: Number,
          carbohydrates: Number,
          fat: Number
        }
      },
      lunch: {
        recipeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe'
        },
        recipeName: String,
        servings: Number,
        nutrition: {
          calories: Number,
          protein: Number,
          carbohydrates: Number,
          fat: Number
        }
      },
      dinner: {
        recipeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe'
        },
        recipeName: String,
        servings: Number,
        nutrition: {
          calories: Number,
          protein: Number,
          carbohydrates: Number,
          fat: Number
        }
      },
      snacks: [{
        recipeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Recipe'
        },
        recipeName: String,
        servings: Number,
        nutrition: {
          calories: Number,
          protein: Number,
          carbohydrates: Number,
          fat: Number
        }
      }]
    },
    totalNutrition: {
      calories: Number,
      protein: Number,
      carbohydrates: Number,
      fat: Number,
      fiber: Number
    }
  }],
  
  // Lista de compras semanal consolidada (para Módulo 4)
  weeklyShoppingLists: [{
    week: Number, // 1-4
    items: [{
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food'
      },
      foodName: String,
      totalQuantity: Number,
      unit: String,
      category: String
    }]
  }],
  
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  
  // Progreso del usuario
  progress: {
    completedDays: {
      type: Number,
      default: 0
    },
    adherence: {
      type: Number, // porcentaje 0-100
      default: 0
    }
  }
}, {
  timestamps: true
});

// Índices
nutritionPlanSchema.index({ userId: 1, status: 1 });
nutritionPlanSchema.index({ startDate: 1, endDate: 1 });

// Método para calcular adherencia
nutritionPlanSchema.methods.calculateAdherence = function() {
  const totalDays = this.duration;
  const completedDays = this.progress.completedDays;
  this.progress.adherence = (completedDays / totalDays) * 100;
  return this.progress.adherence;
};

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);