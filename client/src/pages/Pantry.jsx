import { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import { getIngredients, ingredientImage } from '../services/mealdbService'

const CATEGORIES = ['dairy', 'meat', 'vegetables', 'fruits', 'grains', 'spices', 'drinks', 'other']

const Pantry = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', quantity: 1, unit: 'pcs', category: 'other', expiryDate: '' })
  const [error, setError] = useState('')

  const [allIngredients, setAllIngredients] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    api.get('/pantry')
      .then(res => setItems(res.data))
      .catch(() => setError('Failed to load pantry'))
      .finally(() => setLoading(false))

    getIngredients().then(setAllIngredients)
  }, [])

  const handleNameChange = (value) => {
    setForm(p => ({ ...p, name: value }))
    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const filtered = allIngredients
      .filter(i => i.strIngredient.toLowerCase().startsWith(value.toLowerCase()))
      .slice(0, 8)
    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }

  const selectSuggestion = (name) => {
    setForm(p => ({ ...p, name }))
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/pantry', form)
      setItems(prev => [...prev, res.data])
      setForm({ name: '', quantity: 1, unit: 'pcs', category: 'other', expiryDate: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pantry/${id}`)
      setItems(prev => prev.filter(i => i._id !== id))
    } catch {
      setError('Failed to delete item')
    }
  }

  const expiryStatus = (date) => {
    if (!date) return null
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0) return { label: 'Expired', cls: 'badge-red' }
    if (days <= 3) return { label: 'Expiring soon', cls: 'badge-orange' }
    return { label: `Expires ${new Date(date).toLocaleDateString()}`, cls: 'badge-green' }
  }

  if (loading) return <div className="loading">Loading pantry...</div>

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Pantry</h1>
        <p>{items.length} item{items.length !== 1 ? 's' : ''} in your pantry</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--primary-dark)' }}>Add Pantry Item</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleAdd} autoComplete="off">
            <div className="form-row">
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Item Name</label>
                <input
                  ref={inputRef}
                  className="form-control"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="e.g. Eggs"
                  required
                />
                {showSuggestions && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'white', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', zIndex: 10,
                    boxShadow: 'var(--shadow)', maxHeight: '260px', overflowY: 'auto'
                  }}>
                    {suggestions.map(s => (
                      <div key={s.strIngredient}
                        onMouseDown={() => selectSuggestion(s.strIngredient)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 12px', cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      >
                        <img
                          src={ingredientImage(s.strIngredient)}
                          alt={s.strIngredient}
                          style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                          onError={e => { e.target.style.display = 'none' }}
                        />
                        <span style={{ fontSize: '14px', color: 'var(--text)' }}>{s.strIngredient}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" className="form-control" value={form.quantity}
                  onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} min="0" step="0.1" />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input className="form-control" value={form.unit}
                  onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  placeholder="pcs, kg, ml..." />
              </div>
            </div>
            <div className="form-group">
              <label>Expiry Date (optional)</label>
              <input type="date" className="form-control" value={form.expiryDate}
                onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary">Add to Pantry</button>
          </form>
        </div>
      )}

      {!showForm && error && <div className="alert alert-error">{error}</div>}

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🥦</div>
          <h3>Your pantry is empty</h3>
          <p>Add ingredients to get AI-powered recipe suggestions</p>
        </div>
      ) : (
        <div className="pantry-list">
          {items.map(item => {
            const expiry = expiryStatus(item.expiryDate)
            return (
              <div key={item._id} className="pantry-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={ingredientImage(item.name)}
                    alt={item.name}
                    style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <div className="pantry-item-info">
                    <h4>{item.name}</h4>
                    <span>
                      {item.quantity} {item.unit}
                      &nbsp;·&nbsp;
                      <span className="badge badge-gray">{item.category}</span>
                      {expiry && (
                        <span className={`pantry-item-expiry badge ${expiry.cls}`}>&nbsp;{expiry.label}</span>
                      )}
                    </span>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Pantry
