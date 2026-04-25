import api from './axios.js'

const incidenciasService = {
  async listarTodas() {
    const res = await api.get('/incidencias/detalles')
    return res.data
  },

  async buscarPorId(id) {
    const res = await api.get(`/incidencias/${id}`)
    return res.data
  },

  async cambiarEstado(id, estado, tecnico, prioridad) {
    const res = await api.put(`/incidencias/${id}`, {
      estado,
      id_tecnico_asignado: tecnico,
      prioridad
    })
    return res.data
  },

  async insertar(incidencia) {
    const res = await api.post('/incidencias', incidencia)
    return res.data
  },

  async porCliente(id) {
    const res = await api.get(`/incidencias/cliente/${id}`)
    return res.data
  },

}

export default incidenciasService