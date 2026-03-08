<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipe'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const store = useRecipeStore()

const { originalRecipe, optimizedRecipe, isLoading, isOptimizing, error, shoppingLink } = storeToRefs(store)

onMounted(() => {
  const url = route.query.url as string
  const goal = route.query.goal as string || 'Heart healthy'
  if (url) {
    store.processUrl(url, goal)
  } else if (!store.originalRecipe) {
    router.push('/')
  }
})

watch(() => route.query.url, (newUrl) => {
  if (newUrl) {
    store.processUrl(newUrl as string, route.query.goal as string || 'Heart healthy')
  }
})

const goBack = () => router.push('/')
const generateLink = () => store.generateInstacartLink()
</script>

<template>
  <div class="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
    
    <!-- Error State -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 md:p-12 text-center max-w-2xl mx-auto mt-12">
      <div class="text-red-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2">Extraction Failed</h2>
      <p class="text-slate-400 mb-6">{{ error }}</p>
      <button @click="goBack" class="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors">
        Try another URL
      </button>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading || isOptimizing" class="max-w-4xl mx-auto mt-12 space-y-8">
      <div class="text-center space-y-4">
        <div class="inline-block p-4 rounded-full bg-slate-800">
          <svg class="animate-spin h-8 w-8 text-rose-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-white">
          {{ isLoading && !originalRecipe ? 'Extracting recipe...' : 'Optimizing for heart health...' }}
        </h2>
        <p class="text-slate-400">{{ isLoading && !originalRecipe ? 'Parsing the webpage mechanics.' : 'Applying culinary science with Gemma to reduce sodium and saturated fats.' }}</p>
      </div>

      <!-- Skeletons -->
      <div class="grid md:grid-cols-2 gap-8 mt-12">
        <div class="bg-slate-800/30 rounded-2xl p-6 h-[400px] animate-pulse border border-slate-800"></div>
        <div class="bg-slate-800/30 rounded-2xl p-6 h-[400px] animate-pulse border border-slate-800 delay-150"></div>
      </div>
    </div>

    <!-- Results State -->
    <div v-else-if="originalRecipe && optimizedRecipe" class="animate-fade-in-up">
      
      <!-- Top header / CTA -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <button @click="goBack" class="text-slate-400 hover:text-white mb-4 flex items-center gap-1 text-sm font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back to search
          </button>
          <h1 class="text-3xl md:text-5xl font-bold text-white">{{ optimizedRecipe.optimizedTitle }}</h1>
          <p class="text-rose-400 mt-2 font-medium">Adapted for {{ optimizedRecipe.healthGoal }}</p>
        </div>
        
        <div class="w-full md:w-auto flex flex-col items-end gap-2">
           <button 
              @click="generateLink"
              :disabled="!!shoppingLink"
              class="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              {{ shoppingLink ? 'Link Generated' : 'Shop on Instacart' }}
            </button>
            <a v-if="shoppingLink" :href="shoppingLink" target="_blank" class="text-green-400 text-sm hover:underline font-medium">Open cart link &rarr;</a>
        </div>
      </div>

      <!-- Why it helps -->
      <div class="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 mb-8 text-rose-100">
        <h3 class="text-rose-400 font-bold mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
          </svg>
          Why it's better for your heart
        </h3>
        <p class="mb-4 text-sm md:text-base leading-relaxed text-slate-300">{{ optimizedRecipe.summary }}</p>
        <ul class="list-disc list-inside space-y-1 text-sm md:text-base text-slate-300">
          <li v-for="(rationale, i) in optimizedRecipe.healthRationale" :key="i">{{ rationale }}</li>
        </ul>
      </div>
      
      <!-- Cautions -->
      <div v-if="optimizedRecipe.cautions && optimizedRecipe.cautions.length > 0" class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8 text-amber-200 text-sm">
        <h4 class="font-bold flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          Points to consider
        </h4>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(caution, i) in optimizedRecipe.cautions" :key="i">{{ caution }}</li>
        </ul>
      </div>

      <!-- Main Comparison Grid -->
      <div class="grid lg:grid-cols-2 gap-8">
        
        <!-- Optimized Recipe Side -->
        <div class="space-y-8 order-2 lg:order-1 relative">
          
          <div class="bg-slate-800 border border-rose-500/30 rounded-3xl p-6 md:p-8 shadow-xl shadow-black/50 overflow-hidden relative group">
            <div class="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none"></div>
            
            <h2 class="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-6 flex items-center gap-2">
              <span class="w-2 h-8 bg-rose-500 rounded-full inline-block"></span>
              Optimized Recipe
            </h2>
            
            <div class="space-y-8">
              <!-- What Changed -->
              <div v-if="optimizedRecipe.substitutions.length > 0">
                <h3 class="text-lg font-semibold text-rose-300 mb-3 border-b border-rose-500/20 pb-2">Key Substitutions</h3>
                <div class="grid gap-3">
                  <div v-for="(sub, i) in optimizedRecipe.substitutions" :key="i" class="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <div class="flex items-center gap-3 mb-1">
                      <span class="text-slate-400 line-through text-sm">{{ sub.original }}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-green-400 font-bold text-sm">{{ sub.replacement }}</span>
                    </div>
                    <p class="text-xs text-slate-500">{{ sub.reason }}</p>
                  </div>
                </div>
              </div>

              <!-- Ingredients -->
              <div>
                <h3 class="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">Ingredients</h3>
                <ul class="space-y-2">
                  <li v-for="(item, i) in optimizedRecipe.optimizedIngredients" :key="i" class="flex gap-2 text-slate-300 ml-1">
                    <span class="text-rose-500 font-bold">&bull;</span> {{ item }}
                  </li>
                </ul>
              </div>

              <!-- Instructions -->
              <div>
                <h3 class="text-lg font-semibold text-white mb-3 border-b border-slate-700 pb-2">Instructions</h3>
                <ol class="space-y-4">
                  <li v-for="(step, i) in optimizedRecipe.optimizedInstructions" :key="i" class="flex gap-4 group">
                    <span class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-colors">{{ i + 1 }}</span>
                    <p class="text-slate-300 pt-1 leading-relaxed">{{ step }}</p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <!-- Original Recipe Side -->
        <div class="space-y-8 order-1 lg:order-2 opacity-80 hover:opacity-100 transition-opacity">
          
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-lg">
            
            <h2 class="text-xl font-bold text-slate-400 mb-6 flex items-center gap-2">
              <span class="w-2 h-6 bg-slate-700 rounded-full inline-block"></span>
              Original Recipe
            </h2>
            
            <div class="space-y-8">
               <div v-if="originalRecipe.image" class="w-full h-48 rounded-2xl overflow-hidden bg-slate-800 mb-6">
                 <img :src="originalRecipe.image" class="w-full h-full object-cover grayscale opacity-70" alt="Original recipe image" />
               </div>

              <!-- Original Ingredients -->
              <div>
                <h3 class="text-md font-semibold text-slate-500 mb-2">Original Ingredients</h3>
                <ul class="space-y-1">
                  <li v-for="(item, i) in originalRecipe.ingredients" :key="i" class="text-sm text-slate-400">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <!-- Original Instructions (Truncated or Collapsible in full app, showing full here for MVP) -->
              <div>
                <h3 class="text-md font-semibold text-slate-500 mb-2">Original Instructions</h3>
                <ol class="space-y-2">
                  <li v-for="(step, i) in originalRecipe.instructions" :key="i" class="text-sm text-slate-400">
                    <span class="font-mono text-xs opacity-50 mr-2">{{i+1}}.</span>{{ step }}
                  </li>
                </ol>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
</style>
