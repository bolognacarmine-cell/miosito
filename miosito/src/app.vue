<script setup>
import AnimatedTitle from './components/AnimatedTitle.vue'
</script>

<template>
  <div id="app">
    <AnimatedTitle />
  </div>
</template>

<style>
/* BLOCCO TOTALE LAMPEGGIO MOBILE */
[v-cloak] { display: none !important; }
* { 
  -webkit-tap-highlight-color: transparent !important; 
  -webkit-font-smoothing: antialiased !important;
}

/* SAFARI IOS FIX CRITICO */
html, body, #app {
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

@media (max-width: 768px) {
  * {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }
}

/* TUOI STILI (dopo i fix) */
#app {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: #0f172a;
}
</style>
