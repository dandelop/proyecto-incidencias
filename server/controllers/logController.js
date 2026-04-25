import logDao from '../dao/logDao.js'

const logController = {

  async listarTodos(req, res) {
    try {
      const logs = await logDao.listarTodos()
      res.json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorEmpleado(req, res) {
    try {
      const { id } = req.params
      const logs = await logDao.listarPorEmpleado(Number(id))
      res.json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorAccion(req, res) {
    try {
      const { accion } = req.params
      const logs = await logDao.listarPorAccion(accion)
      res.json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async eliminarAntiguos(req, res) {
    try {
      await logDao.eliminarAntiguos()
      res.json({ mensaje: 'Logs antiguos eliminados correctamente' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

}

export default logController
