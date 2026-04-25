<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import equiposService from '../services/equiposService.js'
import * as bootstrap from 'bootstrap'
import { useRouter, useRoute } from 'vue-router'
import { normalizar } from '../utils/texto.js'

const equipos = ref([])
const error = ref(null)
const cargando = ref(false)
const equipoSeleccionado = ref(null)
const historial = ref([])
const cargandoHistorial = ref(false)
const router = useRouter()
const route = useRoute()

// Filtros y búsqueda
const busqueda = ref('')
const filtroTipo = ref('')

// Paginación
const paginaActual = ref(1)
const porPagina = 6

const estadosBadge = {
  creada: 'secondary',
  en_proceso: 'primary',
  esperando_respuesta_cliente: 'warning',
  esperando_piezas: 'warning',
  reparado: 'success',
  entregado: 'success',
  cancelado: 'danger'
}

const tiposBadge = {
  smartphone: 'primary',
  portátil: 'info',
  sobremesa: 'secondary',
  tablet: 'warning',
  consola: 'danger',
  periférico: 'dark',
  otro: 'light'
}

const cargar = async () => {
  try {
    cargando.value = true
    equipos.value = await equiposService.listarTodos()
  } catch (err) {
    error.value = 'Error al cargar los equipos'
  } finally {
    cargando.value = false
  }
}

const equiposFiltrados = computed(() => {
  return equipos.value.filter(e => {
    const coincideBusqueda = !busqueda.value ||
      normalizar(e.nombre).includes(normalizar(busqueda.value)) ||
      normalizar(e.marca).includes(normalizar(busqueda.value)) ||
      normalizar(e.modelo).includes(normalizar(busqueda.value)) ||
      normalizar(e.serial).includes(normalizar(busqueda.value))
    const coincideTipo = !filtroTipo.value || e.tipo === filtroTipo.value
    return coincideBusqueda && coincideTipo
  })
})

const equiposPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina
  return equiposFiltrados.value.slice(inicio, inicio + porPagina)
})

const totalPaginas = computed(() => {
  return Math.ceil(equiposFiltrados.value.length / porPagina)
})

watch([busqueda, filtroTipo], () => {
  paginaActual.value = 1
})

const abrirDetalle = async (equipo) => {
  equipoSeleccionado.value = equipo
  historial.value = []
  const modal = new bootstrap.Modal(document.getElementById('modalEquipo'))
  modal.show()
  try {
    cargandoHistorial.value = true
    const data = await equiposService.historialIncidencias(equipo.id)
    historial.value = data.incidencias || []
  } catch (err) {
    historial.value = []
  } finally {
    cargandoHistorial.value = false
  }
}

onMounted(async () => {
  await cargar()
  if (route.query.id) {
    const equipo = equipos.value.find(e => e.id === Number(route.query.id))
    if (equipo) await abrirDetalle(equipo)
  }
})
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Equipos</h2>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Filtros -->
    <div class="row g-3 mb-4">
      <div class="col-md-5">
        <input v-model="busqueda" type="text" class="form-control"
          placeholder="Buscar por nombre, marca, modelo o serial..." />
      </div>
      <div class="col-md-4">
        <select v-model="filtroTipo" class="form-select">
          <option value="">Todos los tipos</option>
          <option value="smartphone">Smartphone</option>
          <option value="portátil">Portátil</option>
          <option value="sobremesa">Sobremesa</option>
          <option value="tablet">Tablet</option>
          <option value="consola">Consola</option>
          <option value="periférico">Periférico</option>
          <option value="otro">Otro</option>
        </select>
      </div>
      <div class="col-md-3">
        <button class="btn btn-outline-secondary w-100" @click="busqueda = ''; filtroTipo = ''">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Tarjetas -->
    <div v-if="cargando" class="text-center">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        <div v-for="e in equiposPaginados" :key="e.id" class="col">
          <div class="card h-100 shadow-sm" style="cursor: pointer" @click="abrirDetalle(e)">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span class="fw-bold">{{ e.nombre }}</span>
              <span :class="`badge bg-${tiposBadge[e.tipo]} text-capitalize`">{{ e.tipo }}</span>
            </div>
            <div class="card-body">
              <p class="card-text text-muted small mb-1">
                <strong>Marca:</strong> {{ e.marca ?? '—' }}
              </p>
              <p class="card-text text-muted small mb-1">
                <strong>Modelo:</strong> {{ e.modelo ?? '—' }}
              </p>
              <p class="card-text text-muted small">
                <strong>Serial:</strong> {{ e.serial ?? '—' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p class="text-muted small mt-3">{{ equiposFiltrados.length }} equipos encontrados</p>

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

    <!-- Modal detalle -->
    <div class="modal fade" id="modalEquipo" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ equipoSeleccionado?.nombre }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="equipoSeleccionado">
            <div class="row mb-3">
              <div class="col-md-6">
                <p class="text-muted small mb-1">Tipo</p>
                <p><span :class="`badge bg-${tiposBadge[equipoSeleccionado.tipo]} text-capitalize`">{{
                  equipoSeleccionado.tipo }}</span></p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Estado de entrada</p>
                <p>{{ equipoSeleccionado.estado }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Marca</p>
                <p>{{ equipoSeleccionado.marca ?? '—' }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Modelo</p>
                <p>{{ equipoSeleccionado.modelo ?? '—' }}</p>
              </div>
              <div class="col-md-6">
                <p class="text-muted small mb-1">Serial</p>
                <p>{{ equipoSeleccionado.serial ?? '—' }}</p>
              </div>
            </div>

            <hr>
            <h6>Historial de incidencias</h6>
            <div v-if="cargandoHistorial" class="text-center">
              <div class="spinner-border spinner-border-sm text-primary"></div>
            </div>
            <div v-else-if="historial.length === 0" class="text-muted small">
              Sin incidencias registradas.
            </div>
            <div v-else class="list-group">
              <div v-for="inc in historial" :key="inc.id"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                @click="router.push(`/incidencias?id=${inc.id}`)" style="cursor: pointer">
                <div>
                  <span class="fw-bold me-2">{{ inc.codigo }}</span>
                  <span class="text-muted small">{{ inc.titulo }}</span>
                </div>
                <span :class="`badge bg-${estadosBadge[inc.estado]}`">{{ inc.estado }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>