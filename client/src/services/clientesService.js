/*
  Capa de acceso a la API REST para la entidad Cliente
  Centraliza todas las llamadas HTTP relacionadas con clientes,
  abstrayendo los detalles de la comunicación con el servidor
*/

import api from './axios.js'

const clientesService = {

  // Obtiene el listado completo de clientes ordenado alfabéticamente
  async listarTodos() {
    const res = await api.get('/clientes')
    return res.data
  },

  // Obtiene un cliente concreto por su ID
  async buscarPorId(id) {
    const res = await api.get(`/clientes/${id}`)
    return res.data
  },

  // Obtiene todas las incidencias asociadas a un cliente
  async incidenciasActivas(id) {
    const res = await api.get(`/incidencias/cliente/${id}`)
    return res.data
  },

  // Crea un nuevo cliente
  async insertar(cliente) {
    const res = await api.post('/clientes', cliente)
    return res.data
  },

  // Actualiza los datos de un cliente existente
  async actualizar(id, cliente) {
    const res = await api.put(`/clientes/${id}`, cliente)
    return res.data
  },

  // Baja lógica — marca al cliente como inactivo y registra la fecha de baja
  // Cancela automáticamente sus incidencias activas (gestionado en el backend)
  async darDeBaja(id) {
    const res = await api.patch(`/clientes/${id}/baja`)
    return res.data
  },

  // Reactiva un cliente dado de baja
  async darDeAlta(id) {
    const res = await api.patch(`/clientes/${id}/alta`)
    return res.data
  },

  // Eliminación física — acción irreversible, solo permitida sin incidencias activas
  async eliminar(id) {
    const res = await api.delete(`/clientes/${id}`)
    return res.data
  },
}

export default clientesService