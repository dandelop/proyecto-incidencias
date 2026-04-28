/*
  Controlador para la consulta y mantenimiento del log de auditoría
  Todas las rutas de este controller son exclusivas para administradores
  El log registra automáticamente las acciones relevantes del sistema
  (logins, creaciones, modificaciones, eliminaciones) desde otros controllers
 */

import logDao from '../dao/logDao.js'

const logController = {

  // Devuelve el historial completo de logs ordenado por fecha descendente,
  // incluyendo los datos básicos del empleado que realizó cada acción
  async listarTodos(req, res) {
    try {
      const logs = await logDao.listarTodos()
      res.json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra el log por empleado - útil para auditar las acciones de un usuario concreto
  async listarPorEmpleado(req, res) {
    try {
      const { id } = req.params
      const logs = await logDao.listarPorEmpleado(Number(id))
      res.json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra el log por tipo de acción (LOGIN_EXITOSO, CLIENTE_CREADO, etc.)
  async listarPorAccion(req, res) {
    try {
      const { accion } = req.params
      const logs = await logDao.listarPorAccion(accion)
      res.json(logs)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Elimina los registros de log con más de 90 días de antigüedad.
  // Permite mantener la tabla de auditoría en un tamaño manejable.
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