import incidenciasDao from '../dao/incidenciasDAO.js'

const incidenciasController = {

  // consultas básicas
  async contar(req, res) {
    try {
      const total = await incidenciasDao.contar()
      res.json({ total })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarTodas(req, res) {
    try {
      const incidencias = await incidenciasDao.listarTodas()
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params
      const incidencia = await incidenciasDao.buscarPorId(Number(id))
      if (!incidencia) return res.status(404).json({ error: 'Incidencia no encontrada' })
      res.json(incidencia)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async insertar(req, res) {
    try {
      const incidencia = req.body
      const nueva = await incidenciasDao.insertar(incidencia)
      res.status(201).json(nueva)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async modificar(req, res) {
    try {
      const { id } = req.params
      const incidencia = req.body
      const modificada = await incidenciasDao.modificar(Number(id), incidencia)
      res.json(modificada)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params
      await incidenciasDao.eliminar(Number(id))
      res.json({ mensaje: 'Incidencia eliminada correctamente' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Consultas avanzadas

  async listarConDetalles(req, res) {
    try {
      const incidencias = await incidenciasDao.listarConDetalles()
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorEstado(req, res) {
    try {
      const { estado } = req.params
      const incidencias = await incidenciasDao.listarPorEstado(estado)
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorAsignado(req, res) {
    try {
      const { id } = req.params
      const incidencias = await incidenciasDao.listarPorAsignado(Number(id))
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorCliente(req, res) {
    try {
      const { id } = req.params
      const incidencias = await incidenciasDao.listarPorCliente(Number(id))
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorTipoEquipo(req, res) {
    try {
      const { tipo } = req.params
      const incidencias = await incidenciasDao.listarPorTipoEquipo(tipo)
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarActivas(req, res) {
    try {
      const incidencias = await incidenciasDao.listarActivas()
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

}

export default incidenciasController