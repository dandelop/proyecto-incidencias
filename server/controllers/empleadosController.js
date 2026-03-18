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
  },

  async listarActivos(req, res) {
    try {
      const empleados = await empleadosDao.listarActivos()
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorDepartamento(req, res) {
    try {
      const { departamento } = req.params
      const empleados = await empleadosDao.listarPorDepartamento(departamento)
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorNivel(req, res) {
    try {
      const { nivel } = req.params
      const empleados = await empleadosDao.listarPorNivel(nivel)
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarConIncidenciasCreadas(req, res) {
    try {
      const { id } = req.params
      const empleado = await empleadosDao.listarConIncidenciasCreadas(Number(id))
      if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' })
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarConIncidenciasAsignadas(req, res) {
    try {
      const { id } = req.params
      const empleado = await empleadosDao.listarConIncidenciasAsignadas(Number(id))
      if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' })
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async tecnicoConMasIncidencias(req, res) {
    try {
      const empleado = await empleadosDao.tecnicoConMasIncidencias()
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async contarPorDepartamento(req, res) {
    try {
      const conteo = await empleadosDao.contarPorDepartamento()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async contarPorEstado(req, res) {
    try {
      const conteo = await empleadosDao.contarPorEstado()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

}

export default empleadosController