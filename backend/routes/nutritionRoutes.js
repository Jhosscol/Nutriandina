// backend/routes/nutritionRoutes.js
const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');
const { protect } = require('../middleware/auth');

// ============= PLANES NUTRICIONALES =============

// Generar plan nutricional personalizado
router.post('/plans/generate', protect, nutritionController.generateNutritionPlan);

// Obtener plan activo del usuario
router.get('/plans/active', protect, nutritionController.getActivePlan);

// Obtener menú de un día específico
router.get('/plans/menu/:day', protect, nutritionController.getDailyMenu);

// Marcar día como completado
router.post('/plans/complete/:day', protect, nutritionController.markDayCompleted);

// 🔥 NUEVO: Desmarcar día como completado
router.delete('/plans/complete/:day', protect, nutritionController.unmarkDayCompleted);

// Obtener lista de compras semanal
router.get('/plans/shopping-list/:week', protect, nutritionController.getWeeklyShoppingList);

// ============= RECETAS =============

// Obtener todas las recetas (con filtros opcionales)
router.get('/recipes', nutritionController.getAllRecipes);

// Obtener detalle de una receta
router.get('/recipes/:id', nutritionController.getRecipeById);

// Ajustar porciones de una receta
router.post('/recipes/:id/adjust-servings', nutritionController.adjustRecipeServings);

// ============= ALIMENTOS =============

// Obtener todos los alimentos andinos (con filtros opcionales)
router.get('/foods', nutritionController.getAllFoods);

// ============= CALCULADORA NUTRICIONAL =============

// Calcular información nutricional de múltiples alimentos
router.post('/calculator', nutritionController.calculateNutrition);

module.exports = router;