import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSuggestionsFromPantry, getSuggestionsFromIngredients } from '../services/aiService'
import { getMealsByIngredient, getMealById } from '../services/mealdbService'
import api from '../services/api'

const MealCard = ({ meal, onExpand }) => (
  <div className="recipe-card" style={{ cursor: 'pointer', padding: '0', overflow: 'hidden' }}
    onClick={() => onExpand(meal)}>
    {meal.strMealThumb && (
      <img src={`${meal.strMealThumb}/small`} alt={meal.strMeal}
        style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
    )}
    <div style={{ padding: '12px' }}>
      <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>{meal.strMeal}</h3>
      {meal.strCategory && <span className="badge badge-green" style={{ fontSize: '11px' }}>{meal.strCategory}</span>}
    </div>
  </div>
)

const MealModal = ({ meal, onClose }) => {
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ing && ing.trim()) ingredients.push(`${measure?.trim() || ''} ${ing}`.trim())
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: '16px', maxWidth: '640px',
        width: '100%', maxHeight: '90vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        {meal.strMealThumb && (
          <img src={`${meal.strMealThumb}/medium`} alt={meal.strMeal}
            style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '16px 16px 0 0' }} />
        )}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h2 style={{ color: 'var(--primary-dark)', fontSize: '20px', fontWeight: 700, flex: 1 }}>{meal.strMeal}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: '12px' }}>×</button>
          </div>
          <h3 style={{ color: 'var(--primary-dark)', marginBottom: '8px', fontSize: '15px' }}>Ingredients</h3>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 2 }}>
            {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
          <h3 style={{ color: 'var(--primary-dark)', marginBottom: '8px', fontSize: '15px' }}>Instructions</h3>
          <p style={{ color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {meal.strInstructions}
          </p>
        </div>
      </div>
    </div>
  )
}

const AIsuggestions = () => {
  const [suggestions, setSuggestions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customIngredients, setCustomIngredients] = useState('')
  const [mode, setMode] = useState('pantry')

  const [mealdbResults, setMealdbResults] = useState([])
  const [mealdbLoading, setMealdbLoading] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)

  const handleSuggest = async () => {
    setError('')
    setSuggestions('')
    setMealdbResults([])
    setLoading(true)

    try {
      let res
      let ingredientsForMealDB = []

      if (mode === 'pantry') {
        res = await getSuggestionsFromPantry()
        const pantryRes = await api.get('/pantry')
        ingredientsForMealDB = pantryRes.data.slice(0, 3).map(i => i.name)
      } else {
        const ingredients = customIngredients.split(',').map(i => i.trim()).filter(Boolean)
        if (ingredients.length === 0) {
          setError('Please enter at least one ingredient')
          setLoading(false)
          return
        }
        res = await getSuggestionsFromIngredients(ingredients)
        ingredientsForMealDB = ingredients.slice(0, 3)
      }

      setSuggestions(res.data.suggestions)

      if (ingredientsForMealDB.length > 0) {
        setMealdbLoading(true)
        const mealPromises = ingredientsForMealDB.map(ing => getMealsByIngredient(ing))
        const results = await Promise.all(mealPromises)
        const merged = results.flat()
        const unique = Array.from(new Map(merged.map(m => [m.idMeal, m])).values()).slice(0, 8)
        setMealdbResults(unique)
        setMealdbLoading(false)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get suggestions. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const handleMealExpand = async (meal) => {
    if (meal.strInstructions) { setSelectedMeal(meal); return }
    const full = await getMealById(meal.idMeal)
    if (full) setSelectedMeal(full)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI Recipe Suggestions</h1>
        <p>Get personalized recipes from AI + real meal examples from TheMealDB</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button className={`btn ${mode === 'pantry' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('pantry')}>
            Use My Pantry
          </button>
          <button className={`btn ${mode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMode('custom')}>
            Enter Ingredients
          </button>
        </div>

        {mode === 'pantry' && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
            Uses all items in your <Link to="/pantry" style={{ color: 'var(--primary)' }}>pantry</Link>. Make sure you have added ingredients there first.
          </p>
        )}

        {mode === 'custom' && (
          <div className="form-group">
            <label>Your Ingredients (comma separated)</label>
            <input className="form-control" value={customIngredients}
              onChange={e => setCustomIngredients(e.target.value)}
              placeholder="eggs, cheese, tomatoes, pasta..." />
          </div>
        )}

        <button className="btn btn-accent btn-lg" onClick={handleSuggest} disabled={loading}>
          {loading ? '✨ Generating...' : '✨ Suggest Recipes'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && (
        <div className="loading" style={{ flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '36px' }}>🤖</span>
          <span>AI is thinking up recipes for you...</span>
        </div>
      )}

      {suggestions && !loading && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '12px', color: 'var(--primary-dark)' }}>
            🤖 AI Suggestions
          </h3>
          <div className="ai-response">{suggestions}</div>
        </div>
      )}

      {(mealdbResults.length > 0 || mealdbLoading) && (
        <div>
          <h3 style={{ marginBottom: '12px', color: 'var(--primary-dark)' }}>
            🍽️ Real Recipes from TheMealDB
          </h3>
          {mealdbLoading ? (
            <div className="loading">Loading matching meals...</div>
          ) : (
            <div className="card-grid">
              {mealdbResults.map(meal => (
                <MealCard key={meal.idMeal} meal={meal} onExpand={handleMealExpand} />
              ))}
            </div>
          )}
        </div>
      )}

      {selectedMeal && <MealModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
    </div>
  )
}

export default AIsuggestions
