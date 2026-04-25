<script setup>
import { RouterView } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from './services/axios.js'
import { authStore } from './store/auth.js'
import NavBar from './components/NavBar.vue'
import FooterApp from './components/FooterApp.vue'

const route = useRoute()
const mostrarLayout = computed(() => route.name !== 'login')

onMounted(async () => {
  try {
    const res = await api.get('/autenticacion/me')
    authStore.empleado = res.data.empleado
    authStore.isLoggedIn = true
  } catch {
    authStore.empleado = null
    authStore.isLoggedIn = false
  } finally {
    authStore.cargando = false
  }
})
</script>

<template>
  <div v-if="authStore.cargando" class="min-vh-100 d-flex align-items-center justify-content-center">
    <div class="spinner-border text-primary" role="status"></div>
  </div>

  <div v-else class="d-flex flex-column min-vh-100">
    <NavBar v-if="mostrarLayout" />
    <main class="flex-grow-1 container-fluid py-4">
      <RouterView />
    </main>
    <FooterApp v-if="mostrarLayout" />
  </div>
</template>