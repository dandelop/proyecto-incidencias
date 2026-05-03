<!--
  Barra de navegación principal de la aplicación
  Se muestra en todas las vistas excepto en el login (controlado desde App.vue)
  Los enlaces de administración solo son visibles para usuarios con nivel_acceso 'administrador'
-->

<script setup>
import { useRouter } from 'vue-router'
import { authStore } from '../store/auth.js'
import api from '../services/axios.js'

const router = useRouter()

// Cierra la sesión del usuario: notifica al servidor para invalidar la cookie,
// limpia el estado global y redirige al login
const logout = async () => {
  try {
    await api.post('/autenticacion/logout')
  } finally {
    authStore.empleado = null
    authStore.isLoggedIn = false
    router.push('/login')
  }
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">

      <!-- Logo y nombre de la aplicación -->
      <div class="navbar-brand d-flex align-items-center gap-2" href="#">
        <img src="../assets/logo.png" alt="Logo" width="32" height="32" onerror="this.style.display='none'">
        <span class="ms-1">Gestor de Incidencias</span>
      </div>

      <!-- Botón hamburguesa - visible solo en pantallas pequeñas -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">

        <!-- Enlaces accesibles para todos los usuarios autenticados -->
        <ul class="navbar-nav me-auto ms-3">
          <li class="nav-item">
            <RouterLink class="nav-link text-light" to="/incidencias">Incidencias</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link text-light" to="/clientes">Clientes</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link text-light" to="/equipos">Equipos</RouterLink>
          </li>

          <!-- Enlaces exclusivos para administradores -->
          <li class="nav-item" v-if="authStore.empleado?.nivel_acceso === 'administrador'">
            <RouterLink class="nav-link text-light" to="/empleados">Empleados</RouterLink>
          </li>

          <li class="nav-item" v-if="authStore.empleado?.nivel_acceso === 'administrador'">
            <RouterLink class="nav-link text-light" to="/estadisticas">Estadísticas</RouterLink>
          </li>

          <li class="nav-item" v-if="authStore.empleado?.nivel_acceso === 'administrador'">
            <RouterLink class="nav-link text-light" to="/logs">Registro</RouterLink>
          </li>
        </ul>

        <!-- Nombre del empleado logueado (enlaza a su perfil) y botón de cierre de sesión -->
        <ul class="navbar-nav ms-auto align-items-center gap-2">
          <li class="nav-item">
            <RouterLink class="nav-link text-light" to="/perfil">
              {{ authStore.empleado?.nombre }} {{ authStore.empleado?.apellido1 }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <button class="btn btn-outline-light btn-sm" @click="logout">
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Hover en los enlaces del navbar */
.nav-link:hover {
  color: rgb(63, 140, 255) !important;
  transition: color 0.2s;
}

/* Resalta la sección activa */
.router-link-active {
  color: rgb(63, 140, 255) !important;
  font-weight: 600;
  border-bottom: 2px solid rgb(63, 140, 255);
}
</style>