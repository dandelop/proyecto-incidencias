import api from './axios.js'

const equiposService = {
  async listarTodos() {
    const res = await api.get('/equipos')
    return res.data
  },

  async buscarPorId(id) {
    const res = await api.get(`/equipos/${id}`)
    return res.data
  },

  async historialIncidencias(id) {
    const res = await api.get(`/equipos/${id}/historial`)
    return res.data
  },

  async actualizar(id, equipo) {
    const res = await api.put(`/equipos/${id}`, equipo)
    return res.data
  },

  async insertar(equipo) {
    const res = await api.post('/equipos', equipo)
    return res.data
  },

  async eliminar(id) {
    const res = await api.delete(`/equipos/${id}`)
    return res.data
  },

  async buscarPorSerial(serial) {
    const res = await api.get(`/equipos/serial/${serial}`)
    return res.data
  },

}

export default equiposService