const jwt = require('jsonwebtoken')

// This runs before protected routes
// It checks if the user has a valid token
const protect = (req, res, next) => {
  try {
    // Token comes in header: "Bearer xxxxxx"
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No token, access denied' })
    }

    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user id to request so routes can use it
    req.user = decoded
    next() // move to the actual route
  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' })
  }
}

module.exports = { protect }