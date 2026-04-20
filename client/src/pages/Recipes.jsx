import { useState } from 'react'
import useRecipes from '../hooks/useRecipes'
import RecipeCard from '../components/RecipeCard'
import SearchBar from '../components/SearchBar'

const SUGGESTED_TAGS = [
  'vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'halal', 'kosher',
  'quick', 'healthy', 'spicy', 'high-protein', 'low-carb',
  'breakfast', 'lunch', 'dinner', 'dessert', 'snack',
  'italian', 'asian', 'mexican', 'mediterranean', 'comfort food'
]

const Recipes = () => {
  const { recipes, loading, error, addRecipe, editRecipe, removeRecipe } = useRecipes()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    title: '', ingredients: '', instructions: '',
    cookingTime: '', servings: '', tags: []
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const toggleTag = (tag) =>
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag]
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      await addRecipe({
        title: form.title,
        ingredients: form.ingredients.split('\n').map(i => i.trim()).filter(Boolean),
        instructions: form.instructions,
        cookingTime: form.cookingTime ? Number(form.cookingTime) : undefined,
        servings: form.servings ? Number(form.servings) : undefined,
        tags: form.tags
      })
      setForm({ title: '', ingredients: '', instructions: '', cookingTime: '', servings: '', tags: [] })
      setShowForm(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create recipe')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = recipes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="loading">Loading recipes...</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Recipes</h1>
        <p>Save and manage your favourite recipes</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search recipes..." />
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Recipe'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--primary-dark)' }}>Add New Recipe</h3>
          {formError && <div className="alert alert-error">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Recipe Title</label>
              <input className="form-control" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Spaghetti Carbonara" required />
            </div>
            <div className="form-group">
              <label>Ingredients (one per line)</label>
              <textarea className="form-control" value={form.ingredients}
                onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))}
                placeholder={"200g pasta\n2 eggs\n100g bacon"} rows={4} required />
            </div>
            <div className="form-group">
              <label>Instructions</label>
              <textarea className="form-control" value={form.instructions}
                onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                placeholder="Step by step cooking instructions..." rows={4} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Cooking Time (minutes)</label>
                <input type="number" className="form-control" value={form.cookingTime}
                  onChange={e => setForm(p => ({ ...p, cookingTime: e.target.value }))} placeholder="30" />
              </div>
              <div className="form-group">
                <label>Servings</label>
                <input type="number" className="form-control" value={form.servings}
                  onChange={e => setForm(p => ({ ...p, servings: e.target.value }))} placeholder="4" />
              </div>
            </div>
            <div className="form-group">
              <label>Tags <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '13px' }}>(click to select)</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SUGGESTED_TAGS.map(tag => (
                  <button key={tag} type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      cursor: 'pointer', border: 'none', padding: '5px 12px',
                      borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                      background: form.tags.includes(tag) ? 'rgba(82,183,136,0.2)' : 'var(--border)',
                      color: form.tags.includes(tag) ? 'var(--primary-dark)' : 'var(--text-muted)'
                    }}>
                    {form.tags.includes(tag) ? '✓ ' : ''}{tag}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Recipe'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>{search ? 'No recipes match your search' : 'No recipes yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Click "+ New Recipe" to add your first recipe'}</p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(recipe => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onDelete={removeRecipe}
              onUpdate={editRecipe}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Recipes
