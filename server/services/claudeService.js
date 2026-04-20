const axios = require('axios')

const suggestRecipes = async ({ ingredients, allergies, dietaryPreferences }) => {
  const allergyNote = allergies.length > 0
    ? `\nIMPORTANT - Allergies to strictly avoid: ${allergies.join(', ')}.`
    : ''
  const prefNote = dietaryPreferences.length > 0
    ? `\nDietary preferences: ${dietaryPreferences.join(', ')}.`
    : ''

  const prompt = `I have these ingredients: ${ingredients.join(', ')}.${allergyNote}${prefNote}

Please suggest 3 recipes I can make. For each recipe provide:
- Recipe name
- Ingredients needed (mark which ones I already have with ✓)
- Step-by-step instructions
- Cooking time and servings

Format each recipe with a clear header like "## Recipe 1: Name".`

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a cooking assistant that ONLY answers questions about recipes, ingredients, cooking techniques, and food. If the user asks about anything unrelated to food or cooking, politely refuse and remind them you can only help with recipes and ingredients. Always respect dietary restrictions and allergies.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )

  return response.data.choices[0].message.content
}

module.exports = { suggestRecipes }
