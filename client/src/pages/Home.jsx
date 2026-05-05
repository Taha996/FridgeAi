import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Home = () => {
  const { token } = useAuth()

  return (
    <div className="home-page">
      <section className="hero-section">
        <span className="hero-emoji">🥘</span>
        <h1>Cook something<br />amazing <span>tonight</span></h1>
        <p>
          FridgeAI looks at what's in your kitchen and suggests
          delicious recipes you can actually make. No food waste, no stress.
        </p>
        <div className="hero-actions">
          {token ? (
            <>
              <Link to="/ai" className="btn btn-accent btn-lg">🍳 Get Recipe Ideas</Link>
              <Link to="/pantry" className="hero-btn-ghost">🧊 My Pantry</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn-accent btn-lg">Get Started — it's free</Link>
              <Link to="/login" className="hero-btn-ghost">I have an account</Link>
            </>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2>Your kitchen, simplified</h2>
        <p className="features-subtitle">
          Everything you need to plan meals, reduce waste, and eat well.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🧠</span>
            <h3>AI Recipe Ideas</h3>
            <p>Tell us your ingredients and our AI creates personalized recipes in seconds.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🧊</span>
            <h3>Pantry Tracker</h3>
            <p>Keep track of what's in your fridge with quantities and expiry alerts.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📖</span>
            <h3>Save Recipes</h3>
            <p>Build your personal cookbook. Save AI suggestions or add your own.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <h3>Allergy Safe</h3>
            <p>Set your allergies and dietary needs — every suggestion respects them.</p>
          </div>
        </div>
      </section>

      {!token && (
        <section className="home-cta-section">
          <h2>Ready to stop wasting food?</h2>
          <p>Join FridgeAI and start cooking smarter today.</p>
          <Link to="/register" className="btn btn-accent btn-lg">Create Free Account</Link>
        </section>
      )}
    </div>
  )
}

export default Home
