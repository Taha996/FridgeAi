const mongoose = require('mongoose')

const pantryItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    enum: ['g', 'kg', 'l', 'pcs'],
    default: 'pcs'
  },
  category: {
    type: String,
    default: 'other'
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('PantryItem', pantryItemSchema)
