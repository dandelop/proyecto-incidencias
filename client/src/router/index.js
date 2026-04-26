import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../store/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/empleados',
      name: 'empleados',
      meta: { requiresAuth: true, soloAdmin: true },
      component: () => import('../views/EmpleadosView.vue')
    },
    {
      path: '/clientes',
      name: 'clientes',
      meta: { requiresAuth: true },
      component: () => import('../views/ClientesView.vue')
    },
    {
      path: '/incidencias',
      name: 'incidencias',
      meta: { requiresAuth: true },
      component: () => import('../views/IncidenciasView.vue')
    },
    {
      path: '/equipos',
      name: 'equipos',
      meta: { requiresAuth: true },
      component: () => import('../views/EquiposView.vue')
    },
    {
      path: '/incidencias/nueva',
      name: 'incidencia-nueva',
      meta: { requiresAuth: true },
      component: () => import('../views/IncidenciaNuevaView.vue')
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
    {
      path: '/empleados',
      name: 'empleados',
      meta: { requiresAuth: true, soloAdmin: true },
      component: () => import('../views/EmpleadosView.vue')
    },
    {
      path: '/perfil',
      name: 'perfil',
      meta: { requiresAuth: true },
      component: () => import('../views/PerfilView.vue')
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
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

// Navigation guard — se ejecuta antes de cada cambio de ruta
router.beforeEach(async (to, from) => {

  // Limpia backdrops de bootstrap al navegar
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
  document.body.classList.remove('modal-open')
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''

  // esperar a que termine de cargar
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

  const requiresAuth = to.meta.requiresAuth
  const soloAdmin = to.meta.soloAdmin

  if (requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login' }
  }

  if (soloAdmin && authStore.empleado?.nivel_acceso !== 'administrador') {
    return { name: 'incidencias' }
  }
})

export default router