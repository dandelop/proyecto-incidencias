/*
  Define las rutas de la API para la gestión de equipos (dispositivos de clientes).
  Todas las rutas requieren autenticación (aplicada globalmente en routes/index.js).
  La mayoría de operaciones son accesibles para administrador y técnico,
  reservando solo la eliminación y estadísticas al administrador.
 
  Importante: las rutas específicas van antes que las rutas con parámetros (:id)
  para evitar que Express interprete palabras clave como IDs.
 */

import { Router } from 'express'
import equiposController from '../controllers/equiposController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Rutas accesibles para administrador y técnico
router.get('/', nivelAcceso('administrador', 'técnico'), equiposController.listarTodos)
router.get('/activos', nivelAcceso('administrador', 'técnico'), equiposController.listarConIncidenciasActivas)
router.get('/tipo/:tipo', nivelAcceso('administrador', 'técnico'), equiposController.listarPorTipo)
// Busca un equipo por número de serie (usado al crear incidencias para detectar equipos existentes)
router.get('/serial/:serial', nivelAcceso('administrador', 'técnico'), equiposController.buscarPorSerial)
router.post('/', nivelAcceso('administrador', 'técnico'), equiposController.insertar)
router.put('/:id', nivelAcceso('administrador', 'técnico'), equiposController.actualizar)

// Rutas exclusivas para administrador
router.get('/contar/tipo', nivelAcceso('administrador'), equiposController.contarPorTipo)
router.delete('/:id', nivelAcceso('administrador'), equiposController.eliminar)

// Rutas con parámetro :id (siempre al final para evitar conflictos)
router.get('/:id', nivelAcceso('administrador', 'técnico'), equiposController.buscarPorId)
router.get('/:id/historial', nivelAcceso('administrador', 'técnico'), equiposController.historialIncidencias)

export default router