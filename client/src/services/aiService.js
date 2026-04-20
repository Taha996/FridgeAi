import api from './api'

export const getSuggestionsFromPantry = () => api.get('/ai/suggest')
export const getSuggestionsFromIngredients = (ingredients) => api.post('/ai/suggest', { ingredients })
