/*
  Capa de acceso a la API REST para la entidad Equipo
  Centraliza todas las peticiones HTTP relacionadas con equipos,
  usando la instancia de axios configurada con la URL base y las cookies
*/

import api from './axios.js'

const equiposService = {

  // Obtiene el listado completo de equipos
  async listarTodos() {
    const res = await api.get('/equipos')
    return res.data
  },

  // Busca un equipo por su id
  async buscarPorId(id) {
    const res = await api.get(`/equipos/${id}`)
    return res.data
  },

  // Busca un equipo por su número de serie
  // Se usa al crear una incidencia para evitar duplicar equipos ya registrados
  async buscarPorSerial(serial) {
    const res = await api.get(`/equipos/serial/${serial}`)
    return res.data
  },

  // Obtiene el historial de incidencias de un equipo concreto
  async historialIncidencias(id) {
    const res = await api.get(`/equipos/${id}/historial`)
    return res.data
  },

  // Registra un nuevo equipo en la base de datos
  async insertar(equipo) {
    const res = await api.post('/equipos', equipo)
    return res.data
  },

  // Actualiza los datos de un equipo existente
  async actualizar(id, equipo) {
    const res = await api.put(`/equipos/${id}`, equipo)
    return res.data
  },

  // Elimina un equipo de forma permanente
  async eliminar(id) {
    const res = await api.delete(`/equipos/${id}`)
    return res.data
  },

}

export default equiposService