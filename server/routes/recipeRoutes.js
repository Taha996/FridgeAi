const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} = require('../controllers/recipeController')

router.use(protect)
router.route('/').get(getRecipes).post(createRecipe)
router.route('/:id').get(getRecipeById).put(updateRecipe).delete(deleteRecipe)

module.exports = router
