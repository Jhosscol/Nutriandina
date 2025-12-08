// backend/models/Recipe.js
const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['g', 'kg', 'ml', 'l', 'unidad', 'taza', 'cucharada', 'cucharadita']
  },
  name: {
    type: String,
    required: true
  }
}, { _id: false });

const instructionSchema = new mongoose.Schema({
  step: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['desayuno', 'almuerzo', 'cena', 'snack', 'postre']
  },
  mealType: {
    type: String,
    required: true,
    enum: ['plato_principal', 'entrada', 'acompañamiento', 'bebida', 'postre']
  },
  ingredients: [ingredientSchema],
  
  // Información nutricional total de la receta
  totalNutrition: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrates: { type: Number, required: true },
    fiber: { type: Number, required: true },
    fat: { type: Number, required: true },
    sodium: { type: Number, default: 0 }
  },
  
  servings: {
    type: Number,
    required: true,
    default: 1
  },
  
  instructions: [instructionSchema],
  
  // Tiempos en minutos
  prepTime: {
    type: Number,
    required: true
  },
  cookTime: {
    type: Number,
    required: true
  },
  
  difficulty: {
    type: String,
    required: true,
    enum: ['facil', 'media', 'dificil']
  },
  
  // Restricciones médicas (true = NO recomendado)
  restrictions: {
    diabetes: { type: Boolean, default: false },
    hypertension: { type: Boolean, default: false },
    highCholesterol: { type: Boolean, default: false },
    celiac: { type: Boolean, default: false }
  },
  
  // Alergenos presentes en la receta
  allergens: [{
    type: String,
    enum: ['gluten', 'lactosa', 'frutos_secos', 'soja', 'huevo', 'pescado', 'mariscos']
  }],
  
  // Dietas compatibles
  diets: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false }
  },
  
  // Objetivos de salud que ayuda a alcanzar
  healthGoals: [{
    type: String,
    enum: [
      'weight_loss',
      'muscle_gain',
      'heart_health',
      'diabetes_control',
      'energy',
      'digestion',
      'immunity'
    ]
  }],
  
  // Región de origen
  region: {
    type: String,
    required: true,
    enum: ['costa', 'sierra', 'selva', 'todas']
  },
  
  // Tags para búsqueda
  tags: [String],
  
  // Imagen de la receta
  image: String,
  
  // Popularidad y ratings
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas optimizadas
recipeSchema.index({ name: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ difficulty: 1 });
recipeSchema.index({ 'diets.vegetarian': 1 });
recipeSchema.index({ 'diets.vegan': 1 });
recipeSchema.index({ region: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ healthGoals: 1 });

// Método para calcular tiempo total
recipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Método para obtener nutrición por porción
recipeSchema.methods.getNutritionPerServing = function() {
  return {
    calories: Math.round(this.totalNutrition.calories / this.servings),
    protein: Math.round((this.totalNutrition.protein / this.servings) * 10) / 10,
    carbohydrates: Math.round((this.totalNutrition.carbohydrates / this.servings) * 10) / 10,
    fiber: Math.round((this.totalNutrition.fiber / this.servings) * 10) / 10,
    fat: Math.round((this.totalNutrition.fat / this.servings) * 10) / 10,
    sodium: Math.round(this.totalNutrition.sodium / this.servings)
  };
};

// Método para verificar si es apta para una restricción médica
recipeSchema.methods.isSafeFor = function(condition) {
  if (!this.restrictions[condition]) {
    return true;
  }
  return !this.restrictions[condition];
};

// Asegurar que los virtuals se incluyan en JSON
recipeSchema.set('toJSON', { virtuals: true });
recipeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Recipe', recipeSchema);