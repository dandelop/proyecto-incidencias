<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import empleadosService from '../services/empleadosService.js'
import { authStore } from '../store/auth.js'
import ModalConfirmacion from '../components/ModalConfirmacion.vue'
import * as bootstrap from 'bootstrap'
import ModalInfo from '../components/ModalInfo.vue'
import { esPasswordValida, campoObligatorio } from '../utils/validaciones.js'

const route = useRoute()
const router = useRouter()
const empleado = ref(null)
const empleadoEditado = ref(null)
const error = ref(null)
const cargando = ref(false)
const modoEdicion = ref(false)
const errorPassword = ref(null)
const exitoPassword = ref(false)
const incidencias = ref([])
const cargandoIncidencias = ref(false)
const mensajeInfo = ref('')
const erroresPassword = ref({})

const esAdmin = computed(() => authStore.empleado?.nivel_acceso === 'administrador')
const esPropioPerfil = computed(() => authStore.empleado?.id === empleado.value?.id)

const estadosBadge = {
  creada: 'secondary',
  en_proceso: 'primary',
  esperando_respuesta_cliente: 'warning',
  esperando_piezas: 'warning',
  reparado: 'success',
  entregado: 'success',
  cancelado: 'danger'
}

const passwordForm = ref({
  password_actual: '',
  password_nueva: '',
  password_confirmar: ''
})

const cargar = async () => {
  try {
    cargando.value = true
    empleado.value = await empleadosService.buscarPorId(route.params.id)
  } catch (err) {
    error.value = 'Empleado no encontrado'
  } finally {
    cargando.value = false
  }
}

const activarEdicion = () => {
  empleadoEditado.value = { ...empleado.value }
  modoEdicion.value = true
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  empleadoEditado.value = null
}

const guardar = async () => {
  try {
    cargando.value = true
    const res = await empleadosService.actualizar(empleado.value.id, empleadoEditado.value)
    empleado.value = res.empleado
    modoEdicion.value = false
    await cargarIncidencias() // ← añade esto
    if (res.incidenciasDesasignadas > 0) {
      mensajeInfo.value = `Se han desasignado ${res.incidenciasDesasignadas} incidencias activas.`
      const modal = new bootstrap.Modal(document.getElementById('modalInfo'))
      modal.show()
    }
  } catch (err) {
    error.value = 'Error al actualizar el empleado'
  } finally {
    cargando.value = false
  }
}

const cambiarPassword = async () => {
  errorPassword.value = null
  exitoPassword.value = false
  erroresPassword.value = {}

  // Validaciones
  if (!esAdmin && !campoObligatorio(passwordForm.value.password_actual)) {
    erroresPassword.value.password_actual = 'La contraseña actual es obligatoria'
  }
  if (!campoObligatorio(passwordForm.value.password_nueva)) {
    erroresPassword.value.password_nueva = 'La nueva contraseña es obligatoria'
  } else if (!esPasswordValida(passwordForm.value.password_nueva)) {
    erroresPassword.value.password_nueva = 'Mínimo 6 caracteres'
  }
  if (passwordForm.value.password_nueva !== passwordForm.value.password_confirmar) {
    erroresPassword.value.password_confirmar = 'Las contraseñas no coinciden'
  }

  if (Object.keys(erroresPassword.value).length > 0) return

  try {
    await empleadosService.cambiarPassword(empleado.value.id, {
      password_actual: passwordForm.value.password_actual,
      password_nueva: passwordForm.value.password_nueva
    })
    exitoPassword.value = true
    passwordForm.value = { password_actual: '', password_nueva: '', password_confirmar: '' }
  } catch (err) {
    errorPassword.value = err.response?.data?.error || 'Error al cambiar la contraseña'
  }
}

const cargarIncidencias = async () => {
  try {
    const data = await empleadosService.incidenciasAsignadas(route.params.id)
    incidencias.value = data.incidencias_asignadas || []
  } catch {
    incidencias.value = []
  }
}

onMounted(async () => {
  await cargar()
  await cargarIncidencias()
})
</script>

<template>
  <div class="container" style="max-width: 900px">

    <div v-if="cargando" class="text-center mt-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="empleado">
      <!-- Cabecera -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <RouterLink to="/empleados" class="btn btn-outline-secondary btn-sm">← Volver</RouterLink>
        <h2 class="mb-0">{{ empleado.nombre }} {{ empleado.apellido1 }} {{ empleado.apellido2 }}</h2>
        <span class="badge bg-primary text-capitalize">{{ empleado.nivel_acceso }}</span>
        <span v-if="empleado.estado === 'activo'" class="badge bg-success">Activo</span>
        <span v-else-if="empleado.estado === 'vacaciones'" class="badge bg-warning">Vacaciones</span>
        <span v-else-if="empleado.estado === 'desvinculado'" class="badge bg-secondary">Desvinculado</span>
        <span v-else class="badge bg-danger">Baja</span>
      </div>

      <!-- Datos -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">Datos del empleado</span>
          <div v-if="esAdmin || esPropioPerfil">
            <button v-if="!modoEdicion" class="btn btn-sm btn-outline-primary" @click="activarEdicion">
              Editar
            </button>
            <div v-else class="d-flex gap-2">
              <button class="btn btn-sm btn-primary" @click="guardar" :disabled="cargando">Guardar</button>
              <button class="btn btn-sm btn-outline-secondary" @click="cancelarEdicion">Cancelar</button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <div class="row g-3">

            <div class="col-md-4">
              <label class="form-label text-muted small">Nombre</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.nombre }}</p>
              <input v-else v-model="empleadoEditado.nombre" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Apellido 1</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.apellido1 }}</p>
              <input v-else v-model="empleadoEditado.apellido1" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Apellido 2</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.apellido2 ?? '—' }}</p>
              <input v-else v-model="empleadoEditado.apellido2" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">DNI/NIF</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.dni_nif ?? '—' }}</p>
              <input v-else v-model="empleadoEditado.dni_nif" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Teléfono</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.telefono ?? '—' }}</p>
              <input v-else v-model="empleadoEditado.telefono" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Correo</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.correo }}</p>
              <input v-else v-model="empleadoEditado.correo" type="email" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Fecha de nacimiento</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.fecha_nacimiento ? new
                Date(empleado.fecha_nacimiento).toLocaleDateString('es-ES') : '—' }}</p>
              <input v-else v-model="empleadoEditado.fecha_nacimiento" type="date" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Dirección</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.direccion ?? '—' }}</p>
              <input v-else v-model="empleadoEditado.direccion" class="form-control" />
            </div>

            <!-- Solo admin -->
            <div class="col-md-4" v-if="esAdmin">
              <label class="form-label text-muted small">Puesto</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.puesto ?? '—' }}</p>
              <input v-else v-model="empleadoEditado.puesto" class="form-control" />
            </div>

            <div class="col-md-4" v-if="esAdmin">
              <label class="form-label text-muted small">Departamento</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.departamento ?? '—' }}</p>
              <input v-else v-model="empleadoEditado.departamento" class="form-control" />
            </div>

            <div class="col-md-4" v-if="esAdmin">
              <label class="form-label text-muted small">Nivel de acceso</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1 text-capitalize">{{ empleado.nivel_acceso
              }}</p>
              <select v-else v-model="empleadoEditado.nivel_acceso" class="form-select">
                <option value="técnico">Técnico</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div class="col-md-4" v-if="esAdmin">
              <label class="form-label text-muted small">Estado laboral</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1 text-capitalize">{{ empleado.estado }}</p>
              <select v-else v-model="empleadoEditado.estado" class="form-select">
                <option value="activo">Activo</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="baja">Baja</option>
                <option value="desvinculado">Desvinculado</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Fecha de contratación</label>
              <p class="mb-0 form-control-plaintext py-1">{{ empleado.fecha_contratacion ? new
                Date(empleado.fecha_contratacion).toLocaleDateString('es-ES') : '—' }}</p>
            </div>

          </div>
        </div>
      </div>

      <!-- Cambiar contraseña -->
      <div class="card mb-4" v-if="esAdmin || esPropioPerfil">
        <div class="card-header fw-bold">Cambiar contraseña</div>
        <div class="card-body">
          <div v-if="errorPassword" class="alert alert-danger py-2">{{ errorPassword }}</div>
          <div v-if="exitoPassword" class="alert alert-success py-2">Contraseña actualizada correctamente</div>
          <div class="row g-3">

            <div class="col-md-4" v-if="!esAdmin">
              <label class="form-label">Contraseña actual</label>
              <input v-model="passwordForm.password_actual" type="password"
                :class="['form-control', erroresPassword.password_actual ? 'is-invalid' : '']" />
              <div class="invalid-feedback">{{ erroresPassword.password_actual }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Nueva contraseña</label>
              <input v-model="passwordForm.password_nueva" type="password"
                :class="['form-control', erroresPassword.password_nueva ? 'is-invalid' : '']" />
              <div class="invalid-feedback">{{ erroresPassword.password_nueva }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Confirmar contraseña</label>
              <input v-model="passwordForm.password_confirmar" type="password"
                :class="['form-control', erroresPassword.password_confirmar ? 'is-invalid' : '']" />
              <div class="invalid-feedback">{{ erroresPassword.password_confirmar }}</div>
            </div>

          </div>
          <button class="btn btn-primary mt-3" @click="cambiarPassword">
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>

    <!-- Incidencias -->
    <div yclass="mt-2">
      <h5>Incidencias asignadas</h5>
      <div v-if="cargandoIncidencias" class="text-center">
        <div class="spinner-border text-primary"></div>
      </div>
      <div v-else-if="incidencias.length === 0" class="alert alert-info">
        Este empleado no tiene incidencias asignadas.
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
    <ModalInfo id="modalInfo" titulo="Aviso" :mensaje="mensajeInfo" />
  </div>
</template>