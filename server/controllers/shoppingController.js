const ShoppingList = require('../models/ShoppingList')
const Recipe = require('../models/Recipe')

const getOrCreateList = async (userId) => {
  let list = await ShoppingList.findOne({ user: userId })
  if (!list) list = await ShoppingList.create({ user: userId, items: [] })
  return list
}

const getShoppingList = async (req, res, next) => {
  try {
    const list = await getOrCreateList(req.user.id)
    res.json(list)
  } catch (error) {
    next(error)
  }
}

const addItem = async (req, res, next) => {
  try {
    const { name, quantity, unit } = req.body
    const list = await getOrCreateList(req.user.id)
    list.items.push({ name, quantity, unit })
    await list.save()
    res.status(201).json(list)
  } catch (error) {
    next(error)
  }
}

const toggleItem = async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({ user: req.user.id })
    if (!list) return res.status(404).json({ message: 'Shopping list not found' })
    const item = list.items.id(req.params.itemId)
    if (!item) return res.status(404).json({ message: 'Item not found' })
    item.checked = !item.checked
    await list.save()
    res.json(list)
  } catch (error) {
    next(error)
  }
}

const deleteItem = async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({ user: req.user.id })
    if (!list) return res.status(404).json({ message: 'Shopping list not found' })
    list.items = list.items.filter(i => i._id.toString() !== req.params.itemId)
    await list.save()
    res.json(list)
  } catch (error) {
    next(error)
  }
}

const clearChecked = async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({ user: req.user.id })
    if (!list) return res.status(404).json({ message: 'Shopping list not found' })
    list.items = list.items.filter(i => !i.checked)
    await list.save()
    res.json(list)
  } catch (error) {
    next(error)
  }
}

const generateFromRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.recipeId, user: req.user.id })
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' })

    const list = await getOrCreateList(req.user.id)
    for (const ingredient of recipe.ingredients) {
      const exists = list.items.some(i => i.name.toLowerCase() === ingredient.toLowerCase())
      if (!exists) list.items.push({ name: ingredient, quantity: 1, unit: 'pcs' })
    }
    await list.save()
    res.json(list)
  } catch (error) {
    next(error)
  }
}

module.exports = { getShoppingList, addItem, toggleItem, deleteItem, clearChecked, generateFromRecipe }
