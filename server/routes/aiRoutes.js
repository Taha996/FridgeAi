const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getSuggestions, getSuggestionsFromIngredients } = require('../controllers/aiController')

router.use(protect)
router.get('/suggest', getSuggestions)
router.post('/suggest', getSuggestionsFromIngredients)

module.exports = router
