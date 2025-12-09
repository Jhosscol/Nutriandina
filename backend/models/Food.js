// backend/models/Food.js
const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['cereal', 'legumbre', 'tuberculo', 'fruta', 'verdura', 'proteina', 'lacteo', 'fruto_seco', 'otros']
  },
  region: {
    type: String,
    required: true,
    enum: ['costa', 'sierra', 'selva', 'todas']
  },
  // Valores nutricionales por 100g
  nutritionalInfo: {
    calories: { type: Number, required: true }, // kcal
    protein: { type: Number, required: true }, // g
    carbohydrates: { type: Number, required: true }, // g
    fiber: { type: Number, required: true }, // g
    fat: { type: Number, required: true }, // g
    saturatedFat: { type: Number, default: 0 }, // g
    sugar: { type: Number, default: 0 }, // g
    sodium: { type: Number, default: 0 }, // mg
    iron: { type: Number, default: 0 }, // mg
    calcium: { type: Number, default: 0 }, // mg
    vitaminC: { type: Number, default: 0 }, // mg
  },
  // Restricciones médicas
  restrictions: {
    diabetes: { type: Boolean, default: false }, // true = NO recomendado para diabéticos
    hypertension: { type: Boolean, default: false }, // true = NO recomendado para hipertensos
    highCholesterol: { type: Boolean, default: false },
    celiac: { type: Boolean, default: false }, // contiene gluten
  },
  // Alergenos comunes
  allergens: [{
    type: String,
    enum: ['gluten', 'lactosa', 'frutos_secos', 'soja', 'huevo', 'pescado', 'mariscos']
  }],
  // Dietas compatibles
  diets: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
  },
  // Información adicional
  description: String,
  benefits: [String],
  season: [String], // meses de mayor disponibilidad
  image: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
foodSchema.index({ name: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ 'diets.vegetarian': 1 });
foodSchema.index({ 'diets.vegan': 1 });

module.exports = mongoose.model('Food', foodSchema);