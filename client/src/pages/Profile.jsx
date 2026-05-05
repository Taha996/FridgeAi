import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'

const ALLERGY_OPTIONS = [
  'peanuts', 'tree nuts', 'milk', 'eggs', 'wheat', 'soy',
  'fish', 'shellfish', 'sesame', 'gluten', 'corn', 'mustard',
  'celery', 'lupin', 'mollusks', 'sulfites'
]

const DIETARY_OPTIONS = ['vegan', 'vegetarian', 'halal', 'kosher', 'gluten-free', 'dairy-free', 'keto', 'paleo']

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext)
  const [allergies, setAllergies] = useState(user?.allergies || [])
  const [dietaryPreferences, setDietaryPreferences] = useState(user?.dietaryPreferences || [])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await api.put('/users/profile', { allergies, dietaryPreferences })
      updateUser(res.data)
      setMessage('Profile saved successfully!')
    } catch (err) {
      setMessage('Failed to save: ' + (err.response?.data?.message || err.message))
    } finally {
      setSaving(false)
    }
  }

  const toggleDiet = (opt) =>
    setDietaryPreferences(prev =>
      prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]
    )

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your dietary preferences and allergies</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '4px', color: 'var(--primary-dark)' }}>{user?.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{user?.email}</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '8px', color: 'var(--primary-dark)' }}>Dietary Settings</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
          The AI will always respect these settings when suggesting recipes.
        </p>

        {message && (
          <div className={`alert ${message.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Allergies</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
              {ALLERGY_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAllergies(prev =>
                    prev.includes(opt) ? prev.filter(a => a !== opt) : [...prev, opt]
                  )}
                  style={{
                    cursor: 'pointer',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: allergies.includes(opt)
                      ? 'rgba(229,62,62,0.15)'
                      : 'var(--border)',
                    color: allergies.includes(opt)
                      ? '#e53e3e'
                      : 'var(--text-muted)'
                  }}
                >
                  {allergies.includes(opt) ? '✓ ' : ''}{opt}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to toggle</p>
          </div>

          <div className="form-group">
            <label>Dietary Preferences</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
              {DIETARY_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleDiet(opt)}
                  style={{
                    cursor: 'pointer',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: dietaryPreferences.includes(opt)
                      ? 'rgba(82,183,136,0.2)'
                      : 'var(--border)',
                    color: dietaryPreferences.includes(opt)
                      ? 'var(--primary-dark)'
                      : 'var(--text-muted)'
                  }}
                >
                  {dietaryPreferences.includes(opt) ? '✓ ' : ''}{opt}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to toggle</p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile
