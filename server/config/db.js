// db.js handles the MongoDB connection
// We connect ONCE here and use it everywhere

const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise, so we await it
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected ✅')
  } catch (error) {
    console.error('MongoDB connection failed ❌', error.message)
    process.exit(1) // Stop the server if DB fails
  }
}

module.exports = connectDB