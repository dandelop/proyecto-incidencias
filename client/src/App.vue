<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const empleados = ref([])
const error = ref(null)

const cargarEmpleados = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/empleados')
    empleados.value = res.data
  } catch (err) {
    error.value = "No se ha podido conectar con al servidor."
    console.error(err)
  }
}

onMounted(() => {
  cargarEmpleados()
})
</script>

<template>
  <main>
    <h1>Gestión de Incidencias - Empleados</h1>

    <div v-if="error" class="alerta">{{ error }}</div>

    <table v-else border="1">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Puesto</th>
          <th>Departamento</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="emp in empleados" :key="emp.id">
          <td>{{ emp.nombre }} {{ emp.apellido1 }}</td>
          <td>{{ emp.puesto }}</td>
          <td>{{ emp.departamento }}</td>
          <td>{{ emp.estado }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<style>
main {
  padding: 20px;
  font-family: Arial, sans-serif;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 10px;
  text-align: left;
}
</style>