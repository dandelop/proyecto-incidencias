/*
  Capa de acceso a la API REST para la entidad Incidencias
  Centraliza todas las llamadas HTTP relacionadas con incidencias,
  actuando como intermediario entre las vistas y el backend
*/

import api from './axios.js'

const incidenciasService = {

  // Obtiene todas las incidencias con datos cruzados de cliente, equipo,
  // técnico asignado y empleado creador
  async listarTodas() {
    const res = await api.get('/incidencias/detalles')
    return res.data
  },

  // Obtiene una incidencia concreta por su ID
  async buscarPorId(id) {
    const res = await api.get(`/incidencias/${id}`)
    return res.data
  },

  // Actualiza el estado, técnico asignado y prioridad de una incidencia
  // El backend gestiona automáticamente las fechas de inicio y cierre
  // según el estado introducido
  async cambiarEstado(id, estado, tecnico, prioridad) {
    const res = await api.put(`/incidencias/${id}`, {
      estado,
      id_tecnico_asignado: tecnico,
      prioridad
    })
    return res.data
  },

  // Crea una nueva incidencia. El backend genera el código automáticamente
  // con el formato INC-{año}-{id}
  async insertar(incidencia) {
    const res = await api.post('/incidencias', incidencia)
    return res.data
  },

  // Obtiene todas las incidencias asociadas a un cliente concreto
  async porCliente(id) {
    const res = await api.get(`/incidencias/cliente/${id}`)
    return res.data
  },

}

export default incidenciasService