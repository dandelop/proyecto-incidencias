<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const empleados = ref([])
const cargando = ref(true)
const error = ref(null)

const obtenerEmpleados = async () => {
  try {
    // Llamada a al servidor de Node
    const respuesta = await axios.get('http://localhost:3000/api/empleados')
    empleados.value = respuesta.data
  } catch (err) {
    error.value = "Error al conectar con el servidor"
    console.error(err)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  obtenerEmpleados()
})
</script>

<template>
  <div class="contenedor">
    <h1>Listado de Empleados</h1>

    <div v-if="cargando">Cargando datos...</div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <ul v-else>
      <li v-for="emp in empleados" :key="emp.id">
        <strong>{{ emp.nombre }} {{ emp.apellido1 }}</strong> - {{ emp.puesto }}
      </li>
    </ul>

    <pre v-if="empleados.length">{{ JSON.stringify(empleados, null, 2) }}</pre>
  </div>
</template>

<style scoped>
.contenedor {
  font-family: sans-serif;
  padding: 20px;
}

.error {
  color: red;
  font-weight: bold;
}

pre {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px;
}
</style>