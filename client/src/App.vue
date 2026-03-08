<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { ref, onMounted } from 'vue'
import { api } from '@/services/api'

const serverStatus = ref<'checking' | 'online' | 'offline'>('checking')

onMounted(async () => {
  try {
    const res = await api.pingHealth()
    if (res.status === 'ok') {
      serverStatus.value = 'online'
    } else {
      serverStatus.value = 'offline'
    }
  } catch (e) {
    serverStatus.value = 'offline'
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-rose-500/30">
    <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/40 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">HeartSmart</span>
        </RouterLink>
        
        <nav class="flex gap-6 text-sm font-medium">
          <RouterLink to="/" class="text-slate-400 hover:text-rose-400 transition-colors" active-class="text-rose-400">Home</RouterLink>
          <RouterLink to="/about" class="text-slate-400 hover:text-rose-400 transition-colors" active-class="text-rose-400">About</RouterLink>
        </nav>
      </div>
    </header>

    <main class="flex-grow flex flex-col">
      <RouterView />
    </main>

    <footer class="border-t border-slate-800 py-8 mt-12">
      <div class="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
        <div class="flex items-center justify-center gap-2 mb-4">
          <span class="relative flex h-2 w-2">
            <span v-if="serverStatus === 'checking'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2" :class="{
              'bg-emerald-500': serverStatus === 'online',
              'bg-rose-500': serverStatus === 'offline',
              'bg-slate-400': serverStatus === 'checking'
            }"></span>
          </span>
          <span class="text-xs uppercase tracking-wider font-semibold" :class="{
              'text-emerald-500/80': serverStatus === 'online',
              'text-rose-500/80': serverStatus === 'offline',
              'text-slate-500': serverStatus === 'checking'
            }">API {{ serverStatus }}</span>
        </div>
        <p>&copy; 2026 John Whittenburg. HeartSmart MVP.</p>
        <p class="mt-2 text-xs max-w-xl mx-auto">
          Disclaimer: This app provides general wellness-oriented recipe adaptations and is not medical advice. Nutrition details may be approximate. Users with medical conditions should consult a professional.
        </p>
      </div>
    </footer>
  </div>
</template>
