/*
  Configuración del enrutador de la aplicación (Vue Router)

  Las rutas usan lazy loading mediante import() dinámico para cargar cada vista
  solo cuando el usuario navega a ella, mejorando el rendimiento inicial

  Metadatos de ruta:
  - requiresAuth: la ruta requiere sesión activa
  - soloAdmin:    la ruta requiere nivel_acceso 'administrador'
*/

import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../store/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    // Redirige la raíz al login por defecto
    { path: '/', redirect: '/login' },

    // Página de login — única ruta pública
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },

    // Gestión de incidencias
    {
      path: '/incidencias',
      name: 'incidencias',
      meta: { requiresAuth: true },
      component: () => import('../views/IncidenciasView.vue')
    },
    {
      path: '/incidencias/nueva',
      name: 'incidencia-nueva',
      meta: { requiresAuth: true },
      component: () => import('../views/IncidenciaNuevaView.vue')
    },

    // Gestión de clientes
    {
      path: '/clientes',
      name: 'clientes',
      meta: { requiresAuth: true },
      component: () => import('../views/ClientesView.vue')
    },
    {
      path: '/clientes/nuevo',
      name: 'cliente-nuevo',
      meta: { requiresAuth: true },
      component: () => import('../views/ClienteNuevoView.vue')
    },
    {
      path: '/clientes/:id',
      name: 'cliente-detalle',
      meta: { requiresAuth: true },
      component: () => import('../views/ClienteDetalleView.vue')
    },

    // Gestión de equipos
    {
      path: '/equipos',
      name: 'equipos',
      meta: { requiresAuth: true },
      component: () => import('../views/EquiposView.vue')
    },

    // Perfil del empleado logueado — accesible para todos los roles
    {
      path: '/perfil',
      name: 'perfil',
      meta: { requiresAuth: true },
      component: () => import('../views/PerfilView.vue')
    },

    // Gestión de empleados — solo administradores
    {
      path: '/empleados',
      name: 'empleados',
      meta: { requiresAuth: true, soloAdmin: true },
      component: () => import('../views/EmpleadosView.vue')
    },
    {
      path: '/empleados/nuevo',
      name: 'empleado-nuevo',
      meta: { requiresAuth: true, soloAdmin: true },
      component: () => import('../views/EmpleadoNuevoView.vue')
    },
    {
      path: '/empleados/:id',
      name: 'empleado-detalle',
      meta: { requiresAuth: true },
      component: () => import('../views/EmpleadoDetalleView.vue')
    },

    // Auditoría y estadísticas — solo administradores
    {
      path: '/logs',
      name: 'logs',
      meta: { requiresAuth: true, soloAdmin: true },
      component: () => import('../views/LogsView.vue')
    },
    {
      path: '/estadisticas',
      name: 'estadisticas',
      meta: { requiresAuth: true, soloAdmin: true },
      component: () => import('../views/EstadisticasView.vue')
    },

    // Catch-all: cualquier ruta desconocida redirige a incidencias
    // El navigation guard se encargará de redirigir al login si no hay sesión
    { path: '/:pathMatch(.*)*', redirect: '/incidencias' }
  ],
})

// Navigation guard — se ejecuta antes de cada cambio de ruta
router.beforeEach(async (to, from) => {

  // Limpia backdrops huérfanos de Bootstrap que puedan quedar al navegar
  // desde una vista con modal abierto
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
  document.body.classList.remove('modal-open')
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''

  // Espera a que App.vue termine de comprobar la sesión con /autenticacion/me
  // antes de evaluar cualquier condición de acceso
  if (authStore.cargando) {
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (!authStore.cargando) {
          clearInterval(interval)
          resolve()
        }
      }, 50)
    })
  }

  // Si el usuario ya está autenticado e intenta acceder al login,
  // se le redirige directamente a incidencias
  if (to.name === 'login' && authStore.isLoggedIn) {
    return { name: 'incidencias' }
  }

  // Ruta protegida sin sesión activa → login
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login' }
  }

  // Ruta exclusiva de administrador con usuario técnico → incidencias
  if (to.meta.soloAdmin && authStore.empleado?.nivel_acceso !== 'administrador') {
    return { name: 'incidencias' }
  }
})

export default router