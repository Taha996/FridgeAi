import { useState, useEffect } from 'react'
import {
  getCategories,
  searchMeals,
  getMealsByCategory,
  getMealById,
  getRandomMeal
} from '../services/mealdbService'

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
        background: 'white', borderRadius: '16px', maxWidth: '680px',
        width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '0'
      }} onClick={e => e.stopPropagation()}>
        {meal.strMealThumb && (
          <img src={meal.strMealThumb} alt={meal.strMeal}
            style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '16px 16px 0 0' }} />
        )}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <h2 style={{ color: 'var(--primary-dark)', fontSize: '22px', fontWeight: 700, flex: 1 }}>{meal.strMeal}</h2>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', fontSize: '22px',
              cursor: 'pointer', color: 'var(--text-muted)', marginLeft: '12px'
            }}>×</button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {meal.strCategory && <span className="badge badge-green">{meal.strCategory}</span>}
            {meal.strArea && <span className="badge badge-gray">{meal.strArea}</span>}
          </div>

          <h3 style={{ color: 'var(--primary-dark)', marginBottom: '10px', fontSize: '16px' }}>Ingredients</h3>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 2 }}>
            {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>

          <h3 style={{ color: 'var(--primary-dark)', marginBottom: '10px', fontSize: '16px' }}>Instructions</h3>
          <p style={{ color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {meal.strInstructions}
          </p>

          {meal.strYoutube && (
            <a href={meal.strYoutube} target="_blank" rel="noreferrer"
              className="btn btn-accent btn-sm" style={{ marginTop: '16px', display: 'inline-flex' }}>
              ▶ Watch on YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const MealCard = ({ meal, onClick }) => (
  <div className="recipe-card" style={{ cursor: 'pointer', padding: '0', overflow: 'hidden' }} onClick={() => onClick(meal)}>
    {meal.strMealThumb && (
      <img src={meal.strMealThumb} alt={meal.strMeal}
        style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
    )}
    <div style={{ padding: '14px' }}>
      <h3 style={{ fontSize: '15px', marginBottom: '6px' }}>{meal.strMeal}</h3>
      {meal.strCategory && <span className="badge badge-green" style={{ fontSize: '11px' }}>{meal.strCategory}</span>}
    </div>
  </div>
)

const Browse = () => {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    getCategories().then(cats => setCategories(cats))
    loadRandom()
  }, [])

  const loadRandom = async () => {
    setLoading(true)
    const promises = Array.from({ length: 12 }, () => getRandomMeal())
    const results = await Promise.all(promises)
    setMeals(results.filter(Boolean))
    setLoading(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return
    setLoading(true)
    setSelectedCategory('')
    const results = await searchMeals(search)
    setMeals(results)
    setLoading(false)
  }

  const handleCategory = async (cat) => {
    setSelectedCategory(cat)
    setSearch('')
    setLoading(true)
    const results = await getMealsByCategory(cat)
    setMeals(results)
    setLoading(false)
  }

  const handleMealClick = async (meal) => {
    if (meal.strInstructions) {
      setSelectedMeal(meal)
      return
    }
    setModalLoading(true)
    const full = await getMealById(meal.idMeal)
    setModalLoading(false)
    if (full) setSelectedMeal(full)
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse Meals</h1>
        <p>Explore thousands of real recipes from around the world</p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          className="form-control"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search any meal... (e.g. pasta, chicken, sushi)"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-secondary" onClick={loadRandom}>🎲 Random</button>
      </form>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {categories.map(cat => (
          <button key={cat.strCategory}
            className={`badge ${selectedCategory === cat.strCategory ? 'badge-green' : 'badge-gray'}`}
            style={{ cursor: 'pointer', border: 'none', padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
            onClick={() => handleCategory(cat.strCategory)}>
            {cat.strCategory}
          </button>
        ))}
      </div>

      {modalLoading && <div className="loading">Loading recipe...</div>}

      {loading ? (
        <div className="loading">Loading meals...</div>
      ) : meals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No meals found</h3>
          <p>Try a different search term or category</p>
        </div>
      ) : (
        <div className="card-grid">
          {meals.map(meal => (
            <MealCard key={meal.idMeal} meal={meal} onClick={handleMealClick} />
          ))}
        </div>
      )}

      {selectedMeal && (
        <MealModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />
      )}
    </div>
  )
}

export default Browse
