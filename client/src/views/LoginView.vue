<!--
  Pantalla de inicio de sesión. Es la única vista pública de la aplicación.

  - Valida el formato del correo y que la contraseña no esté vacía antes de enviar
  - Al iniciar sesión correctamente, guarda los datos del empleado en el store global
    y redirige a la vista de incidencias
-->

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/axios.js'
import { authStore } from '../store/auth.js'
import { esEmailValido, campoObligatorio } from '../utils/validaciones.js'

const router = useRouter()
const correo = ref('')
const password = ref('')
const error = ref(null)
const cargando = ref(false)
const errores = ref({})

// Validación del formulario
const validar = () => {
  errores.value = {}
  if (!campoObligatorio(correo.value)) {
    errores.value.correo = 'El correo es obligatorio'
  } else if (!esEmailValido(correo.value)) {
    errores.value.correo = 'El formato del correo no es válido'
  }
  if (!campoObligatorio(password.value)) {
    errores.value.password = 'La contraseña es obligatoria'
  }
  return Object.keys(errores.value).length === 0
}

// Envío del formulario
const login = async () => {
  if (!validar()) return
  try {
    cargando.value = true
    error.value = null
    const res = await api.post('/autenticacion/login', {
      correo: correo.value,
      password: password.value
    })
    // Guarda los datos del empleado en el store global y marca la sesión como activa
    authStore.empleado = res.data.empleado
    authStore.isLoggedIn = true
    router.push('/incidencias')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al conectar con el servidor'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow p-4" style="width: 380px">
      <h4 class="text-center mb-4">Gestión de Incidencias</h4>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <div class="mb-3">
        <label class="form-label">Correo</label>
        <input v-model="correo" type="email" :class="['form-control', errores.correo ? 'is-invalid' : '']"
          placeholder="correo@empresa.com" />
        <div class="invalid-feedback">{{ errores.correo }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Contraseña</label>
        <input v-model="password" type="password" :class="['form-control', errores.password ? 'is-invalid' : '']"
          placeholder="••••••••" @keydown.enter="login" />
        <div class="invalid-feedback">{{ errores.password }}</div>
      </div>

      <button @click="login" class="btn btn-primary w-100" :disabled="cargando">
        {{ cargando ? 'Iniciando sesión...' : 'Iniciar sesión' }}
      </button>
    </div>
  </div>
</template>