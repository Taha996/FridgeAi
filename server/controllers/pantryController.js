const PantryItem = require('../models/Pantry')

const getPantry = async (req, res, next) => {
  try {
    const items = await PantryItem.find({ user: req.user.id }).sort({ name: 1 })
    res.json(items)
  } catch (error) {
    next(error)
  }
}

const addItem = async (req, res, next) => {
  try {
    const { name, quantity, unit, category, expiryDate } = req.body
    const item = await PantryItem.create({
      user: req.user.id,
      name,
      quantity,
      unit,
      category,
      expiryDate
    })
    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
}

const updateItem = async (req, res, next) => {
  try {
    const item = await PantryItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    )
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.json(item)
  } catch (error) {
    next(error)
  }
}

const deleteItem = async (req, res, next) => {
  try {
    const item = await PantryItem.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.json({ message: 'Item removed from pantry' })
  } catch (error) {
    next(error)
  }
}

module.exports = { getPantry, addItem, updateItem, deleteItem }
