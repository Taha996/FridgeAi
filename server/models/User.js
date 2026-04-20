const mongoose = require('mongoose')

// A Schema defines the SHAPE of your data in MongoDB
// Think of it like a form with required fields
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true           // removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,        // no two users with same email
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  allergies: {
    type: [String],      // array of strings e.g. ["gluten", "nuts"]
    default: []
  },
  dietaryPreferences: {
    type: [String],      // e.g. ["vegan", "halal"]
    default: []
  }
}, {
  timestamps: true       // adds createdAt and updatedAt automatically
})

// Export the model so we can use it in controllers
module.exports = mongoose.model('User', userSchema)