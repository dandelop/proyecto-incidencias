import api from './axios.js'

const empleadosService = {
  async listarTodos() {
    const res = await api.get('/empleados')
    return res.data
  },

  async listarActivos() {
    const res = await api.get('/empleados/activos')
    return res.data
  },

  async buscarPorId(id) {
    const res = await api.get(`/empleados/${id}`)
    return res.data
  },

  async registrar(empleado) {
    const res = await api.post('/empleados', empleado)
    return res.data
  },

  async darDeBaja(id) {
    const res = await api.patch(`/empleados/${id}/baja`)
    return res.data
  },

  async cambiarPassword(id, datos) {
    const res = await api.patch(`/empleados/${id}/password`, datos)
    return res.data
  },

  async actualizar(id, empleado) {
    const res = await api.put(`/empleados/${id}`, empleado)
    return res.data
  },

  async incidenciasAsignadas(id) {
    const res = await api.get(`/empleados/${id}/incidencias-asignadas`)
    return res.data
  },
}

export default empleadosService