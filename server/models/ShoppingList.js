const mongoose = require('mongoose')

const shoppingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'pcs' },
  checked: { type: Boolean, default: false }
})

const shoppingListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [shoppingItemSchema]
}, {
  timestamps: true
})

module.exports = mongoose.model('ShoppingList', shoppingListSchema)
