<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import clientesService from '../services/clientesService.js'
import incidenciasService from '../services/incidenciasService.js'
import ModalConfirmacion from '../components/ModalConfirmacion.vue'
import * as bootstrap from 'bootstrap'
import ModalInfo from '../components/ModalInfo.vue'

const route = useRoute()
const router = useRouter()
const cliente = ref(null)
const clienteEditado = ref(null)
const incidencias = ref([])
const error = ref(null)
const cargando = ref(false)
const modoEdicion = ref(false)
const mostrarIncidencias = ref(false)
const cargandoIncidencias = ref(false)
const mensajeInfo = ref('')

const estadosBadge = {
  creada: 'secondary',
  en_proceso: 'primary',
  esperando_respuesta_cliente: 'warning',
  esperando_piezas: 'warning',
  reparado: 'success',
  entregado: 'success',
  cancelado: 'danger'
}

const cargar = async () => {
  try {
    cargando.value = true
    cliente.value = await clientesService.buscarPorId(route.params.id)
  } catch (err) {
    error.value = 'Cliente no encontrado'
  } finally {
    cargando.value = false
  }
}

const activarEdicion = () => {
  clienteEditado.value = { ...cliente.value }
  modoEdicion.value = true
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  clienteEditado.value = null
}

const guardar = async () => {
  try {
    cargando.value = true
    cliente.value = await clientesService.actualizar(cliente.value.id, clienteEditado.value)
    modoEdicion.value = false
  } catch (err) {
    error.value = 'Error al actualizar el cliente'
  } finally {
    cargando.value = false
  }
}

const darDeBaja = async () => {
  try {
    const res = await clientesService.darDeBaja(cliente.value.id)
    cliente.value = res.cliente
    if (res.incidenciasCanceladas > 0) {
      mensajeInfo.value = `Se han cancelado ${res.incidenciasCanceladas} incidencias activas.`
      const modal = new bootstrap.Modal(document.getElementById('modalInfo'))
      modal.show()
    }
  } catch (err) {
    error.value = 'Error al dar de baja'
  }
}

const eliminar = async () => {
  try {
    await clientesService.eliminar(cliente.value.id)
    router.push('/clientes')
  } catch (err) {
    if (err.response?.status === 409) {
      error.value = `No se puede eliminar: el cliente tiene ${err.response.data.incidenciasActivas} incidencias activas. Cancela las incidencias o tramita su baja primero.`
    } else {
      error.value = 'Error al eliminar el cliente'
    }
  }
}

const verIncidencias = async () => {
  if (mostrarIncidencias.value) {
    mostrarIncidencias.value = false
    return
  }
  try {
    cargandoIncidencias.value = true
    mostrarIncidencias.value = true
    incidencias.value = await incidenciasService.porCliente(cliente.value.id)
  } catch (err) {
    error.value = 'Error al cargar las incidencias'
  } finally {
    cargandoIncidencias.value = false
  }
}

const darDeAlta = async () => {
  try {
    cliente.value = await clientesService.darDeAlta(cliente.value.id)
  } catch (err) {
    error.value = 'Error al dar de alta'
  }
}

onMounted(cargar)
</script>

<template>
  <div class="container" style="max-width: 900px">

    <div v-if="cargando" class="text-center mt-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="cliente">
      <!-- Cabecera -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <RouterLink to="/clientes" class="btn btn-outline-secondary btn-sm">← Volver</RouterLink>
        <h2 class="mb-0">{{ cliente.nombre }} {{ cliente.apellido1 }} {{ cliente.apellido2 }}</h2>
        <span v-if="cliente.activo" class="badge bg-success">Activo</span>
        <span v-else class="badge bg-danger">Baja</span>
      </div>

      <!-- Datos -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">Datos del cliente</span>
          <button v-if="!modoEdicion" class="btn btn-sm btn-outline-primary" @click="activarEdicion">
            Editar
          </button>
          <div v-else class="d-flex gap-2">
            <button class="btn btn-sm btn-primary" @click="guardar" :disabled="cargando">Guardar</button>
            <button class="btn btn-sm btn-outline-secondary" @click="cancelarEdicion">Cancelar</button>
          </div>
        </div>
        <div class="card-body">
          <div class="row g-3">

            <div class="col-md-4">
              <label class="form-label text-muted small">Nombre</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.nombre }}</p>
              <input v-else v-model="clienteEditado.nombre" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Apellido 1</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.apellido1 }}</p>
              <input v-else v-model="clienteEditado.apellido1" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Apellido 2</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.apellido2 ?? '—' }}</p>
              <input v-else v-model="clienteEditado.apellido2" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">DNI/NIF/CIF</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.dni_nif_cif ?? '—' }}</p>
              <input v-else v-model="clienteEditado.dni_nif_cif" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Teléfono</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.telefono ?? '—' }}</p>
              <input v-else v-model="clienteEditado.telefono" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Correo</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.correo ?? '—' }}</p>
              <input v-else v-model="clienteEditado.correo" type="email" class="form-control" />
            </div>

            <div class="col-md-6">
              <label class="form-label text-muted small">Dirección</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.direccion ?? '—' }}</p>
              <input v-else v-model="clienteEditado.direccion" class="form-control" />
            </div>

            <div class="col-md-3">
              <label class="form-label text-muted small">Ciudad</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.ciudad ?? '—' }}</p>
              <input v-else v-model="clienteEditado.ciudad" class="form-control" />
            </div>

            <div class="col-md-3">
              <label class="form-label text-muted small">Código postal</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.codigo_postal ?? '—' }}</p>
              <input v-else v-model="clienteEditado.codigo_postal" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Tipo cliente</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1 text-capitalize">{{ cliente.tipo_cliente }}
              </p>
              <select v-else v-model="clienteEditado.tipo_cliente" class="form-select">
                <option value="particular">Particular</option>
                <option value="autónomo">Autónomo</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Fecha de alta</label>
              <p class="mb-0">{{ new Date(cliente.fecha_alta).toLocaleDateString('es-ES') }}</p>
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Fecha de baja</label>
              <p class="mb-0">{{ cliente.fecha_baja ? new Date(cliente.fecha_baja).toLocaleDateString('es-ES') : '—' }}
              </p>
            </div>

            <div class="col-12">
              <label class="form-label text-muted small">Observaciones</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.observaciones ?? '—' }}</p>
              <textarea v-else v-model="clienteEditado.observaciones" class="form-control" rows="3"></textarea>
            </div>

            <div class="col-12">
              <label class="form-label text-muted small">Acepta comunicaciones</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ cliente.acepta_comunicaciones ? '✅ Sí'
                : '❌ No' }}</p>
              <div v-else class="form-check">
                <input v-model="clienteEditado.acepta_comunicaciones" type="checkbox" class="form-check-input"
                  id="comunicaciones" />
                <label class="form-check-label" for="comunicaciones">Acepta recibir comunicaciones</label>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="d-flex gap-3 mb-4">
        <button class="btn btn-outline-primary" @click="verIncidencias">
          {{ mostrarIncidencias ? 'Ocultar incidencias' : 'Ver incidencias' }}
        </button>
        <button v-if="cliente.activo" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#modalBaja">
          Dar de baja
        </button>
        <button v-else class="btn btn-outline-success" @click="darDeAlta">
          Dar de alta
        </button>
        <button class="btn btn-danger ms-auto" data-bs-toggle="modal" data-bs-target="#modalEliminar">
          Eliminar permanentemente
        </button>
      </div>

      <!-- Incidencias -->
      <div v-if="mostrarIncidencias" class="mt-2">
        <h5>Incidencias</h5>
        <div v-if="cargandoIncidencias" class="text-center">
          <div class="spinner-border text-primary"></div>
        </div>
        <div v-else-if="incidencias.length === 0" class="alert alert-info">
          Este cliente no tiene incidencias.
        </div>
        <div v-else class="list-group shadow-sm">
          <div v-for="inc in incidencias" :key="inc.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            @click="router.push(`/incidencias?id=${inc.id}`)" style="cursor: pointer">
            <div>
              <span class="fw-bold me-2">{{ inc.codigo }}</span>
              <span class="text-muted">{{ inc.titulo }}</span>
            </div>
            <span :class="`badge bg-${estadosBadge[inc.estado]}`">{{ inc.estado }}</span>
          </div>
        </div>
      </div>
    </div>
    <ModalConfirmacion id="modalBaja" titulo="¿Dar de baja?"
      mensaje="Se marcará al cliente como inactivo. Puedes reactivarlo más adelante." textoConfirmar="Confirmar"
      @confirmar="darDeBaja" />
    <ModalConfirmacion id="modalEliminar" titulo="¿Eliminar permanentemente?"
      mensaje="Esta acción no se puede deshacer. Se eliminarán todos los datos del cliente." :peligroso="true"
      textoConfirmar="Eliminar" @confirmar="eliminar" />
    <ModalInfo id="modalInfo" titulo="Aviso" :mensaje="mensajeInfo" />
  </div>
</template>