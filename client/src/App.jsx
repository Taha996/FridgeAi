import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UserProvider } from './context/UserContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Recipes from './pages/Recipes'
import Pantry from './pages/Pantry'
import AIsuggestions from './pages/AIsuggestions'
import Profile from './pages/Profile'
import Browse from './pages/Browse'
import useAuth from './hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return <div className="loading">Loading...</div>
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
            <Route path="/pantry" element={<ProtectedRoute><Pantry /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIsuggestions /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </UserProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
