const AllergyBadge = ({ label, type = 'allergy' }) => (
  <span className={`badge ${type === 'allergy' ? 'badge-red' : 'badge-green'}`}>
    {type === 'allergy' ? '⚠️ ' : ''}{label}
  </span>
)

export default AllergyBadge
