const BASE = 'https://www.themealdb.com/api/json/v1/1'

let cachedIngredients = null

export const getIngredients = async () => {
  if (cachedIngredients) return cachedIngredients
  const res = await fetch(`${BASE}/list.php?i=list`)
  const data = await res.json()
  cachedIngredients = data.meals || []
  return cachedIngredients
}

export const getCategories = async () => {
  const res = await fetch(`${BASE}/list.php?c=list`)
  const data = await res.json()
  return data.meals || []
}

export const searchMeals = async (query) => {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(query)}`)
  const data = await res.json()
  return data.meals || []
}

export const getMealsByIngredient = async (ingredient) => {
  const res = await fetch(`${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`)
  const data = await res.json()
  return data.meals || []
}

export const getMealsByCategory = async (category) => {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`)
  const data = await res.json()
  return data.meals || []
}

export const getMealById = async (id) => {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`)
  const data = await res.json()
  return data.meals ? data.meals[0] : null
}

export const getRandomMeal = async () => {
  const res = await fetch(`${BASE}/random.php`)
  const data = await res.json()
  return data.meals ? data.meals[0] : null
}

export const ingredientImage = (name) =>
  `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}-Small.png`

export const mealImage = (thumb, size = 'medium') =>
  thumb ? `${thumb}/${size}` : null
