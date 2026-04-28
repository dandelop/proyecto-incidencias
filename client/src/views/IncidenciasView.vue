<!--
  Vista principal de gestión de incidencias.

  - Listar incidencias en tarjetas con datos cruzados (cliente, técnico, equipo)
  - Filtros por estado, prioridad y búsqueda de texto libre
  - Ordenar por fecha (más reciente / más antigua)
  - Filtro rápido "Mis incidencias" para ver solo las asignadas al usuario logueado
  - Paginación en cliente (20 por página)
  - Modal de detalle con edición de estado, prioridad y técnico asignado
  - Apertura automática del modal si se llega con ?id= en la URL (desde equipos o clientes)
  - Navegación directa al modal del equipo asociado desde el detalle de la incidencia

  Control de acceso en el selector de técnico:
  - Administrador: puede asignar cualquier empleado activo
  - Técnico: solo puede asignarse a sí mismo o dejar sin asignar;
             si la incidencia tiene otro técnico asignado, lo ve pero no puede seleccionarlo
-->

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import incidenciasService from '../services/incidenciasService.js'
import empleadosService from '../services/empleadosService.js'
import { useRoute, useRouter } from 'vue-router'
import * as bootstrap from 'bootstrap'
import { authStore } from '../store/auth.js'
import { normalizar } from '../utils/texto.js'

// Estado
const incidencias = ref([])
const error = ref(null)
const cargando = ref(false)
const incidenciaSeleccionada = ref(null)
const empleados = ref([])
const route = useRoute()
const router = useRouter()

// Estado del modal de detalle
const nuevoEstado = ref('')
const nuevoTecnico = ref(null)
const nuevaPrioridad = ref('')

// Filtros y ordenación
const busqueda = ref('')
const filtroEstado = ref('')
const filtroPrioridad = ref('')
const ordenReciente = ref(true)   // true = más recientes primero
const soloMias = ref(false)       // filtra por incidencias asignadas al usuario logueado

// Paginación
const paginaActual = ref(1)
const porPagina = 20

// Mapas de colores para badges de Bootstrap
const estadosBadge = {
  creada: 'secondary',
  en_proceso: 'primary',
  esperando_respuesta_cliente: 'warning',
  esperando_piezas: 'warning',
  reparado: 'success',
  entregado: 'success',
  cancelado: 'danger'
}

const prioridadBadge = {
  baja: 'success',
  media: 'warning',
  alta: 'danger',
  crítica: 'dark'
}

// Carga de datos
// Obtiene todas las incidencias con datos cruzados de cliente, equipo y empleados
const cargar = async () => {
  try {
    cargando.value = true
    incidencias.value = await incidenciasService.listarTodas()
  } catch (err) {
    error.value = 'Error al cargar las incidencias'
  } finally {
    cargando.value = false
  }
}

// Lógica del modal
// Prepara los campos editables del modal con los valores actuales de la incidencia
const abrirDetalle = (incidencia) => {
  incidenciaSeleccionada.value = incidencia
  nuevoEstado.value = incidencia.estado
  nuevoTecnico.value = incidencia.id_tecnico_asignado
  nuevaPrioridad.value = incidencia.prioridad
}

// Guarda los cambios de estado, prioridad y técnico, luego recarga la lista
const cambiarEstado = async () => {
  try {
    await incidenciasService.cambiarEstado(
      incidenciaSeleccionada.value.id,
      nuevoEstado.value,
      nuevoTecnico.value,
      nuevaPrioridad.value
    )
    await cargar()
  } catch (err) {
    error.value = 'Error al actualizar la incidencia'
  }
}

// Cierra el modal activo y navega a la vista de equipos con el modal del equipo ya abierto
const irAEquipo = (idEquipo) => {
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalDetalle'))
  modal.hide()
  router.push(`/equipos?id=${idEquipo}`)
}

// Filtrado y ordenación
const incidenciasFiltradas = computed(() => {
  return incidencias.value
    .filter(inc => {
      const coincideEstado = !filtroEstado.value || inc.estado === filtroEstado.value
      const coincidePrioridad = !filtroPrioridad.value || inc.prioridad === filtroPrioridad.value
      const coincideBusqueda = !busqueda.value ||
        normalizar(inc.titulo).includes(normalizar(busqueda.value)) ||
        normalizar(inc.codigo).includes(normalizar(busqueda.value)) ||
        normalizar(inc.clientes?.nombre).includes(normalizar(busqueda.value))
      const coincideMias = !soloMias.value || inc.id_tecnico_asignado === authStore.empleado?.id
      return coincideEstado && coincidePrioridad && coincideBusqueda && coincideMias
    })
    .sort((a, b) => {
      const diff = new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      return ordenReciente.value ? diff : -diff
    })
})

// Paginación
const incidenciasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina
  const fin = inicio + porPagina
  return incidenciasFiltradas.value.slice(inicio, fin)
})

const totalPaginas = computed(() => {
  return Math.ceil(incidenciasFiltradas.value.length / porPagina)
})

// Resetea la página al cambiar cualquier filtro para evitar páginas vacías
watch([busqueda, filtroEstado, filtroPrioridad], () => {
  paginaActual.value = 1
})

// Ciclo de vida
onMounted(async () => {
  await cargar()
  empleados.value = await empleadosService.listarActivos()

  // Si la URL incluye ?id=, abre automáticamente el modal de esa incidencia
  // Se usa al navegar desde la vista de equipos o clientes
  if (route.query.id) {
    const inc = incidencias.value.find(i => i.id === Number(route.query.id))
    if (inc) {
      abrirDetalle(inc)
      const modal = new bootstrap.Modal(document.getElementById('modalDetalle'))
      modal.show()
    }
  }
})
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Incidencias</h2>
      <span class="text-muted small">{{ incidenciasFiltradas.length }} incidencias encontradas</span>
    </div>

    <!-- FILTROS Y BUSCADOR-->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <input v-model="busqueda" type="text" class="form-control"
          placeholder="Buscar por código, título o cliente..." />
      </div>
      <div class="col-md-2">
        <select v-model="filtroEstado" class="form-select">
          <option value="">Todos los estados</option>
          <option value="creada">Creada</option>
          <option value="en_proceso">En proceso</option>
          <option value="esperando_respuesta_cliente">Esperando respuesta cliente</option>
          <option value="esperando_piezas">Esperando piezas</option>
          <option value="reparado">Reparado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <div class="col-md-2">
        <select v-model="filtroPrioridad" class="form-select">
          <option value="">Todas las prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="crítica">Crítica</option>
        </select>
      </div>

      <!-- Ordenación por fecha -->
      <div class="col-md-1">
        <button class="btn btn-outline-dark w-100" @click="ordenReciente = !ordenReciente">
          {{ ordenReciente ? '↓ Más recientes' : '↑ Más antiguas' }}
        </button>
      </div>

      <!-- Eliminar filtros aplicados -->
      <div class="col-md-1">
        <button class="btn btn-outline-dark w-100" @click="busqueda = ''; filtroEstado = ''; filtroPrioridad = ''">
          Limpiar
        </button>
      </div>

      <!-- Filtrar por incidencias propias -->
      <div class="col-md-1">
        <button class="btn w-100" :class="soloMias ? 'btn-primary' : 'btn-outline-primary'"
          @click="soloMias = !soloMias">
          {{ soloMias ? 'Todas' : 'Mis incidencias' }}
        </button>
      </div>

      <!-- Botón Nueva Incidencia -->
      <div class="col-md-2 d-flex justify-content-end">
        <RouterLink to="/incidencias/nueva" class="btn btn-primary w-100">
          Nueva incidencia
        </RouterLink>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="cargando" class="text-center">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- TARJETAS DE INCIDENCIAS -->
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
      <div v-for="inc in incidenciasPaginadas" :key="inc.id" class="col">
        <div class="card h-100 shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span class="fw-bold">{{ inc.codigo }}</span>
            <div class="d-flex gap-2">
              <span :class="`badge bg-${estadosBadge[inc.estado]}`">{{ inc.estado }}</span>
              <span :class="`badge bg-${prioridadBadge[inc.prioridad]}`">{{ inc.prioridad }}</span>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ inc.titulo }}</h5>
            <p class="card-text text-muted small mb-1">
              <strong>Cliente:</strong> {{ inc.clientes?.nombre }} {{ inc.clientes?.apellido1 }}
            </p>
            <p class="card-text text-muted small mb-1">
              <strong>Técnico:</strong>
              {{ inc.tecnico ? `${inc.tecnico.nombre} ${inc.tecnico.apellido1}` : 'Sin asignar' }}
            </p>
            <p class="card-text text-muted small">
              <strong>Creada:</strong> {{ new Date(inc.fecha_creacion).toLocaleDateString('es-ES') }}
            </p>
          </div>
          <div class="card-footer d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#modalDetalle"
              @click="abrirDetalle(inc)">
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PAGINACIÓN -->
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

    <!-- MODAL DE DETALLE -->
    <div class="modal fade" id="modalDetalle" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ incidenciaSeleccionada?.codigo }} — {{ incidenciaSeleccionada?.titulo }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body" v-if="incidenciaSeleccionada">

            <!-- Badges de estado y prioridad -->
            <div class="d-flex gap-2 mb-3">
              <span :class="`badge bg-${estadosBadge[incidenciaSeleccionada.estado]}`">
                {{ incidenciaSeleccionada.estado }}
              </span>
              <span :class="`badge bg-${prioridadBadge[incidenciaSeleccionada.prioridad]}`">
                {{ incidenciaSeleccionada.prioridad }}
              </span>
            </div>

            <!-- Datos de cliente y equipo -->
            <div class="row mb-3">
              <div class="col-md-6">
                <h6 class="text-muted">Cliente</h6>
                <p class="mb-1">
                  {{ incidenciaSeleccionada.clientes?.nombre }}
                  {{ incidenciaSeleccionada.clientes?.apellido1 }}
                </p>
                <p class="mb-1 small text-muted">{{ incidenciaSeleccionada.clientes?.correo }}</p>
                <p class="mb-1 small text-muted">{{ incidenciaSeleccionada.clientes?.telefono }}</p>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Equipo</h6>
                <!-- El nombre del equipo es un enlace que navega a su modal en la vista de equipos -->
                <p class="mb-1">
                  <span class="text-primary" style="cursor: pointer"
                    @click="irAEquipo(incidenciaSeleccionada.equipos?.id)">
                    {{ incidenciaSeleccionada.equipos?.nombre }}
                  </span>
                </p>
                <p class="mb-1 small text-muted">
                  {{ incidenciaSeleccionada.equipos?.marca }}
                  {{ incidenciaSeleccionada.equipos?.modelo }}
                </p>
                <p class="mb-1 small text-muted">
                  Serie: {{ incidenciaSeleccionada.equipos?.serial ?? 'No disponible' }}
                </p>
                <p class="mb-1 small text-muted">
                  Estado entrada: {{ incidenciaSeleccionada.equipos?.estado }}
                </p>
              </div>
            </div>

            <!-- Datos de empleados y fechas -->
            <div class="row mb-3">
              <div class="col-md-6">
                <h6 class="text-muted">Empleados</h6>
                <p class="mb-1">
                  <strong>Creador:</strong>
                  {{ incidenciaSeleccionada.creador?.nombre }}
                  {{ incidenciaSeleccionada.creador?.apellido1 }}
                </p>
                <p class="mb-1">
                  <strong>Técnico:</strong>
                  {{ incidenciaSeleccionada.tecnico
                    ? `${incidenciaSeleccionada.tecnico.nombre} ${incidenciaSeleccionada.tecnico.apellido1}`
                    : 'Sin asignar' }}
                </p>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted">Fechas</h6>
                <p class="mb-1">
                  <strong>Creación:</strong>
                  {{ new Date(incidenciaSeleccionada.fecha_creacion).toLocaleDateString('es-ES') }}
                </p>
                <p class="mb-1">
                  <strong>Inicio:</strong>
                  {{ incidenciaSeleccionada.fecha_inicio
                    ? new Date(incidenciaSeleccionada.fecha_inicio).toLocaleDateString('es-ES')
                    : 'Sin iniciar' }}
                </p>
                <p class="mb-1">
                  <strong>Cierre:</strong>
                  {{ incidenciaSeleccionada.fecha_cierre
                    ? new Date(incidenciaSeleccionada.fecha_cierre).toLocaleDateString('es-ES')
                    : 'Sin cerrar' }}
                </p>
                <p class="mb-1">
                  <strong>Presupuesto:</strong>
                  {{ incidenciaSeleccionada.presupuesto
                    ? incidenciaSeleccionada.presupuesto + '€'
                    : 'Sin presupuesto' }}
                </p>
              </div>
            </div>

            <!-- Descripción y diagnóstico (opcionales) -->
            <div v-if="incidenciaSeleccionada.descripcion" class="mb-3">
              <h6 class="text-muted">Descripción</h6>
              <p class="text-muted">{{ incidenciaSeleccionada.descripcion }}</p>
            </div>

            <div v-if="incidenciaSeleccionada.diagnostico" class="mb-3">
              <h6 class="text-muted">Diagnóstico</h6>
              <p class="text-muted">{{ incidenciaSeleccionada.diagnostico }}</p>
            </div>

            <!-- Sección de edición rápida -->
            <hr>
            <div class="row g-3">
              <div class="col-md-4">
                <label class="fw-bold">Estado:</label>
                <select v-model="nuevoEstado" class="form-select">
                  <option value="creada">Creada</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="esperando_respuesta_cliente">Esperando respuesta cliente</option>
                  <option value="esperando_piezas">Esperando piezas</option>
                  <option value="reparado">Reparado</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="fw-bold">Prioridad:</label>
                <select v-model="nuevaPrioridad" class="form-select">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="crítica">Crítica</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="fw-bold">Técnico asignado:</label>

                <!-- Administrador: puede asignar cualquier empleado activo -->
                <select v-if="authStore.empleado?.nivel_acceso === 'administrador'" v-model="nuevoTecnico"
                  class="form-select">
                  <option :value="null">Sin asignar</option>
                  <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                    {{ emp.nombre }} {{ emp.apellido1 }}
                  </option>
                </select>

                <!-- Técnico: puede asignarse a sí mismo o dejar sin asignar.
                     Si hay otro técnico asignado, lo ve como opción deshabilitada. -->
                <div v-else>
                  <select v-model="nuevoTecnico" class="form-select">
                    <option :value="null">Sin asignar</option>
                    <option v-if="incidenciaSeleccionada?.id_tecnico_asignado &&
                      incidenciaSeleccionada?.id_tecnico_asignado !== authStore.empleado?.id"
                      :value="incidenciaSeleccionada.id_tecnico_asignado" disabled>
                      {{ incidenciaSeleccionada?.tecnico?.nombre }}
                      {{ incidenciaSeleccionada?.tecnico?.apellido1 }} (asignado)
                    </option>
                    <option :value="authStore.empleado?.id">
                      {{ authStore.empleado?.nombre }} {{ authStore.empleado?.apellido1 }} (yo)
                    </option>
                  </select>
                </div>
              </div>

              <div class="col-12">
                <button class="btn btn-primary" @click="cambiarEstado" data-bs-dismiss="modal">
                  Guardar cambios
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>