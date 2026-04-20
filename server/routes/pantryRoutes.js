const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')
const { getPantry, addItem, updateItem, deleteItem } = require('../controllers/pantryController')

router.use(protect)
router.route('/').get(getPantry).post(addItem)
router.route('/:id').put(updateItem).delete(deleteItem)

module.exports = router
