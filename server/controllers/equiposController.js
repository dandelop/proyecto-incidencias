import equiposDao from '../dao/equiposDao.js'

const equiposController = {

  async listarTodos(req, res) {
    try {
      const equipos = await equiposDao.listarTodos()
      res.json(equipos)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params
      console.log('buscarPorId llamado con id:', id)
      if (isNaN(Number(id))) return res.status(400).json({ error: 'Id inválido' })
      const equipo = await equiposDao.buscarPorId(Number(id))
      if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' })
      res.json(equipo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async insertar(req, res) {
    try {
      const equipo = req.body
      const nuevo = await equiposDao.insertar(equipo)
      res.status(201).json(nuevo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params
      const equipo = req.body
      const actualizado = await equiposDao.actualizar(Number(id), equipo)
      res.json(actualizado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params
      await equiposDao.eliminar(Number(id))
      res.json({ mensaje: 'Equipo eliminado correctamente' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorTipo(req, res) {
    try {
      const { tipo } = req.params
      const equipos = await equiposDao.listarPorTipo(tipo)
      res.json(equipos)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarConIncidenciasActivas(req, res) {
    try {
      const equipos = await equiposDao.listarConIncidenciasActivas()
      res.json(equipos)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async historialIncidencias(req, res) {
    try {
      const { id } = req.params
      const equipo = await equiposDao.historialIncidencias(Number(id))
      if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' })
      res.json(equipo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async contarPorTipo(req, res) {
    try {
      const conteo = await equiposDao.contarPorTipo()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

}

export default equiposController