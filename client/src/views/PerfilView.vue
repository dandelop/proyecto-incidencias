<!--
  Vista del perfil personal del empleado autenticado. Accesible para todos los roles.

  - Visualización y edición inline de los datos personales del empleado
  - Los administradores pueden editar adicionalmente puesto y departamento
  - DNI/NIF y fecha de nacimiento son de solo lectura (modificables únicamente por un admin)
  - Cambio de contraseña con validación
  - Listado de incidencias asignadas al empleado, con enlace directo al modal de detalle
-->

<script setup>
import { ref, onMounted, computed } from 'vue'
import empleadosService from '../services/empleadosService.js'
import { authStore } from '../store/auth.js'
import * as bootstrap from 'bootstrap'
import { useRouter } from 'vue-router'
import { esPasswordValida, campoObligatorio } from '../utils/validaciones.js'

// Estado principal
const empleado = ref(null)
const empleadoEditado = ref(null)
const error = ref(null)
const cargando = ref(false)
const modoEdicion = ref(false)
const router = useRouter()

// Estado del formulario de contraseña
const errorPassword = ref(null)
const exitoPassword = ref(false)
const erroresPassword = ref({})
const passwordForm = ref({
  password_actual: '',
  password_nueva: '',
  password_confirmar: ''
})

// Incidencias asignadas
const incidencias = ref([])
const mostrarIncidencias = ref(false)
const cargandoIncidencias = ref(false)

// Determina si el usuario logueado es administrador
const esAdmin = computed(() => authStore.empleado?.nivel_acceso === 'administrador')

// Mapa de colores Bootstrap por estado de incidencia
const estadosBadge = {
  creada: 'secondary',
  en_proceso: 'primary',
  esperando_respuesta_cliente: 'warning',
  esperando_piezas: 'warning',
  reparado: 'success',
  entregado: 'success',
  cancelado: 'danger'
}

// Carga de datos
// Obtiene los datos completos del empleado logueado desde la API
const cargar = async () => {
  try {
    cargando.value = true
    empleado.value = await empleadosService.buscarPorId(authStore.empleado.id)
  } catch (err) {
    error.value = 'Error al cargar el perfil'
  } finally {
    cargando.value = false
  }
}

// Edición de datos
// Activa el modo edición copiando los datos actuales para no modificar el original
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
    empleado.value = await empleadosService.actualizar(empleado.value.id, empleadoEditado.value)
    modoEdicion.value = false
  } catch (err) {
    error.value = 'Error al actualizar el perfil'
  } finally {
    cargando.value = false
  }
}

// Cambio de contraseña
const cambiarPassword = async () => {
  errorPassword.value = null
  exitoPassword.value = false
  erroresPassword.value = {}

  // Los técnicos deben proporcionar la contraseña actual; los admins no
  if (!esAdmin.value && !campoObligatorio(passwordForm.value.password_actual)) {
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

// Incidencias asignadas
const verIncidencias = async () => {
  if (mostrarIncidencias.value) {
    mostrarIncidencias.value = false
    return
  }
  try {
    cargandoIncidencias.value = true
    mostrarIncidencias.value = true
    const data = await empleadosService.incidenciasAsignadas(empleado.value.id)
    incidencias.value = data.incidencias_asignadas || []
  } catch (err) {
    error.value = 'Error al cargar las incidencias'
  } finally {
    cargandoIncidencias.value = false
  }
}

// Ciclo de vida
onMounted(async () => {
  await cargar()
  // Carga las incidencias asignadas al empleado al montar la vista
  try {
    const data = await empleadosService.incidenciasAsignadas(authStore.empleado.id)
    incidencias.value = data.incidencias_asignadas || []
  } catch {
    incidencias.value = []
  }
})
</script>

<template>
  <div class="container" style="max-width: 900px">

    <div v-if="cargando" class="text-center mt-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else-if="empleado">

      <!-- CABECERA -->
      <div class="d-flex align-items-center gap-3 mb-4">
        <h2 class="mb-0 ms-3">Mi perfil</h2>
        <span class="badge bg-primary text-capitalize">{{ empleado.nivel_acceso }}</span>
        <span v-if="empleado.estado === 'activo'" class="badge bg-success">Activo</span>
        <span v-else-if="empleado.estado === 'vacaciones'" class="badge bg-warning">Vacaciones</span>
        <span v-else class="badge bg-danger">Baja</span>
      </div>

      <!-- DATOS DEL EMPLEADO -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">Mis datos</span>
          <div>
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

            <!-- DNI: solo lectura, no modificable desde el perfil propio -->
            <div class="col-md-4">
              <label class="form-label text-muted small">DNI/NIF</label>
              <p class="mb-0 form-control-plaintext py-1">{{ empleado.dni_nif ?? '—' }}</p>
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

            <!-- Fecha de nacimiento: solo lectura, no modificable desde el perfil propio -->
            <div class="col-md-4">
              <label class="form-label text-muted small">Fecha de nacimiento</label>
              <p class="mb-0 form-control-plaintext py-1">
                {{ empleado.fecha_nacimiento
                  ? new Date(empleado.fecha_nacimiento).toLocaleDateString('es-ES')
                  : '—' }}
              </p>
            </div>

            <div class="col-md-4">
              <label class="form-label text-muted small">Dirección</label>
              <p v-if="!modoEdicion" class="mb-0 form-control-plaintext py-1">{{ empleado.direccion ?? '—' }}</p>
              <input v-else v-model="empleadoEditado.direccion" class="form-control" />
            </div>

            <!-- Puesto: editable solo por admins -->
            <div class="col-md-4">
              <label class="form-label text-muted small">Puesto</label>
              <p v-if="!modoEdicion || !esAdmin" class="mb-0 form-control-plaintext py-1">
                {{ empleado.puesto ?? '—' }}
              </p>
              <input v-else v-model="empleadoEditado.puesto" class="form-control" />
            </div>

            <!-- Departamento: editable solo por admins -->
            <div class="col-md-4">
              <label class="form-label text-muted small">Departamento</label>
              <p v-if="!modoEdicion || !esAdmin" class="mb-0 form-control-plaintext py-1">
                {{ empleado.departamento ?? '—' }}
              </p>
              <input v-else v-model="empleadoEditado.departamento" class="form-control" />
            </div>

            <!-- Fecha de contratación -->
            <div class="col-md-4">
              <label class="form-label text-muted small">Fecha de contratación</label>
              <p class="mb-0 form-control-plaintext py-1">
                {{ empleado.fecha_contratacion
                  ? new Date(empleado.fecha_contratacion).toLocaleDateString('es-ES')
                  : '—' }}
              </p>
            </div>

          </div>
        </div>
      </div>

      <!-- CAMBIO DE CONTRASEÑA -->
      <div class="card mb-4">
        <div class="card-header fw-bold">Cambiar contraseña</div>
        <div class="card-body">
          <div v-if="errorPassword" class="alert alert-danger py-2">{{ errorPassword }}</div>
          <div v-if="exitoPassword" class="alert alert-success py-2">Contraseña actualizada correctamente</div>
          <div class="row g-3">

            <!-- Campo de contraseña actual: solo visible para técnicos -->
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

      <!-- INCIDENCIAS ASIGNADAS -->
      <div class="mt-2">
        <h5>Incidencias asignadas</h5>
        <div v-if="cargandoIncidencias" class="text-center">
          <div class="spinner-border text-primary"></div>
        </div>
        <div v-else-if="incidencias.length === 0" class="alert alert-info">
          No tienes incidencias asignadas.
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
  </div>
</template>