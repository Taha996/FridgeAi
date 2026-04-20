const Recipe = require('../models/Recipe')

const createRecipe = async (req, res, next) => {
  try {
    const { title, ingredients, instructions, cookingTime, servings, tags } = req.body
    const recipe = await Recipe.create({
      user: req.user.id,
      title,
      ingredients,
      instructions,
      cookingTime,
      servings,
      tags
    })
    res.status(201).json(recipe)
  } catch (error) {
    next(error)
  }
}

const getRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ user: req.user.id }).sort({ createdAt: -1 })
    res.json(recipes)
  } catch (error) {
    next(error)
  }
}

const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, user: req.user.id })
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' })
    res.json(recipe)
  } catch (error) {
    next(error)
  }
}

const updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    )
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' })
    res.json(recipe)
  } catch (error) {
    next(error)
  }
}

const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' })
    res.json({ message: 'Recipe deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = { createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe }
