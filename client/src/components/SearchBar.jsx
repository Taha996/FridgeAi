const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <input
    type="search"
    className="form-control"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{ maxWidth: '280px' }}
  />
)

export default SearchBar
