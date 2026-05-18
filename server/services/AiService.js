const axios = require('axios')

const suggestRecipes = async ({ ingredients, allergies, dietaryPreferences }) => {
  try {
    const allergyNote = allergies.length > 0
      ? `\nIMPORTANT - Allergies to strictly avoid: ${allergies.join(', ')}.`
      : ''
    const prefNote = dietaryPreferences.length > 0
      ? `\nDietary preferences: ${dietaryPreferences.join(', ')}.`
      : ''

    const prompt = `I have these ingredients: ${ingredients.join(', ')}.${allergyNote}${prefNote}

STEP 1 — VALIDATE EVERY ITEM:
Check each item in my ingredient list individually. A valid item is a real food ingredient you can cook with (e.g. chicken, rice, garlic, olive oil, flour, butter, soy sauce).
Invalid items include: technology terms, brand names, passwords, numbers, code, objects, slang, or ANYTHING that is not an actual edible food ingredient.
If even ONE item in the list is not a real food ingredient, you MUST respond with ONLY:
[{"error": "Some items are not valid ingredients. Please only enter real food items (e.g. eggs, rice, chicken, garlic)."}]
Do NOT ignore invalid items. Do NOT skip them and use only the valid ones. Reject the entire request.

STEP 2 — ONLY if every single item is a valid food ingredient, give me 3 recipe ideas. Respond with ONLY a JSON array, no markdown, no code fences, no extra text:

[
  {
    "name": "Recipe name",
    "ingredients": [
      { "name": "ingredient name", "hasIngredient": true }
    ],
    "steps": ["Step 1 description", "Step 2 description"],
    "time": "10-15 minutes",
    "servings": "2-3"
  }
]

Rules:
- Set "hasIngredient" to true if the ingredient is in my list, false if the user needs to get it.
- Keep steps short and clear.
- Output ONLY the JSON array. No other text.`

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

  } catch (error) {
    console.error('Groq error status:', error.response?.status)
    console.error('Groq error data:', JSON.stringify(error.response?.data))
    throw error
  }
}

module.exports = { suggestRecipes }