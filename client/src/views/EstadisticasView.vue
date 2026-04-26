<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import api from '../services/axios.js'

Chart.register(...registerables)

const cargando = ref(true)
const error = ref(null)

// Referencias a los canvas
const chartEstados = ref(null)
const chartPrioridades = ref(null)
const chartMeses = ref(null)
const chartClientesTipo = ref(null)
const chartEquiposTipo = ref(null)

const cargarYRenderizar = async () => {
  try {
    const [incidencias, clientes, equipos] = await Promise.all([
      api.get('/incidencias').then(r => r.data),
      api.get('/clientes').then(r => r.data),
      api.get('/equipos').then(r => r.data)
    ])

    cargando.value = false
    await nextTick()  // espera a que vue actualice el DOM

    // Incidencias por estado
    const coloresEstado = {
      creada: '#6c757d',
      en_proceso: '#0d6efd',
      esperando_respuesta_cliente: '#ffc107',
      esperando_piezas: '#ffc107',
      reparado: '#198754',
      entregado: '#20c997',
      cancelado: '#dc3545'
    }

    const estados = {}
    incidencias.forEach(i => {
      estados[i.estado] = (estados[i.estado] || 0) + 1
    })
    new Chart(chartEstados.value, {
      type: 'doughnut',
      data: {
        labels: Object.keys(estados),
        datasets: [{
          data: Object.values(estados),
          backgroundColor: Object.keys(estados).map(e => coloresEstado[e] || '#6c757d')
        }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    })

    // Incidencias por prioridad
    const coloresPrioridad = {
      baja: '#198754',
      media: '#ffc107',
      alta: '#dc3545',
      'crítica': '#212529'
    }

    const prioridades = {}
    incidencias.forEach(i => {
      prioridades[i.prioridad] = (prioridades[i.prioridad] || 0) + 1
    })

    const ordenPrioridad = ['baja', 'media', 'alta', 'crítica']
    const prioridadesOrdenadas = ordenPrioridad.filter(p => prioridades[p] !== undefined)

    new Chart(chartPrioridades.value, {
      type: 'bar',
      data: {
        labels: prioridadesOrdenadas,
        datasets: [{
          label: 'Incidencias',
          data: prioridadesOrdenadas.map(p => prioridades[p]),
          backgroundColor: prioridadesOrdenadas.map(p => coloresPrioridad[p])
        }]
      },
      options: { plugins: { legend: { display: false } } }
    })

    // Incidencias por mes
    const mesesMap = {}
    incidencias.forEach(i => {
      const fecha = new Date(i.fecha_creacion)
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      mesesMap[key] = (mesesMap[key] || 0) + 1
    })

    // Ordenamos cronológicamente
    const mesesOrdenados = Object.keys(mesesMap).sort()
    const etiquetas = mesesOrdenados.map(k => {
      const [year, month] = k.split('-')
      return new Date(year, month - 1).toLocaleString('es-ES', { month: 'short', year: 'numeric' })
    })

    new Chart(chartMeses.value, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Incidencias',
          data: mesesOrdenados.map(k => mesesMap[k]),
          borderColor: '#0d6efd',
          tension: 0.3,
          fill: false
        }]
      },
      options: { plugins: { legend: { display: false } } }
    })

    // Clientes por tipo
    const tiposCliente = {}
    clientes.forEach(c => {
      tiposCliente[c.tipo_cliente] = (tiposCliente[c.tipo_cliente] || 0) + 1
    })
    new Chart(chartClientesTipo.value, {
      type: 'doughnut',
      data: {
        labels: Object.keys(tiposCliente),
        datasets: [{
          data: Object.values(tiposCliente),
          backgroundColor: ['#0d6efd', '#ffc107', '#198754']
        }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    })

    // Equipos por tipo
    const tiposEquipo = {}
    equipos.forEach(e => {
      tiposEquipo[e.tipo] = (tiposEquipo[e.tipo] || 0) + 1
    })
    new Chart(chartEquiposTipo.value, {
      type: 'bar',
      data: {
        labels: Object.keys(tiposEquipo),
        datasets: [{
          label: 'Equipos',
          data: Object.values(tiposEquipo),
          backgroundColor: '#0d6efd'
        }]
      },
      options: { plugins: { legend: { display: false } } }
    })

  } catch (err) {
    error.value = 'Error al cargar las estadísticas'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarYRenderizar)
</script>

<template>
  <div>
    <h2 class="mb-4">Estadísticas</h2>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="cargando" class="text-center">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <div class="row g-4">

        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header fw-bold">Incidencias por estado</div>
            <div class="card-body">
              <canvas ref="chartEstados" style="max-height: 300px"></canvas>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header fw-bold">Incidencias por prioridad</div>
            <div class="card-body">
              <canvas ref="chartPrioridades" style="max-height: 300px"></canvas>
            </div>
          </div>
        </div>

        <div class="col-md-12">
          <div class="card shadow-sm">
            <div class="card-header fw-bold">Incidencias por mes</div>
            <div class="card-body">
              <canvas ref="chartMeses" style="max-height: 250px"></canvas>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header fw-bold">Clientes por tipo</div>
            <div class="card-body">
              <canvas ref="chartClientesTipo" style="max-height: 300px"></canvas>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-header fw-bold">Equipos por tipo</div>
            <div class="card-body">
              <canvas ref="chartEquiposTipo" style="max-height: 300px"></canvas>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>