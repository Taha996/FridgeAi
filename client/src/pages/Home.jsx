import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Home = () => {
  const { token } = useAuth()

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>Your Smart <span>FridgeAI</span></h1>
        <p>Turn whatever's in your fridge into amazing recipes. AI-powered suggestions tailored to your allergies and taste.</p>
        <div className="hero-actions">
          {token ? (
            <>
              <Link to="/ai" className="btn btn-accent btn-lg">✨ Get AI Suggestions</Link>
              <Link to="/pantry" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)' }}>
                My Pantry
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-accent btn-lg">Get Started Free</Link>
              <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)' }}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2>Everything you need in your kitchen</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>AI Recipe Suggestions</h3>
            <p>Grok AI analyzes your pantry and suggests personalized recipes in seconds.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🥦</div>
            <h3>Pantry Tracker</h3>
            <p>Keep track of what's in your fridge with quantities and expiry dates.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Recipe Manager</h3>
            <p>Save your favourite recipes and generate shopping lists automatically.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚫</div>
            <h3>Allergy Safe</h3>
            <p>Set your allergies and dietary preferences — the AI always respects them.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
