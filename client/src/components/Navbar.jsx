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
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Fridge<span>AI</span>
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
  )
}

export default Navbar
