/*
  Controlador para la gestión de equipos (dispositivos de clientes)
  Los equipos se crean siempre asociados a una incidencia y mantienen
  un historial de todas las reparaciones realizadas sobre ellos.
 */

import equiposDao from '../dao/equiposDao.js'

const equiposController = {

  // Devuelve el listado completo de equipos
  async listarTodos(req, res) {
    try {
      const equipos = await equiposDao.listarTodos()
      res.json(equipos)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Busca un equipo por su ID. Valida que el ID sea numérico antes de consultar
  async buscarPorId(req, res) {
    try {
      const { id } = req.params
      if (isNaN(Number(id))) return res.status(400).json({ error: 'Id inválido' })
      const equipo = await equiposDao.buscarPorId(Number(id))
      if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' })
      res.json(equipo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Registra un nuevo equipo. Se llama desde el flujo de creación de incidencias
  async insertar(req, res) {
    try {
      const equipo = req.body
      const nuevo = await equiposDao.insertar(equipo)
      res.status(201).json(nuevo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Actualiza los datos de un equipo existente
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

  // Elimina un equipo de forma permanente
  async eliminar(req, res) {
    try {
      const { id } = req.params
      await equiposDao.eliminar(Number(id))
      res.json({ mensaje: 'Equipo eliminado correctamente' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra equipos por tipo de dispositivo (smartphone, portátil, etc.)
  async listarPorTipo(req, res) {
    try {
      const { tipo } = req.params
      const equipos = await equiposDao.listarPorTipo(tipo)
      res.json(equipos)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve los equipos que tienen actualmente al menos una incidencia activa
  async listarConIncidenciasActivas(req, res) {
    try {
      const equipos = await equiposDao.listarConIncidenciasActivas()
      res.json(equipos)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve un equipo junto con todas sus incidencias históricas ordenadas por fecha
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

  // Devuelve un objeto con el recuento de equipos agrupado por tipo de dispositivo
  async contarPorTipo(req, res) {
    try {
      const conteo = await equiposDao.contarPorTipo()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Busca un equipo por su número de serie
  // Se usa al crear una incidencia para detectar si el equipo ya está registrado
  // y evitar duplicados en la base de datos
  async buscarPorSerial(req, res) {
    try {
      const { serial } = req.params
      const equipo = await equiposDao.buscarPorSerial(serial)
      if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' })
      res.json(equipo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

}

export default equiposController