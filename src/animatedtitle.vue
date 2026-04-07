<script setup>
import AnimatedTitle from './components/AnimatedTitle.vue'
</script>

<template>
  <div id="app" v-cloak>
    <AnimatedTitle />
  </div>
</template>

<style>
/* ANTI-FLICKER MOBILE - AGGIUNGI QUESTO */
[v-cloak] { 
  display: none !important; 
}
* { 
  -webkit-tap-highlight-color: transparent !important; 
  -webkit-text-size-adjust: 100% !important;
}
html, body {
  animation-duration: 0.001s !important;
  transition: none !important;
}
@media (pointer: coarse) { /* SOLO MOBILE */
  * { 
    transition-duration: 0s !important; 
    animation-duration: 0s !important;
  }
}

#app {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
}
</style>
