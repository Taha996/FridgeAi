import { useState, useEffect } from 'react'
import * as recipeService from '../services/recipeService'

const useRecipes = () => {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecipes = async () => {
    setLoading(true)
    try {
      const res = await recipeService.getRecipes()
      setRecipes(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecipes() }, [])

  const addRecipe = async (data) => {
    const res = await recipeService.createRecipe(data)
    setRecipes(prev => [res.data, ...prev])
    return res.data
  }

  const editRecipe = async (id, data) => {
    const res = await recipeService.updateRecipe(id, data)
    setRecipes(prev => prev.map(r => r._id === id ? res.data : r))
    return res.data
  }

  const removeRecipe = async (id) => {
    await recipeService.deleteRecipe(id)
    setRecipes(prev => prev.filter(r => r._id !== id))
  }

  return { recipes, loading, error, addRecipe, editRecipe, removeRecipe, refetch: fetchRecipes }
}

export default useRecipes
