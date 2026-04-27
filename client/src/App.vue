<!--
  Componente raíz de la aplicación.

  - Verifica la sesión activa al arrancar llamando a /autenticacion/me.
    Si la cookie JWT sigue siendo válida, restaura el estado global sin
    necesidad de volver a iniciar sesión.

  - Muestra un spinner mientras se comprueba la sesión, evitando que el
    navigation guard evalúe el acceso a rutas con un estado aún indeterminado.

  - Renderiza el layout completo (NavBar + vista + Footer) o solo la vista
    en el caso del login.
-->

<script setup>
import { RouterView } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from './services/axios.js'
import { authStore } from './store/auth.js'
import NavBar from './components/NavBar.vue'
import FooterApp from './components/FooterApp.vue'

const route = useRoute()

// El layout (NavBar y Footer) solo se muestra en rutas que no sean el login
const mostrarLayout = computed(() => route.name !== 'login')

// Al montar la app, comprueba si hay una sesión activa en el servidor.
// Esto permite restaurar la sesión al recargar la página sin pasar por el login.
onMounted(async () => {
  try {
    const res = await api.get('/autenticacion/me')
    authStore.empleado = res.data.empleado
    authStore.isLoggedIn = true
  } catch {
    // Si no hay cookie válida o el servidor rechaza la petición, se limpia el estado
    authStore.empleado = null
    authStore.isLoggedIn = false
  } finally {
    // Independientemente del resultado, se desbloquea el navigation guard
    authStore.cargando = false
  }
})
</script>

<template>
  <!-- Spinner mientras se verifica la sesión al arrancar -->
  <div v-if="authStore.cargando" class="min-vh-100 d-flex align-items-center justify-content-center">
    <div class="spinner-border text-primary" role="status"></div>
  </div>

  <!-- Layout principal: NavBar, vista activa y Footer -->
  <div v-else class="d-flex flex-column min-vh-100">
    <NavBar v-if="mostrarLayout" />
    <main class="flex-grow-1 container-fluid py-4">
      <RouterView />
    </main>
    <FooterApp v-if="mostrarLayout" />
  </div>
</template>