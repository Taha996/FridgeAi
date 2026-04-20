import { useState } from 'react'
import api from '../services/api'

const SUGGESTED_TAGS = [
  'vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'halal', 'kosher',
  'quick', 'healthy', 'spicy', 'high-protein', 'low-carb',
  'breakfast', 'lunch', 'dinner', 'dessert', 'snack',
  'italian', 'asian', 'mexican', 'mediterranean', 'comfort food'
]

const RecipeCard = ({ recipe, onDelete, onUpdate }) => {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [shoppingMsg, setShoppingMsg] = useState('')
  const [editError, setEditError] = useState('')

  const [form, setForm] = useState({
    title: recipe.title,
    ingredients: recipe.ingredients.join('\n'),
    instructions: recipe.instructions,
    cookingTime: recipe.cookingTime || '',
    servings: recipe.servings || '',
    tags: [...recipe.tags]
  })

  const toggleTag = (tag) =>
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag]
    }))

  const handleSave = async (e) => {
    e.preventDefault()
    setEditError('')
    setSaving(true)
    try {
      await onUpdate(recipe._id, {
        title: form.title,
        ingredients: form.ingredients.split('\n').map(i => i.trim()).filter(Boolean),
        instructions: form.instructions,
        cookingTime: form.cookingTime ? Number(form.cookingTime) : undefined,
        servings: form.servings ? Number(form.servings) : undefined,
        tags: form.tags
      })
      setEditing(false)
      setExpanded(false)
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${recipe.title}"?`)) return
    setDeleting(true)
    await onDelete(recipe._id)
  }

  const handleAddToShopping = async () => {
    try {
      await api.post(`/shopping/generate/${recipe._id}`)
      setShoppingMsg('Added to shopping list!')
      setTimeout(() => setShoppingMsg(''), 3000)
    } catch {
      setShoppingMsg('Failed to add')
    }
  }

  if (editing) {
    return (
      <div className="recipe-card" style={{ gridColumn: '1 / -1' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--primary-dark)' }}>Edit Recipe</h3>
        {editError && <div className="alert alert-error">{editError}</div>}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Recipe Title</label>
            <input className="form-control" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Ingredients (one per line)</label>
            <textarea className="form-control" value={form.ingredients}
              onChange={e => setForm(p => ({ ...p, ingredients: e.target.value }))} rows={4} required />
          </div>
          <div className="form-group">
            <label>Instructions</label>
            <textarea className="form-control" value={form.instructions}
              onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} rows={4} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cooking Time (minutes)</label>
              <input type="number" className="form-control" value={form.cookingTime}
                onChange={e => setForm(p => ({ ...p, cookingTime: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Servings</label>
              <input type="number" className="form-control" value={form.servings}
                onChange={e => setForm(p => ({ ...p, servings: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Tags</label>
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
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>

      <div className="recipe-card-meta">
        {recipe.cookingTime && <span>⏱ {recipe.cookingTime} min</span>}
        {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
        <span>🥗 {recipe.ingredients.length} ingredients</span>
      </div>

      {recipe.tags.length > 0 && (
        <div className="recipe-card-tags">
          {recipe.tags.map(tag => (
            <span key={tag} className="badge badge-green">{tag}</span>
          ))}
        </div>
      )}

      {expanded && (
        <div style={{ marginBottom: '12px', fontSize: '14px' }}>
          <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--primary-dark)' }}>Ingredients:</strong>
          <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
          <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--primary-dark)' }}>Instructions:</strong>
          <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{recipe.instructions}</p>
        </div>
      )}

      {shoppingMsg && (
        <p style={{ fontSize: '13px', color: 'var(--success)', marginBottom: '8px' }}>{shoppingMsg}</p>
      )}

      <div className="recipe-card-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Hide' : 'View'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleAddToShopping}>
          🛒 Shop
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

export default RecipeCard
