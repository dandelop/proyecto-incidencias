/*
  Capa de acceso a la API REST para la entidad Empleado
  Centraliza todas las peticiones HTTP relacionadas con empleados,
  actuando como intermediario entre los componentes Vue y el backend
*/

import api from './axios.js'

const empleadosService = {

  // Obtiene el listado completo de empleados (solo administradores)
  async listarTodos() {
    const res = await api.get('/empleados')
    return res.data
  },

  // Obtiene solo los empleados con estado 'activo'
  // Usado en los selects de técnico asignado al crear incidencias
  async listarActivos() {
    const res = await api.get('/empleados/activos')
    return res.data
  },

  // Obtiene un empleado concreto por su id
  async buscarPorId(id) {
    const res = await api.get(`/empleados/${id}`)
    return res.data
  },

  // Crea un nuevo empleado - la contraseña se hashea en el backend
  async registrar(empleado) {
    const res = await api.post('/empleados', empleado)
    return res.data
  },

  // Baja lógica - cambia el estado del empleado a 'baja'
  // y desasigna sus incidencias activas en el backend
  async darDeBaja(id) {
    const res = await api.patch(`/empleados/${id}/baja`)
    return res.data
  },

  // Actualiza los datos de un empleado
  // Si el nuevo estado es baja, vacaciones o desvinculado,
  // el backend desasigna automáticamente sus incidencias activas
  async actualizar(id, empleado) {
    const res = await api.put(`/empleados/${id}`, empleado)
    return res.data
  },

  // Cambia la contraseña de un empleado
  // Los técnicos deben proporcionar la contraseña actual,
  // los administradores pueden cambiarla directamente
  async cambiarPassword(id, datos) {
    const res = await api.patch(`/empleados/${id}/password`, datos)
    return res.data
  },

  // Obtiene las incidencias asignadas a un empleado concreto
  async incidenciasAsignadas(id) {
    const res = await api.get(`/empleados/${id}/incidencias-asignadas`)
    return res.data
  },
}

export default empleadosService