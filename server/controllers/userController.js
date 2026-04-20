const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are all required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashedPassword })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        allergies: user.allergies,
        dietaryPreferences: user.dietaryPreferences
      }
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' })
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message)
      return res.status(400).json({ message: messages.join('. ') })
    }
    res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid email or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        allergies: user.allergies,
        dietaryPreferences: user.dietaryPreferences
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { name, allergies, dietaryPreferences } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, allergies, dietaryPreferences },
      { new: true }
    ).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { registerUser, loginUser, getProfile, updateProfile }
