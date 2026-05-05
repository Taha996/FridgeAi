import { Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Navbar = () => {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          🍳 Fridge<span>AI</span>
        </Link>
        <div className="navbar-links">
          <NavLink to="/browse">Browse</NavLink>
          {token ? (
            <>
              <NavLink to="/pantry">Pantry</NavLink>
              <NavLink to="/recipes">Recipes</NavLink>
              <NavLink to="/ai">AI Suggest</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Sign In</NavLink>
              <Link to="/register" className="btn btn-accent btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <nav className="mobile-nav">
        {token ? (
          <>
            <NavLink to="/pantry">
              <span className="mobile-nav-icon">🧊</span>
              Pantry
            </NavLink>
            <NavLink to="/recipes">
              <span className="mobile-nav-icon">📖</span>
              Recipes
            </NavLink>
            <NavLink to="/ai">
              <span className="mobile-nav-icon">🍳</span>
              AI Chef
            </NavLink>
            <NavLink to="/browse">
              <span className="mobile-nav-icon">🔍</span>
              Browse
            </NavLink>
            <NavLink to="/profile">
              <span className="mobile-nav-icon">👤</span>
              Profile
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/">
              <span className="mobile-nav-icon">🏠</span>
              Home
            </NavLink>
            <NavLink to="/browse">
              <span className="mobile-nav-icon">🔍</span>
              Browse
            </NavLink>
            <NavLink to="/login">
              <span className="mobile-nav-icon">👤</span>
              Sign In
            </NavLink>
          </>
        )}
      </nav>
    </>
  )
}

export default Navbar
