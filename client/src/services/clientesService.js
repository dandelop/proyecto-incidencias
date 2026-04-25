import api from './axios.js'

const clientesService = {
  async listarTodos() {
    const res = await api.get('/clientes')
    return res.data
  },

  async buscarPorId(id) {
    const res = await api.get(`/clientes/${id}`)
    return res.data
  },

  async insertar(cliente) {
    const res = await api.post('/clientes', cliente)
    return res.data
  },

  async actualizar(id, cliente) {
    const res = await api.put(`/clientes/${id}`, cliente)
    return res.data
  },

  async darDeBaja(id) {
    const res = await api.patch(`/clientes/${id}/baja`)
    return res.data
  },

  async eliminar(id) {
    const res = await api.delete(`/clientes/${id}`)
    return res.data
  },

  async incidenciasActivas(id) {
    const res = await api.get(`/incidencias/cliente/${id}`)
    return res.data
  },

  async darDeAlta(id) {
    const res = await api.patch(`/clientes/${id}/alta`)
    return res.data
  },
}

export default clientesService