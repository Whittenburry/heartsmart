export interface ExtractedRecipe {
  title: string
  author?: string
  image?: string
  description?: string
  sourceUrl: string
  servings?: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
  ingredients: string[]
  instructions: string[]
  notes?: string[]
}

export interface OptimizedRecipe {
  healthGoal: string
  optimizedTitle: string
  summary: string
  optimizedIngredients: string[]
  optimizedInstructions: string[]
  substitutions: Array<{
    original: string
    replacement: string
    reason: string
  }>
  healthRationale: string[]
  cautions?: string[]
  estimatedNutritionNotes?: string[]
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_BASE_URL = `${BASE_URL}/api`

export const api = {
  async pingHealth(): Promise<{ status: string }> {
    const res = await fetch(`${BASE_URL}/health`)
    if (!res.ok) throw new Error('Health check failed')
    return res.json()
  },

  async extractRecipe(url: string): Promise<ExtractedRecipe> {
    const res = await fetch(`${API_BASE_URL}/extract-recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to extract recipe')
    }
    return res.json()
  },

  async optimizeRecipe(recipe: ExtractedRecipe, healthGoal: string = 'Heart healthy'): Promise<OptimizedRecipe> {
    const res = await fetch(`${API_BASE_URL}/optimize-recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe, healthGoal })
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to optimize recipe')
    }
    return res.json()
  },

  async createShoppingLink(ingredients: string[]): Promise<{ shoppingUrl: string, message: string }> {
    const res = await fetch(`${API_BASE_URL}/create-shopping-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients })
    })
    if (!res.ok) {
        throw new Error('Failed to create shopping link')
    }
    return res.json()
  }
}
