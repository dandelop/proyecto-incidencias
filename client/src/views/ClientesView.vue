<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import clientesService from '../services/clientesService.js'
import { normalizar } from '../utils/texto.js'

const router = useRouter()
const clientes = ref([])
const error = ref(null)
const cargando = ref(false)

// Filtros y búsqueda
const busqueda = ref('')
const filtroTipo = ref('')
const filtroActivo = ref('')

// Paginación
const paginaActual = ref(1)
const porPagina = 15

const cargar = async () => {
  try {
    cargando.value = true
    clientes.value = await clientesService.listarTodos()
  } catch (err) {
    error.value = 'Error al cargar los clientes'
  } finally {
    cargando.value = false
  }
}

const clientesFiltrados = computed(() => {
  return clientes.value.filter(c => {
    const coincideBusqueda = !busqueda.value ||
      normalizar(c.nombre).includes(normalizar(busqueda.value)) ||
      normalizar(c.apellido1).includes(normalizar(busqueda.value)) ||
      normalizar(c.correo).includes(normalizar(busqueda.value)) ||
      normalizar(c.dni_nif_cif).includes(normalizar(busqueda.value)) ||
      normalizar(c.telefono).includes(normalizar(busqueda.value))
    const coincideTipo = !filtroTipo.value || c.tipo_cliente === filtroTipo.value
    const coincideActivo = filtroActivo.value === '' || c.activo === (filtroActivo.value === 'true')
    return coincideBusqueda && coincideTipo && coincideActivo
  })
})

const clientesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina
  return clientesFiltrados.value.slice(inicio, inicio + porPagina)
})

const totalPaginas = computed(() => {
  return Math.ceil(clientesFiltrados.value.length / porPagina)
})

watch([busqueda, filtroTipo, filtroActivo], () => {
  paginaActual.value = 1
})

onMounted(cargar)
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Clientes</h2>
      <RouterLink to="/clientes/nuevo" class="btn btn-primary">Nuevo cliente</RouterLink>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Filtros -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <input v-model="busqueda" type="text" class="form-control"
          placeholder="Buscar por nombre, correo, DNI o teléfono..." />
      </div>
      <div class="col-md-3">
        <select v-model="filtroTipo" class="form-select">
          <option value="">Todos los tipos</option>
          <option value="particular">Particular</option>
          <option value="autónomo">Autónomo</option>
          <option value="empresa">Empresa</option>
        </select>
      </div>
      <div class="col-md-3">
        <select v-model="filtroActivo" class="form-select">
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Bajas</option>
        </select>
      </div>
      <div class="col-md-2">
        <button class="btn btn-outline-secondary w-100" @click="busqueda = ''; filtroTipo = ''; filtroActivo = ''">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="cargando" class="text-center">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <!-- Cabecera -->
      <div class="row fw-bold text-muted small px-3 mb-1">
        <div class="col-md-2">Nombre</div>
        <div class="col-md-2">Apellidos</div>
        <div class="col-md-3">Correo</div>
        <div class="col-md-1">Teléfono</div>
        <div class="col-md-1">Tipo</div>
        <div class="col-md-1">Estado</div>
        <div class="col-md-2">Comunicaciones</div>
      </div>

      <div class="list-group shadow-sm mb-4">
        <div v-for="c in clientesPaginados" :key="c.id" class="list-group-item list-group-item-action"
          @click="router.push(`/clientes/${c.id}`)" style="cursor: pointer">
          <div class="row align-items-center">
            <div class="col-md-2 fw-bold">{{ c.nombre }}</div>
            <div class="col-md-2">{{ c.apellido1 }} {{ c.apellido2 ?? '' }}</div>
            <div class="col-md-3 text-muted small">{{ c.correo }}</div>
            <div class="col-md-1 text-muted small">{{ c.telefono }}</div>
            <div class="col-md-1">
              <span class="badge bg-secondary text-capitalize">{{ c.tipo_cliente }}</span>
            </div>
            <div class="col-md-1">
              <span v-if="c.activo" class="badge bg-success">Activo</span>
              <span v-else class="badge bg-danger">Baja</span>
            </div>
            <div class="col-md-2 text-muted small">
              {{ c.acepta_comunicaciones ? '✅ Sí' : '❌ No' }}
            </div>
          </div>
        </div>
      </div>

      <p class="text-muted small">{{ clientesFiltrados.length }} clientes encontrados</p>

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