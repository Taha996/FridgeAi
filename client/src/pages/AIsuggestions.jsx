import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSuggestionsFromPantry, getSuggestionsFromIngredients } from '../services/aiService'
import { createRecipe } from '../services/recipeService'
import { getMealsByIngredient, getMealById } from '../services/mealdbService'
import api from '../services/api'

const MealCard = ({ meal, onExpand }) => (
  <div className="mealdb-card" onClick={() => onExpand(meal)}>
    {meal.strMealThumb && (
      <img src={meal.strMealThumb} alt={meal.strMeal} className="mealdb-card-img" />
    )}
    <div className="mealdb-card-body">
      <h4>{meal.strMeal}</h4>
      {meal.strCategory && <span className="badge badge-green">{meal.strCategory}</span>}
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {meal.strMealThumb && (
          <img src={meal.strMealThumb} alt={meal.strMeal} className="modal-img" />
        )}
        <div className="modal-body">
          <div className="modal-header">
            <h2>{meal.strMeal}</h2>
            <button onClick={onClose} className="modal-close">&times;</button>
          </div>
          <div className="modal-section">
            <h3>Ingredients</h3>
            <ul className="modal-ingredients">
              {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
            </ul>
          </div>
          <div className="modal-section">
            <h3>Instructions</h3>
            <p className="modal-instructions">{meal.strInstructions}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const INGREDIENT_PATTERN = /^[a-zA-Z][a-zA-Z\s\-']{1,40}$/

const validateIngredients = (items) => {
  const invalid = items.filter(item => !INGREDIENT_PATTERN.test(item))
  if (invalid.length > 0) return `These don't look like ingredients: ${invalid.join(', ')}`
  return null
}

const parseRecipes = (raw) => {
  try {
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (parsed[0].error) return { error: parsed[0].error }
      if (parsed[0].name) return { recipes: parsed }
    }
  } catch {}
  return null
}

const RecipeCard = ({ recipe }) => {
  const [saveState, setSaveState] = useState('idle')

  const handleSave = async () => {
    setSaveState('saving')
    try {
      const timeNum = parseInt(recipe.time) || undefined
      const servingsNum = parseInt(recipe.servings) || undefined
      await createRecipe({
        title: recipe.name,
        ingredients: recipe.ingredients.map(ing => ing.name),
        instructions: recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        cookingTime: timeNum,
        servings: servingsNum,
        tags: ['ai-generated']
      })
      setSaveState('saved')
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 2000)
    }
  }

  return (
    <div className="ai-card">
      <div className="ai-card-top">
        <div className="ai-card-title">
          <span className="ai-card-emoji">🍽️</span>
          <h3>{recipe.name}</h3>
        </div>
        <div className="ai-card-badges">
          <span className="ai-badge"><span className="ai-badge-icon">⏱️</span> {recipe.time}</span>
          <span className="ai-badge"><span className="ai-badge-icon">👥</span> {recipe.servings} servings</span>
        </div>
      </div>

      <div className="ai-card-section">
        <h4 className="ai-card-label">What you'll need</h4>
        <ul className="ai-card-ingredients">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className={ing.hasIngredient ? 'owned' : ''}>
              <span className="ing-icon">{ing.hasIngredient ? '✓' : '+'}</span>
              {ing.name}
            </li>
          ))}
        </ul>
        <div className="ai-card-legend">
          <span className="legend-item"><span className="legend-dot owned" /> You have this</span>
          <span className="legend-item"><span className="legend-dot" /> You'll need this</span>
        </div>
      </div>

      <div className="ai-card-section">
        <h4 className="ai-card-label">How to make it</h4>
        <ol className="ai-card-steps">
          {recipe.steps.map((step, i) => (
            <li key={i}>
              <span className="step-num">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="ai-card-footer">
        {saveState === 'saved' ? (
          <span className="ai-saved-pill">✓ Saved to My Recipes</span>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saveState === 'saving'}
          >
            {saveState === 'saving' ? 'Saving...' : saveState === 'error' ? 'Failed — Retry' : '💾 Save Recipe'}
          </button>
        )}
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
        const validationError = validateIngredients(ingredients)
        if (validationError) {
          setError(validationError + '. Please enter only real food ingredients (e.g. eggs, rice, chicken).')
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
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMealExpand = async (meal) => {
    if (meal.strInstructions) { setSelectedMeal(meal); return }
    const full = await getMealById(meal.idMeal)
    if (full) setSelectedMeal(full)
  }

  const hasResults = suggestions || mealdbResults.length > 0

  return (
    <div className="page-container">

      <div className="page-header">
        <h1>What's Cooking?</h1>
        <p>Tell us what you have and we'll find delicious recipes for you.</p>
      </div>

      <div className="suggest-input-card">
        <div className="suggest-tabs">
          <button
            className={`suggest-tab ${mode === 'pantry' ? 'active' : ''}`}
            onClick={() => setMode('pantry')}
          >
            🧊 From My Pantry
          </button>
          <button
            className={`suggest-tab ${mode === 'custom' ? 'active' : ''}`}
            onClick={() => setMode('custom')}
          >
            ✏️ Type Ingredients
          </button>
        </div>

        <div className="suggest-tab-content">
          {mode === 'pantry' ? (
            <p className="suggest-hint">
              We'll use everything in your{' '}
              <Link to="/pantry" className="suggest-link">pantry</Link>{' '}
              to find recipes that match. The more items you have, the better the results!
            </p>
          ) : (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>What ingredients do you have?</label>
              <input
                className="form-control"
                value={customIngredients}
                onChange={e => setCustomIngredients(e.target.value)}
                placeholder="e.g. chicken, rice, garlic, soy sauce..."
              />
              <p className="suggest-hint" style={{ marginTop: '6px' }}>
                Separate each ingredient with a comma.
              </p>
            </div>
          )}
        </div>

        <button className="btn btn-accent btn-lg btn-block" onClick={handleSuggest} disabled={loading}>
          {loading ? '🍳 Finding Recipes...' : '🍳 Find Recipes'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>🚫</span>
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="suggest-loading">
          <div className="suggest-loading-animation">
            <span>🥘</span><span>🍳</span><span>🥗</span>
          </div>
          <p className="suggest-loading-text">Finding the best recipes for you...</p>
          <p className="suggest-loading-sub">This usually takes a few seconds.</p>
        </div>
      )}

      {!loading && !hasResults && !error && (
        <div className="suggest-empty">
          <span className="suggest-empty-icon">👨‍🍳</span>
          <h3>Ready when you are</h3>
          <p>Pick your ingredients and hit <strong>Find Recipes</strong> to get started.</p>
        </div>
      )}

      {suggestions && !loading && (() => {
        const result = parseRecipes(suggestions)
        if (result?.error) return (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🚫</span>
            <span>{result.error}</span>
          </div>
        )
        if (result?.recipes) return (
          <div className="suggest-results">
            <div className="suggest-results-header">
              <h2>Here's what you can make</h2>
              <p>{result.recipes.length} recipes based on your ingredients</p>
            </div>
            <div className="ai-recipe-grid">
              {result.recipes.map((recipe, i) => (
                <RecipeCard key={i} recipe={recipe} />
              ))}
            </div>
          </div>
        )
        return (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🚫</span>
            <span>Something went wrong. Please try again with valid food ingredients.</span>
          </div>
        )
      })()}

      {(mealdbResults.length > 0 || mealdbLoading) && (
        <div className="suggest-mealdb">
          <div className="suggest-results-header">
            <h2>More inspiration</h2>
            <p>Popular recipes with similar ingredients from TheMealDB</p>
          </div>
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
