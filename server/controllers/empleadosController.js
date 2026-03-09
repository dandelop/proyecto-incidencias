import empleadosDao from '../dao/empleadosDAO.js'

const empleadosController = {

  async obtenerTodos(req, res) {
    try {
      const empleados = await empleadosDao.obtenerTodos()
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async obtenerPorCorreo(req, res) {
    try {
      const { correo } = req.params
      const empleado = await empleadosDao.obtenerPorCorreo(correo)
      if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' })
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async registrar(req, res) {
    try {
      const empleado = req.body
      const nuevo = await empleadosDao.registrar(empleado)
      res.status(201).json(nuevo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async darDeBaja(req, res) {
    try {
      const { id } = req.params
      const empleado = await empleadosDao.darDeBaja(Number(id))
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

}

export default empleadosController