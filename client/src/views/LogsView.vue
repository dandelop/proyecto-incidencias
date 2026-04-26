<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { normalizar } from '../utils/texto.js'
import api from '../services/axios.js'

const logs = ref([])
const error = ref(null)
const cargando = ref(false)

// Filtros
const busqueda = ref('')
const filtroAccion = ref('')

// Paginación
const paginaActual = ref(1)
const porPagina = 20

const acciones = [
  'LOGIN_EXITOSO', 'LOGIN_FALLIDO', 'LOGOUT',
  'INCIDENCIA_CREADA', 'INCIDENCIA_MODIFICADA', 'INCIDENCIA_ELIMINADA',
  'CLIENTE_CREADO', 'CLIENTE_MODIFICADO', 'CLIENTE_BAJA', 'CLIENTE_ELIMINADO',
  'EMPLEADO_CREADO', 'EMPLEADO_MODIFICADO', 'PASSWORD_CAMBIADA'
]

const accionBadge = {
  LOGIN_EXITOSO: 'success',
  LOGIN_FALLIDO: 'danger',
  LOGOUT: 'secondary',
  INCIDENCIA_CREADA: 'primary',
  INCIDENCIA_MODIFICADA: 'info',
  INCIDENCIA_ELIMINADA: 'danger',
  CLIENTE_CREADO: 'primary',
  CLIENTE_MODIFICADO: 'info',
  CLIENTE_BAJA: 'warning',
  CLIENTE_ELIMINADO: 'danger',
  EMPLEADO_CREADO: 'primary',
  EMPLEADO_MODIFICADO: 'info',
  PASSWORD_CAMBIADA: 'warning'
}

const cargar = async () => {
  try {
    cargando.value = true
    const res = await api.get('/log')
    logs.value = res.data
  } catch (err) {
    error.value = 'Error al cargar los logs'
  } finally {
    cargando.value = false
  }
}

const logsFiltrados = computed(() => {
  return logs.value.filter(l => {
    const coincideBusqueda = !busqueda.value ||
      normalizar(l.detalles).includes(normalizar(busqueda.value)) ||
      normalizar(l.empleados?.nombre).includes(normalizar(busqueda.value)) ||
      normalizar(l.empleados?.apellido1).includes(normalizar(busqueda.value)) ||
      normalizar(l.ip).includes(normalizar(busqueda.value))
    const coincideAccion = !filtroAccion.value || l.accion === filtroAccion.value
    return coincideBusqueda && coincideAccion
  })
})

const logsPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina
  return logsFiltrados.value.slice(inicio, inicio + porPagina)
})

const totalPaginas = computed(() => {
  return Math.ceil(logsFiltrados.value.length / porPagina)
})

watch([busqueda, filtroAccion], () => {
  paginaActual.value = 1
})

onMounted(cargar)
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Logs de auditoría</h2>
      <span class="text-muted small">{{ logsFiltrados.length }} registros encontrados</span>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Filtros -->
    <div class="row g-3 mb-4">
      <div class="col-md-5">
        <input v-model="busqueda" type="text" class="form-control"
          placeholder="Buscar por detalles, empleado o IP..." />
      </div>
      <div class="col-md-5">
        <select v-model="filtroAccion" class="form-select">
          <option value="">Todas las acciones</option>
          <option v-for="accion in acciones" :key="accion" :value="accion">{{ accion }}</option>
        </select>
      </div>
      <div class="col-md-2">
        <button class="btn btn-outline-secondary w-100" @click="busqueda = ''; filtroAccion = ''">
          Limpiar
        </button>
      </div>
    </div>

    <div v-if="cargando" class="text-center">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <!-- Cabecera -->
      <div class="row fw-bold text-muted small px-3 mb-1">
        <div class="col-md-2">Fecha</div>
        <div class="col-md-2">Acción</div>
        <div class="col-md-3">Detalles</div>
        <div class="col-md-2">Empleado</div>
        <div class="col-md-2">IP</div>
      </div>

      <div class="list-group shadow-sm mb-4">
        <div v-for="log in logsPaginados" :key="log.id" class="list-group-item">
          <div class="row align-items-center">
            <div class="col-md-2 text-muted small">
              {{ new Date(log.fecha).toLocaleString('es-ES') }}
            </div>
            <div class="col-md-2">
              <span :class="`badge bg-${accionBadge[log.accion] || 'secondary'}`">
                {{ log.accion }}
              </span>
            </div>
            <div class="col-md-3 small">{{ log.detalles }}</div>
            <div class="col-md-2 small text-muted">
              {{ log.empleados ? `${log.empleados.nombre} ${log.empleados.apellido1}` : '—' }}
            </div>
            <div class="col-md-2 small text-muted">{{ log.ip }}</div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div class="d-flex justify-content-center mt-4" v-if="totalPaginas > 1">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: paginaActual === 1 }">
              <button class="page-link" @click="paginaActual--">Anterior</button>
            </li>
            <li v-for="p in totalPaginas" :key="p" class="page-item" :class="{ active: p === paginaActual }">
              <button class="page-link" @click="paginaActual = p">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
              <button class="page-link" @click="paginaActual++">Siguiente</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>