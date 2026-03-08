import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, ExtractedRecipe, OptimizedRecipe } from '../services/api'

export const useRecipeStore = defineStore('recipe', () => {
  const originalRecipe = ref<ExtractedRecipe | null>(null)
  const optimizedRecipe = ref<OptimizedRecipe | null>(null)
  const isLoading = ref(false)
  const isOptimizing = ref(false)
  const error = ref<string | null>(null)
  const shoppingLink = ref<string | null>(null)

  const processUrl = async (url: string, healthGoal: string = 'Heart healthy') => {
    isLoading.value = true
    isOptimizing.value = false
    error.value = null
    originalRecipe.value = null
    optimizedRecipe.value = null
    shoppingLink.value = null
    
    try {
      // 1. Extract
      const extracted = await api.extractRecipe(url)
      originalRecipe.value = extracted
      
      // 2. Optimize
      isOptimizing.value = true
      const optimized = await api.optimizeRecipe(extracted, healthGoal)
      optimizedRecipe.value = optimized
      
    } catch (err: any) {
      error.value = err.message || 'An unexpected error occurred.'
    } finally {
      isLoading.value = false
      isOptimizing.value = false
    }
  }

  const generateInstacartLink = async () => {
    if (!optimizedRecipe.value) return
    try {
      const res = await api.createShoppingLink(optimizedRecipe.value.optimizedIngredients)
      shoppingLink.value = res.shoppingUrl
      return res.shoppingUrl
    } catch (err) {
      console.error(err)
    }
  }

  const reset = () => {
    originalRecipe.value = null
    optimizedRecipe.value = null
    error.value = null
    shoppingLink.value = null
  }

  return {
    originalRecipe,
    optimizedRecipe,
    isLoading,
    isOptimizing,
    error,
    shoppingLink,
    processUrl,
    generateInstacartLink,
    reset
  }
})
