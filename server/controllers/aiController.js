const { suggestRecipes } = require('../services/AiService')
const PantryItem = require('../models/Pantry')
const User = require('../models/User')

const getSuggestions = async (req, res, next) => {
  try {
    const pantryItems = await PantryItem.find({ user: req.user.id })
    const ingredients = pantryItems.map(item => item.name)

    if (ingredients.length === 0) {
      return res.status(400).json({ message: 'Add some items to your pantry first' })
    }

    const user = await User.findById(req.user.id)
    const suggestions = await suggestRecipes({
      ingredients,
      allergies: user.allergies,
      dietaryPreferences: user.dietaryPreferences
    })

    res.json({ suggestions })
  } catch (error) {
    next(error)
  }
}

const getSuggestionsFromIngredients = async (req, res, next) => {
  try {
    const { ingredients } = req.body
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'Please provide ingredients' })
    }

    const user = await User.findById(req.user.id)
    const suggestions = await suggestRecipes({
      ingredients,
      allergies: user.allergies,
      dietaryPreferences: user.dietaryPreferences
    })

    res.json({ suggestions })
  } catch (error) {
    next(error)
  }
}

module.exports = { getSuggestions, getSuggestionsFromIngredients }
