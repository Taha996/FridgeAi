require('dotenv').config()

const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')


const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/recipes', require('./routes/recipeRoutes'))
app.use('/api/pantry', require('./routes/pantryRoutes'))
app.use('/api/ai', require('./routes/aiRoutes'))
app.use('/api/shopping', require('./routes/shoppingRoutes'))

app.use(require('./middleware/errorHandler'))

const PORT = process.env.PORT || 8000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`)
  })
})
