<script setup>
import { useRouter } from 'vue-router'
import { authStore } from '../store/auth.js'
import api from '../services/axios.js'

const router = useRouter()

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

      <!-- Logo y nombre -->
      <a class="navbar-brand d-flex align-items-center gap-2" href="#">
        <img src="../assets/logo.png" alt="Logo" width="32" height="32" onerror="this.style.display='none'">
        <span class="ms-1">Gestor de Incidencias</span>
      </a>

      <!-- Botón hamburguesa para móvil -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">

        <!-- Enlaces para todos-->
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/incidencias">Incidencias</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/clientes">Clientes</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/equipos">Equipos</RouterLink>
          </li>

          <!-- Solo admins -->
          <li class="nav-item" v-if="authStore.empleado?.nivel_acceso === 'administrador'">
            <RouterLink class="nav-link" to="/empleados">Empleados</RouterLink>
          </li>

          <li class="nav-item" v-if="authStore.empleado?.nivel_acceso === 'administrador'">
            <RouterLink class="nav-link" to="/estadisticas">Estadísticas</RouterLink>
          </li>

          <li class="nav-item" v-if="authStore.empleado?.nivel_acceso === 'administrador'">
            <RouterLink class="nav-link" to="/logs">Registro</RouterLink>
          </li>
        </ul>

        <!-- Empleado logueado y logout -->
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