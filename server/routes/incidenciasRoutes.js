/*
  Define las rutas de la API para la gestión de incidencias (reparaciones)
  Todas las rutas requieren autenticación (aplicada globalmente en routes/index.js)
  La mayoría de operaciones son accesibles para administrador y técnico,
  reservando solo la eliminación al administrador
 
  Importante: las rutas específicas van antes que las rutas con parámetros (:id)
  para evitar que Express interprete palabras clave como IDs
 */

import { Router } from 'express'
import incidenciasController from '../controllers/incidenciasController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Rutas accesibles para administrador y técnico
router.get('/', nivelAcceso('administrador', 'técnico'), incidenciasController.listarTodas)
router.get('/contar', nivelAcceso('administrador', 'técnico'), incidenciasController.contar)
// Devuelve incidencias con datos completos de cliente, equipo y empleados asociados
router.get('/detalles', nivelAcceso('administrador', 'técnico'), incidenciasController.listarConDetalles)
router.get('/activas', nivelAcceso('administrador', 'técnico'), incidenciasController.listarActivas)
router.get('/estado/:estado', nivelAcceso('administrador', 'técnico'), incidenciasController.listarPorEstado)
// Filtra por empleado asignado - usado por técnicos para ver sus propias incidencias
router.get('/asignado/:id', nivelAcceso('administrador', 'técnico'), incidenciasController.listarPorAsignado)
router.get('/cliente/:id', nivelAcceso('administrador', 'técnico'), incidenciasController.listarPorCliente)
router.get('/equipo/tipo/:tipo', nivelAcceso('administrador', 'técnico'), incidenciasController.listarPorTipoEquipo)
router.post('/', nivelAcceso('administrador', 'técnico'), incidenciasController.insertar)
router.put('/:id', nivelAcceso('administrador', 'técnico'), incidenciasController.modificar)

// Rutas exclusivas para administrador
router.delete('/:id', nivelAcceso('administrador'), incidenciasController.eliminar)

// Rutas con parámetro :id - siempre al final para evitar conflictos
router.get('/:id', nivelAcceso('administrador', 'técnico'), incidenciasController.buscarPorId)

export default router