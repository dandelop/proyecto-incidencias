<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import clientesService from '../services/clientesService.js'
import { esEmailValido, esDniValido, campoObligatorio } from '../utils/validaciones.js'

const router = useRouter()
const error = ref(null)
const cargando = ref(false)
const errores = ref({})

const cliente = ref({
  nombre: '',
  apellido1: '',
  apellido2: '',
  dni_nif_cif: '',
  telefono: '',
  correo: '',
  direccion: '',
  ciudad: '',
  codigo_postal: '',
  tipo_cliente: 'particular',
  observaciones: '',
  acepta_comunicaciones: false,
  activo: true
})

const validar = () => {
  errores.value = {}
  if (!campoObligatorio(cliente.value.nombre)) errores.value.nombre = 'El nombre es obligatorio'
  if (!campoObligatorio(cliente.value.apellido1)) errores.value.apellido1 = 'El primer apellido es obligatorio'
  if (!campoObligatorio(cliente.value.dni_nif_cif)) {
    errores.value.dni_nif_cif = 'El DNI/NIF/CIF es obligatorio'
  } else if (!esDniValido(cliente.value.dni_nif_cif)) {
    errores.value.dni_nif_cif = 'El formato del DNI/NIF/CIF no es válido'
  }
  if (cliente.value.correo && !esEmailValido(cliente.value.correo)) {
    errores.value.correo = 'El formato del correo no es válido'
  }
  return Object.keys(errores.value).length === 0
}

const submit = async () => {
  if (!validar()) return

  if (cargando.value) return
  cargando.value = true
  error.value = null

  try {
    if (!cliente.value.nombre || !cliente.value.apellido1) {
      error.value = 'Nombre y primer apellido son obligatorios'
      return
    }

    const nuevo = await clientesService.insertar(cliente.value)
    router.push(`/clientes/${nuevo.id}`)

  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear el cliente'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="container" style="max-width: 800px">
    <div class="d-flex align-items-center gap-3 mb-4">
      <RouterLink to="/clientes" class="btn btn-outline-secondary btn-sm">← Volver</RouterLink>
      <h2 class="mb-0">Nuevo cliente</h2>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div class="card">
      <div class="card-body">
        <div class="row g-3">

          <div class="col-md-4">
            <label class="form-label">Nombre *</label>
            <input v-model="cliente.nombre" type="text" :class="['form-control', errores.nombre ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.nombre }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Apellido 1 *</label>
            <input v-model="cliente.apellido1" type="text"
              :class="['form-control', errores.apellido1 ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.apellido1 }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Apellido 2</label>
            <input v-model="cliente.apellido2" type="text" class="form-control" />
          </div>

          <div class="col-md-4">
            <label class="form-label">DNI/NIF/CIF *</label>
            <input v-model="cliente.dni_nif_cif" type="text"
              :class="['form-control', errores.dni_nif_cif ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.dni_nif_cif }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Teléfono</label>
            <input v-model="cliente.telefono" type="text" class="form-control" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Correo</label>
            <input v-model="cliente.correo" type="email"
              :class="['form-control', errores.correo ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.correo }}</div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Dirección</label>
            <input v-model="cliente.direccion" type="text" class="form-control" />
          </div>

          <div class="col-md-3">
            <label class="form-label">Ciudad</label>
            <input v-model="cliente.ciudad" type="text" class="form-control" />
          </div>

          <div class="col-md-3">
            <label class="form-label">Código postal</label>
            <input v-model="cliente.codigo_postal" type="text" class="form-control" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Tipo cliente</label>
            <select v-model="cliente.tipo_cliente" class="form-select">
              <option value="particular">Particular</option>
              <option value="autónomo">Autónomo</option>
              <option value="empresa">Empresa</option>
            </select>
          </div>

          <div class="col-12">
            <label class="form-label">Observaciones</label>
            <textarea v-model="cliente.observaciones" class="form-control" rows="3"></textarea>
          </div>

          <div class="col-12">
            <div class="form-check">
              <input v-model="cliente.acepta_comunicaciones" type="checkbox" class="form-check-input"
                id="comunicaciones" />
              <label class="form-check-label" for="comunicaciones">Acepta recibir comunicaciones</label>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="d-flex justify-content-end gap-3 mt-4">
      <RouterLink to="/clientes" class="btn btn-outline-secondary">Cancelar</RouterLink>
      <button class="btn btn-primary" @click.prevent="submit" :disabled="cargando">
        {{ cargando ? 'Creando...' : 'Crear cliente' }}
      </button>
    </div>
  </div>
</template>