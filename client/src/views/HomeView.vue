<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const url = ref('')
const healthGoal = ref('Heart healthy')

const submitRecipe = () => {
  if (!url.value) return
  router.push({ name: 'results', query: { url: url.value, goal: healthGoal.value } })
}

const trySample = (sampleUrl: string) => {
  url.value = sampleUrl
  submitRecipe()
}

const samples = [
  { name: 'Classic Lasagna', url: 'https://www.allrecipes.com/recipe/23600/worlds-best-lasagna/' },
  { name: 'Chicken Parmesan', url: 'https://www.foodnetwork.com/recipes/bobby-flay/chicken-parmigiana-recipe-1952359' },
  { name: 'Beef Stew', url: 'https://www.allrecipes.com/recipe/14685/slow-cooker-beef-stew-i/' }
]
</script>

<template>
  <div class="flex-grow flex flex-col items-center justify-center px-4 py-16 max-w-4xl mx-auto w-full">
    
    <div class="text-center mb-12 space-y-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-4">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        AI-Powered Recipe Adjustments
      </div>
      
      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
        Cook smarter for <br/>
        <span class="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">your heart.</span>
      </h1>
      
      <p class="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Paste any recipe link below. We'll extract the ingredients and intelligently adapt them for better heart health—without destroying the joy of the meal.
      </p>
    </div>

    <div class="w-full max-w-2xl backdrop-blur-sm bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
      <!-- Decorative gradient orb -->
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <form @submit.prevent="submitRecipe" class="relative z-10 flex flex-col gap-4">
        <div>
          <label for="url" class="block text-sm font-medium text-slate-300 mb-2">Recipe URL</label>
          <input 
            id="url"
            v-model="url" 
            type="url" 
            placeholder="https://www.allrecipes.com/..." 
            required
            class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-4 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-shadow placeholder:text-slate-600"
          >
        </div>
        
        <div class="flex gap-4 items-end flex-wrap md:flex-nowrap">
          <div class="flex-grow w-full md:w-auto">
            <label for="goal" class="block text-sm font-medium text-slate-300 mb-2">Nutrition Goal</label>
            <select 
              id="goal" 
              v-model="healthGoal"
              class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-4 focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
            >
              <option value="Heart healthy">Heart Healthy (MVP Default)</option>
              <option value="Low sodium" disabled>Low Sodium (Coming soon)</option>
              <option value="Diabetic friendly" disabled>Diabetic Friendly (Coming soon)</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            class="w-full md:w-auto bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-rose-500/25 transition-all outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-900 flex-shrink-0"
          >
            Adapt Recipe
          </button>
        </div>
      </form>
    </div>

    <div class="mt-12 text-center w-full max-w-2xl">
      <p class="text-sm text-slate-500 mb-4 font-medium uppercase tracking-wider">Try a sample recipe</p>
      <div class="flex flex-wrap justify-center gap-3">
        <button 
          v-for="sample in samples" 
          :key="sample.url"
          @click="trySample(sample.url)"
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-full text-sm transition-colors duration-200 shadow-sm"
        >
          {{ sample.name }}
        </button>
      </div>
    </div>

  </div>
</template>
