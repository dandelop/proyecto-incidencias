<!--
  Formulario de creación de incidencias. Está dividido en tres secciones:
  1. Cliente: búsqueda de cliente existente o creación de uno nuevo sobre la marcha
  2. Incidencia: datos de la incidencia a registrar
  3. Equipo: datos del dispositivo a reparar, con detección por número de serie

  El formulario gestiona la creación encadenada de hasta tres entidades:
  cliente (opcional) -> equipo (o reutilización de uno ya existente) -> incidencia
-->

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import clientesService from '../services/clientesService.js'
import empleadosService from '../services/empleadosService.js'
import equiposService from '../services/equiposService.js'
import incidenciasService from '../services/incidenciasService.js'
import { authStore } from '../store/auth.js'
import { normalizar } from '../utils/texto.js'
import { campoObligatorio } from '../utils/validaciones.js'

const router = useRouter()
const error = ref(null)
const cargando = ref(false)
const errores = ref({})

// Búsqueda de cliente
const busqueda = ref('')
const clientes = ref([])
const clienteSeleccionado = ref(null)
const mostrarFormCliente = ref(false)
const indiceSeleccionado = ref(-1) // para navegación con teclado en los resultados

// Búsqueda de equipo por serial
const equipoExistente = ref(null)
const buscandoSerial = ref(false)

// Empleados activos para el select de técnico asignado
const empleados = ref([])

// Modelos de los formularios

const nuevoCliente = ref({
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
  acepta_comunicaciones: false,
  activo: true
})

const equipo = ref({
  nombre: '',
  tipo: '',
  marca: '',
  modelo: '',
  serial: '',
  estado: 'usado'
})

const incidencia = ref({
  titulo: '',
  descripcion: '',
  prioridad: 'media',
  id_tecnico_asignado: null,
  presupuesto: null
})

// Lógica de búsqueda de clientes

const clientesFiltrados = ref([])

// Filtra la lista de clientes según el texto introducido.
// Requiere mínimo 2 caracteres para evitar resultados excesivos
const buscarCliente = () => {
  if (busqueda.value.length < 2) {
    clientesFiltrados.value = []
    return
  }
  const term = normalizar(busqueda.value)
  clientesFiltrados.value = clientes.value.filter(c =>
    normalizar(c.nombre).includes(term) ||
    normalizar(c.apellido1).includes(term) ||
    normalizar(c.correo).includes(term) ||
    normalizar(c.dni_nif_cif).includes(term)
  )
}

const seleccionarCliente = (cliente) => {
  clienteSeleccionado.value = cliente
  busqueda.value = `${cliente.nombre} ${cliente.apellido1}`
  clientesFiltrados.value = []
  mostrarFormCliente.value = false
}

// Genera un código provisional para la incidencia
// El código definitivo (INC-AÑO-ID) lo asigna el backend tras la inserción
const generarCodigo = () => {
  const año = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `INC-${año}-${num}`
}

// Búsqueda de equipo por serial

// Si el serial introducido coincide con un equipo existente, se reutiliza
// en vez de crear uno nuevo. Se dispara al salir del campo o al pulsar la lupa.
const buscarPorSerial = async () => {
  if (!equipo.value.serial) return
  try {
    buscandoSerial.value = true
    equipoExistente.value = await equiposService.buscarPorSerial(equipo.value.serial)
  } catch {
    // 404 significa que no existe - se creará uno nuevo al enviar el formulario
    equipoExistente.value = null
  } finally {
    buscandoSerial.value = false
  }
}

// Validación del formulario

const validar = () => {
  errores.value = {}

  // Cliente obligatorio: seleccionado o creando uno nuevo
  if (!clienteSeleccionado.value && !mostrarFormCliente.value) {
    errores.value.cliente = 'Selecciona o crea un cliente'
  }
  if (mostrarFormCliente.value) {
    if (!campoObligatorio(nuevoCliente.value.nombre)) errores.value.clienteNombre = 'El nombre es obligatorio'
    if (!campoObligatorio(nuevoCliente.value.apellido1)) errores.value.clienteApellido1 = 'El primer apellido es obligatorio'
    if (!campoObligatorio(nuevoCliente.value.dni_nif_cif)) errores.value.clienteDni = 'El DNI/NIF/CIF es obligatorio'
  }

  // Título de la incidencia obligatorio
  if (!campoObligatorio(incidencia.value.titulo)) errores.value.titulo = 'El título es obligatorio'

  // Si no hay equipo existente por serial, los campos básicos del equipo son obligatorios
  if (!equipoExistente.value) {
    if (!campoObligatorio(equipo.value.nombre)) errores.value.equipoNombre = 'El nombre del equipo es obligatorio'
    if (!campoObligatorio(equipo.value.tipo)) errores.value.equipoTipo = 'El tipo del equipo es obligatorio'
  }

  return Object.keys(errores.value).length === 0
}

// Envío del formulario

const submit = async () => {
  if (!validar()) return
  if (cargando.value) return
  cargando.value = true
  error.value = null

  try {
    // Si hay serial pero aún no se ha buscado, buscar antes de continuar
    if (equipo.value.serial && !equipoExistente.value) {
      await buscarPorSerial()
    }

    // 1. Crear cliente nuevo si el formulario inline está activo
    let idCliente = clienteSeleccionado.value?.id
    if (mostrarFormCliente.value) {
      const clienteCreado = await clientesService.insertar(nuevoCliente.value)
      idCliente = clienteCreado.id
    }

    if (!idCliente) {
      error.value = 'Selecciona o crea un cliente'
      return
    }

    // 2. Reutilizar equipo existente o crear uno nuevo
    // Se usa spread para evitar pasar el Proxy reactivo de Vue directamente a axios
    let idEquipo = equipoExistente.value?.id
    if (!idEquipo) {
      const equipoCreado = await equiposService.insertar({ ...equipo.value })
      idEquipo = equipoCreado.id
    }

    // 3. Crear la incidencia vinculando cliente, equipo y empleado creador
    await incidenciasService.insertar({
      ...incidencia.value,
      codigo: generarCodigo(),
      id_cliente: idCliente,
      id_equipo: idEquipo,
      id_empleado_creador: authStore.empleado.id,
      estado: 'creada',
      fecha_creacion: new Date().toISOString()
    })

    router.push('/incidencias')

  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear la incidencia'
  } finally {
    cargando.value = false
  }
}

// Carga inicial de clientes y empleados activos
onMounted(async () => {
  clientes.value = await clientesService.listarTodos()
  empleados.value = await empleadosService.listarActivos()
})
</script>

<template>
  <div class="container" style="max-width: 800px">
    <div class="d-flex align-items-center gap-3 mb-4">
      <RouterLink to="/incidencias" class="btn btn-outline-secondary btn-sm">← Volver</RouterLink>
      <h2 class="mb-0">Nueva incidencia</h2>
    </div>

    <!-- 1: CLIENTE -->
    <div class="card mb-4">
      <div class="card-header fw-bold">1. Cliente</div>
      <div class="card-body">
        <div class="mb-3 position-relative">
          <label class="form-label">Buscar cliente existente</label>

          <!-- Buscador con navegación por teclado -->
          <input v-model="busqueda" @input="() => { buscarCliente(); indiceSeleccionado = -1 }"
            @keydown.down.prevent="indiceSeleccionado = Math.min(indiceSeleccionado + 1, clientesFiltrados.length - 1)"
            @keydown.up.prevent="indiceSeleccionado = Math.max(indiceSeleccionado - 1, -1)"
            @keydown.enter.prevent="indiceSeleccionado >= 0 && seleccionarCliente(clientesFiltrados[indiceSeleccionado])"
            type="text" class="form-control" placeholder="Nombre, apellido, correo o DNI..."
            :disabled="mostrarFormCliente" />

          <!-- Resultados del buscador -->
          <ul v-if="clientesFiltrados.length" class="list-group position-absolute w-100 z-3 shadow">
            <li v-for="(c, index) in clientesFiltrados" :key="c.id"
              :class="['list-group-item list-group-item-action', { active: index === indiceSeleccionado }]"
              @click="seleccionarCliente(c)" style="cursor: pointer">
              {{ c.nombre }} {{ c.apellido1 }} — {{ c.correo }}
            </li>
          </ul>
        </div>

        <!-- Cliente seleccionado -->
        <div v-if="clienteSeleccionado && !mostrarFormCliente" class="alert alert-success py-2">
          ✅ {{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido1 }} — {{ clienteSeleccionado.correo }}
          <button class="btn btn-sm btn-link" @click="clienteSeleccionado = null; busqueda = ''">Cambiar</button>
        </div>

        <div v-if="errores.cliente" class="alert alert-danger py-2">{{ errores.cliente }}</div>

        <button v-if="!mostrarFormCliente && !clienteSeleccionado" class="btn btn-outline-primary btn-sm"
          @click="mostrarFormCliente = true">
          + Crear nuevo cliente
        </button>

        <!-- Formulario de creación de nuevo cliente -->
        <div v-if="mostrarFormCliente">
          <hr>
          <h6>Datos del nuevo cliente</h6>
          <div class="row g-3">

            <div class="col-md-4">
              <label class="form-label">Nombre *</label>
              <input v-model="nuevoCliente.nombre" type="text"
                :class="['form-control', errores.clienteNombre ? 'is-invalid' : '']" />
              <div class="invalid-feedback">{{ errores.clienteNombre }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Apellido 1 *</label>
              <input v-model="nuevoCliente.apellido1" type="text"
                :class="['form-control', errores.clienteApellido1 ? 'is-invalid' : '']" />
              <div class="invalid-feedback">{{ errores.clienteApellido1 }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Apellido 2</label>
              <input v-model="nuevoCliente.apellido2" type="text" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label">DNI/NIF/CIF *</label>
              <input v-model="nuevoCliente.dni_nif_cif" type="text"
                :class="['form-control', errores.clienteDni ? 'is-invalid' : '']" />
              <div class="invalid-feedback">{{ errores.clienteDni }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Teléfono</label>
              <input v-model="nuevoCliente.telefono" type="text" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label">Correo</label>
              <input v-model="nuevoCliente.correo" type="email" class="form-control" />
            </div>

            <div class="col-md-6">
              <label class="form-label">Dirección</label>
              <input v-model="nuevoCliente.direccion" type="text" class="form-control" />
            </div>

            <div class="col-md-3">
              <label class="form-label">Ciudad</label>
              <input v-model="nuevoCliente.ciudad" type="text" class="form-control" />
            </div>

            <div class="col-md-3">
              <label class="form-label">Código postal</label>
              <input v-model="nuevoCliente.codigo_postal" type="text" class="form-control" />
            </div>

            <div class="col-md-4">
              <label class="form-label">Tipo cliente</label>
              <select v-model="nuevoCliente.tipo_cliente" class="form-select">
                <option value="particular">Particular</option>
                <option value="autónomo">Autónomo</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>

            <div class="col-md-4 d-flex align-items-end">
              <div class="form-check">
                <input v-model="nuevoCliente.acepta_comunicaciones" type="checkbox" class="form-check-input"
                  id="comunicaciones" />
                <label class="form-check-label" for="comunicaciones">Acepta comunicaciones</label>
              </div>
            </div>

          </div>
          <button class="btn btn-sm btn-outline-secondary mt-3" @click="mostrarFormCliente = false">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- 2: INCIDENCIA -->
    <div class="card mb-4">
      <div class="card-header fw-bold">2. Incidencia</div>
      <div class="card-body">
        <div class="row g-3">

          <div class="col-12">
            <label class="form-label">Título *</label>
            <input v-model="incidencia.titulo" type="text"
              :class="['form-control', errores.titulo ? 'is-invalid' : '']" />
            <div class="invalid-feedback">{{ errores.titulo }}</div>
          </div>

          <div class="col-12">
            <label class="form-label">Descripción</label>
            <textarea v-model="incidencia.descripcion" class="form-control" rows="3"></textarea>
          </div>

          <div class="col-md-4">
            <label class="form-label">Prioridad</label>
            <select v-model="incidencia.prioridad" class="form-select">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="crítica">Crítica</option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">Técnico asignado</label>
            <select v-model="incidencia.id_tecnico_asignado" class="form-select">
              <option :value="null">Sin asignar</option>
              <option v-for="emp in empleados" :key="emp.id" :value="emp.id">
                {{ emp.nombre }} {{ emp.apellido1 }}
              </option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label">Presupuesto (€)</label>
            <input v-model="incidencia.presupuesto" type="number" class="form-control" />
          </div>

        </div>
      </div>
    </div>

    <!-- 3: EQUIPO -->
    <div class="card mb-4">
      <div class="card-header fw-bold">3. Equipo</div>
      <div class="card-body">
        <div class="row g-3">

          <div class="col-md-6">
            <label class="form-label">Nombre *</label>
            <input v-model="equipo.nombre" type="text"
              :class="['form-control', errores.equipoNombre ? 'is-invalid' : '']"
              placeholder="Ej: iPhone 15 rojo de Juan" />
            <div class="invalid-feedback">{{ errores.equipoNombre }}</div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Tipo *</label>
            <select v-model="equipo.tipo" :class="['form-select', errores.equipoTipo ? 'is-invalid' : '']">
              <option value="">Selecciona tipo</option>
              <option value="smartphone">Smartphone</option>
              <option value="portátil">Portátil</option>
              <option value="sobremesa">Sobremesa</option>
              <option value="tablet">Tablet</option>
              <option value="consola">Consola</option>
              <option value="periférico">Periférico</option>
              <option value="otro">Otro</option>
            </select>
            <div class="invalid-feedback">{{ errores.equipoTipo }}</div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Marca</label>
            <input v-model="equipo.marca" type="text" class="form-control" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Modelo</label>
            <input v-model="equipo.modelo" type="text" class="form-control" />
          </div>

          <!-- Número de serie con detección automática de equipo existente -->
          <div class="col-md-4">
            <label class="form-label">Número de serie</label>
            <div class="input-group">
              <input v-model="equipo.serial" type="text" class="form-control" @blur="buscarPorSerial" />
              <button class="btn btn-outline-secondary" type="button" @click="buscarPorSerial"
                :disabled="buscandoSerial">
                {{ buscandoSerial ? '...' : '🔍' }}
              </button>
            </div>
            <!-- Aviso de equipo encontrado - se utilizará ese para la incidencia -->
            <div v-if="equipoExistente" class="alert alert-info mt-2 py-2 small">
              ✅ Equipo encontrado: <strong>{{ equipoExistente.nombre }}</strong> — se usará este equipo
            </div>
          </div>

          <!-- Estado de entrada: refleja la condición física del equipo al recibirlo
               Sirve como registro legal ante posibles reclamaciones del cliente -->
          <div class="col-md-6">
            <label class="form-label">Estado de entrada *</label>
            <select v-model="equipo.estado" class="form-select">
              <option value="como_nuevo">Como nuevo</option>
              <option value="usado">Usado</option>
              <option value="rayado">Rayado</option>
              <option value="roto">Roto</option>
              <option value="daño_agua">Daño por agua</option>
              <option value="no_funciona">No funciona</option>
            </select>
          </div>

        </div>
      </div>
    </div>

    <!-- Botones de acción y mensaje de error global -->
    <div class="d-flex justify-content-end gap-3">
      <RouterLink to="/incidencias" class="btn btn-outline-secondary">Cancelar</RouterLink>
      <button class="btn btn-primary" @click.prevent="submit" :disabled="cargando">
        {{ cargando ? 'Creando...' : 'Crear incidencia' }}
      </button>
    </div>
    <div v-if="error" class="mt-3 alert alert-danger">{{ error }}</div>

  </div>
</template>