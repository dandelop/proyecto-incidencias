<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import empleadosService from '../services/empleadosService.js'
import { esEmailValido, esPasswordValida, campoObligatorio } from '../utils/validaciones.js'

const router = useRouter()
const error = ref(null)
const cargando = ref(false)
const errores = ref({})

const empleado = ref({
  nombre: '',
  apellido1: '',
  apellido2: '',
  dni_nif: '',
  telefono: '',
  correo: '',
  direccion: '',
  fecha_nacimiento: '',
  puesto: '',
  departamento: '',
  fecha_contratacion: '',
  nivel_acceso: 'técnico',
  estado: 'activo',
  password_hash: ''
})

const validar = () => {
  errores.value = {}
  if (!campoObligatorio(empleado.value.nombre)) errores.value.nombre = 'El nombre es obligatorio'
  if (!campoObligatorio(empleado.value.apellido1)) errores.value.apellido1 = 'El primer apellido es obligatorio'
  if (!campoObligatorio(empleado.value.dni_nif)) errores.value.dni_nif = 'El DNI/NIF es obligatorio'
  if (!campoObligatorio(empleado.value.telefono)) errores.value.telefono = 'El teléfono es obligatorio'
  if (!campoObligatorio(empleado.value.correo)) {
    errores.value.correo = 'El correo es obligatorio'
  } else if (!esEmailValido(empleado.value.correo)) {
    errores.value.correo = 'El formato del correo no es válido'
  }
  if (!campoObligatorio(empleado.value.fecha_nacimiento)) errores.value.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
  if (!campoObligatorio(empleado.value.fecha_contratacion)) errores.value.fecha_contratacion = 'La fecha de contratación es obligatoria'
  if (!campoObligatorio(empleado.value.puesto)) errores.value.puesto = 'El puesto es obligatorio'
  if (!campoObligatorio(empleado.value.departamento)) errores.value.departamento = 'El departamento es obligatorio'
  if (!campoObligatorio(empleado.value.direccion)) errores.value.direccion = 'La dirección es obligatoria'
  if (!campoObligatorio(empleado.value.password_hash)) {
    errores.value.password_hash = 'La contraseña es obligatoria'
  } else if (!esPasswordValida(empleado.value.password_hash)) {
    errores.value.password_hash = 'La contraseña debe tener al menos 6 caracteres'
  }
  return Object.keys(errores.value).length === 0
}

const submit = async () => {
  if (!validar()) return

  if (cargando.value) return
  cargando.value = true
  error.value = null

  try {
    if (!empleado.value.nombre || !empleado.value.apellido1) {
      error.value = 'Nombre y primer apellido son obligatorios'
      return
    }
    if (!empleado.value.correo) {
      error.value = 'El correo es obligatorio'
      return
    }
    if (!empleado.value.password_hash) {
      error.value = 'La contraseña es obligatoria'
      return
    }

    const nuevo = await empleadosService.registrar(empleado.value)
    router.push(`/empleados/${nuevo.id}`)

  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear el empleado'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="container" style="max-width: 800px">
    <div class="d-flex align-items-center gap-3 mb-4">
      <RouterLink to="/empleados" class="btn btn-outline-secondary btn-sm">← Volver</RouterLink>
      <h2 class="mb-0">Nuevo empleado</h2>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="card">
      <div class="card-body">
        <div class="row g-3">

          <div class="col-md-4">
            <label class="form-label">Nombre *</label>
            <input v-model="empleado.nombre" type="text"
              :class="['form-control', errores.nombre ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.nombre }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Apellido 1 *</label>
            <input v-model="empleado.apellido1" type="text"
              :class="['form-control', errores.apellido1 ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.apellido1 }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Apellido 2</label>
            <input v-model="empleado.apellido2" type="text" class="form-control" />
          </div>

          <div class="col-md-4">
            <label class="form-label">DNI/NIF *</label>
            <input v-model="empleado.dni_nif" type="text"
              :class="['form-control', errores.dni_nif ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.dni_nif }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Teléfono *</label>
            <input v-model="empleado.telefono" type="text"
              :class="['form-control', errores.telefono ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.telefono }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Correo *</label>
            <input v-model="empleado.correo" type="email"
              :class="['form-control', errores.correo ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.correo }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Fecha de nacimiento *</label>
            <input v-model="empleado.fecha_nacimiento" type="date"
              :class="['form-control', errores.fecha_nacimiento ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.fecha_nacimiento }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Fecha de contratación *</label>
            <input v-model="empleado.fecha_contratacion" type="date"
              :class="['form-control', errores.fecha_contratacion ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.fecha_contratacion }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Puesto *</label>
            <input v-model="empleado.puesto" type="text"
              :class="['form-control', errores.puesto ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.puesto }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Departamento *</label>
            <input v-model="empleado.departamento" type="text"
              :class="['form-control', errores.departamento ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.departamento }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Nivel de acceso</label>
            <select v-model="empleado.nivel_acceso" class="form-select">
              <option value="técnico">Técnico</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">Estado</label>
            <select v-model="empleado.estado" class="form-select">
              <option value="activo">Activo</option>
              <option value="vacaciones">Vacaciones</option>
              <option value="baja">Baja</option>
              <option value="desvinculado">Desvinculado</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Dirección *</label>
            <input v-model="empleado.direccion" type="text"
              :class="['form-control', errores.direccion ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.direccion }}</div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Contraseña *</label>
            <input v-model="empleado.password_hash" type="password"
              :class="['form-control', errores.password_hash ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.password_hash }}</div>
          </div>

        </div>
      </div>
    </div>

    <div class="d-flex justify-content-end gap-3 mt-4">
      <RouterLink to="/empleados" class="btn btn-outline-secondary">Cancelar</RouterLink>
      <button class="btn btn-primary" @click.prevent="submit" :disabled="cargando">
        {{ cargando ? 'Creando...' : 'Crear empleado' }}
      </button>
    </div>
  </div>
</template>