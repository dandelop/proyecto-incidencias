<!--
  Vista principal del módulo de empleados. Solo accesible para administradores
  Muestra el listado completo con búsqueda, filtros y paginación en el cliente
  El empleado logueado no aparece en el listado - debe gestionarse desde su perfil
  Cada fila es clicable y navega al detalle del empleado
-->

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import empleadosService from '../services/empleadosService.js'
import { authStore } from '../store/auth.js'
import { normalizar } from '../utils/texto.js'

const router = useRouter()
const empleados = ref([])
const error = ref(null)
const cargando = ref(false)

// Filtros y paginación
const busqueda = ref('')
const filtroNivel = ref('')
const filtroDepartamento = ref('')
const filtroEstado = ref('')
const paginaActual = ref(1)
const porPagina = 15

// Carga el listado completo de empleados
// Se opta por una carga total inicial delegando el filtrado al cliente
// para mejorar la reactividad de la búsqueda
const cargar = async () => {
  try {
    cargando.value = true
    empleados.value = await empleadosService.listarTodos()
  } catch (err) {
    error.value = 'Error al cargar los empleados'
  } finally {
    cargando.value = false
  }
}

// Lógica centralizada de filtrado
// Implementa normalización de texto para ignorar tildes y mayúsculas
// Excluye al usuario actual para evitar auto-gestión desde este listado
const empleadosFiltrados = computed(() => {
  return empleados.value.filter(e => {
    const noEsElMismo = e.id !== authStore.empleado?.id

    // Búsqueda múltiple: nombre, apellidos, correo y DNI
    const coincideBusqueda = !busqueda.value ||
      normalizar(e.nombre).includes(normalizar(busqueda.value)) ||
      normalizar(e.apellido1).includes(normalizar(busqueda.value)) ||
      normalizar(e.correo).includes(normalizar(busqueda.value)) ||
      normalizar(e.dni_nif).includes(normalizar(busqueda.value))
    const coincideNivel = !filtroNivel.value || e.nivel_acceso === filtroNivel.value
    const coincideDepartamento = !filtroDepartamento.value ||
      normalizar(e.departamento).includes(normalizar(filtroDepartamento.value))
    const coincideEstado = !filtroEstado.value || e.estado === filtroEstado.value
    return noEsElMismo && coincideBusqueda && coincideNivel && coincideDepartamento && coincideEstado
  })
})

// Segmentación para paginación basada en el resultado ya filtrado
const empleadosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina
  return empleadosFiltrados.value.slice(inicio, inicio + porPagina)
})

const totalPaginas = computed(() => {
  return Math.ceil(empleadosFiltrados.value.length / porPagina)
})

// Si se cambia cualquier filtro, volvemos a la página 1 para evitar listados vacíos
watch([busqueda, filtroNivel, filtroDepartamento, filtroEstado], () => {
  paginaActual.value = 1
})

onMounted(cargar)
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3 ms-3 me-3">
      <h2>Empleados</h2>
      <span class="text-muted small">{{ empleadosFiltrados.length }} empleados encontrados</span>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Filtros -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <input v-model="busqueda" type="text" class="form-control" placeholder="Buscar por nombre, correo o DNI..." />
      </div>

      <!-- Filtro de nivel de acceso -->
      <div class="col-md-2">
        <select v-model="filtroNivel" class="form-select">
          <option value="">Todos los niveles</option>
          <option value="administrador">Administrador</option>
          <option value="técnico">Técnico</option>
        </select>
      </div>

      <!-- Filtro de departamento con búsqueda parcial -->
      <div class="col-md-2">
        <input v-model="filtroDepartamento" type="text" class="form-control"
          placeholder="Filtrar por departamento..." />
      </div>

      <!-- Filtro de estado laboral -->
      <div class="col-md-2">
        <select v-model="filtroEstado" class="form-select">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="baja">Baja</option>
          <option value="vacaciones">Vacaciones</option>
          <option value="desvinculado">Desvinculado</option>
        </select>
      </div>

      <!-- Botón para limpiar todos los filtros -->
      <div class="col-md-1">
        <button class="btn btn-outline-dark w-100"
          @click="busqueda = ''; filtroNivel = ''; filtroDepartamento = ''; filtroEstado = ''">
          Limpiar
        </button>
      </div>

      <div class="col-md-2">
        <RouterLink to="/empleados/nuevo" class="btn btn-primary w-100">Nuevo empleado</RouterLink>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="cargando" class="text-center">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <!-- Cabecera de columnas -->
      <div class="row fw-bold text-muted small px-3 mb-1">
        <div class="col-md-2">Nombre</div>
        <div class="col-md-2">Apellidos</div>
        <div class="col-md-3">Correo</div>
        <div class="col-md-2">Departamento</div>
        <div class="col-md-1">Nivel</div>
        <div class="col-md-1">Estado</div>
        <div class="col-md-1">Alta</div>
      </div>

      <!-- Listado de empleados -->
      <div class="list-group shadow-sm mb-4">
        <div v-for="e in empleadosPaginados" :key="e.id" class="list-group-item list-group-item-action"
          @click="router.push(`/empleados/${e.id}`)" style="cursor: pointer">
          <div class="row align-items-center">
            <div class="col-md-2 fw-bold">{{ e.nombre }}</div>
            <div class="col-md-2">{{ e.apellido1 }} {{ e.apellido2 ?? '' }}</div>
            <div class="col-md-3 text-muted small">{{ e.correo }}</div>
            <div class="col-md-2 text-muted small">{{ e.departamento }}</div>
            <div class="col-md-1">
              <!-- text-capitalize aprovecha el CSS para capitalizar sin modificar el valor del enum -->
              <span class="badge bg-primary text-capitalize">{{ e.nivel_acceso }}</span>
            </div>
            <div class="col-md-1">
              <span v-if="e.estado === 'activo'" class="badge bg-success">Activo</span>
              <span v-else-if="e.estado === 'vacaciones'" class="badge bg-warning">Vacaciones</span>
              <span v-else-if="e.estado === 'desvinculado'" class="badge bg-secondary">Desvinculado</span>
              <span v-else class="badge bg-danger">Baja</span>
            </div>
            <div class="col-md-1 text-muted small">
              {{ new Date(e.fecha_contratacion).toLocaleDateString('es-ES') }}
            </div>
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