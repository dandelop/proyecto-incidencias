import clientesDao from '../dao/clientesDAO.js'

const clientesController = {

  async listarTodos(req, res) {
    try {
      const clientes = await clientesDao.listarTodos()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params
      const cliente = await clientesDao.buscarPorId(Number(id))
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })
      res.json(cliente)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async insertar(req, res) {
    try {
      const cliente = req.body
      const nuevo = await clientesDao.insertar(cliente)
      res.status(201).json(nuevo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params
      const cliente = req.body
      const actualizado = await clientesDao.actualizar(Number(id), cliente)
      res.json(actualizado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async darDeBaja(req, res) {
    try {
      const { id } = req.params
      const cliente = await clientesDao.darDeBaja(Number(id))
      res.json(cliente)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params
      await clientesDao.eliminar(Number(id))
      res.json({ mensaje: 'Cliente eliminado correctamente' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async contar(req, res) {
    try {
      const total = await clientesDao.contar()
      res.json({ total })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

}

export default clientesController