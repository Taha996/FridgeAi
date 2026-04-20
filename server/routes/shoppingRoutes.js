const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const {
  getShoppingList,
  addItem,
  toggleItem,
  deleteItem,
  clearChecked,
  generateFromRecipe
} = require('../controllers/shoppingController')

router.use(protect)
router.route('/').get(getShoppingList).post(addItem)
router.delete('/clear-checked', clearChecked)
router.post('/generate/:recipeId', generateFromRecipe)
router.patch('/:itemId/toggle', toggleItem)
router.delete('/:itemId', deleteItem)

module.exports = router
