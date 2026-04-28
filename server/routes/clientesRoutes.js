/*
  Define las rutas de la API para la gestión de clientes
  Todas las rutas requieren autenticación (aplicada globalmente en routes/index.js)
  El nivel de acceso requerido varía según la operación:
  - Consultas básicas y creación: administrador y técnico
  - Estadísticas, bajas y eliminaciones: solo administrador
 
  Importante: las rutas específicas van antes que las rutas con parámetros
  para evitar que Express interprete palabras clave como IDs
 */

import { Router } from 'express'
import clientesController from '../controllers/clientesController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Rutas accesibles para administrador y técnico
router.get('/', nivelAcceso('administrador', 'técnico'), clientesController.listarTodos)
router.get('/activos', nivelAcceso('administrador', 'técnico'), clientesController.listarActivos)
router.get('/con-incidencias', nivelAcceso('administrador', 'técnico'), clientesController.listarConIncidencias)
router.get('/con-incidencias-activas', nivelAcceso('administrador', 'técnico'), clientesController.listarConIncidenciasActivas)
router.get('/tipo/:tipo', nivelAcceso('administrador', 'técnico'), clientesController.listarPorTipo)
router.post('/', nivelAcceso('administrador', 'técnico'), clientesController.insertar)
router.put('/:id', nivelAcceso('administrador', 'técnico'), clientesController.actualizar)

// Rutas exclusivas para administrador
router.get('/contar', nivelAcceso('administrador'), clientesController.contar)
router.get('/contar/tipo', nivelAcceso('administrador'), clientesController.contarPorTipo)
router.get('/bajas', nivelAcceso('administrador'), clientesController.listarBajas)
router.get('/sin-incidencias', nivelAcceso('administrador'), clientesController.listarSinIncidencias)
router.get('/mas-incidencias', nivelAcceso('administrador'), clientesController.clienteConMasIncidencias)
router.patch('/:id/alta', nivelAcceso('administrador'), clientesController.darDeAlta)
router.patch('/:id/baja', nivelAcceso('administrador'), clientesController.darDeBaja)
router.delete('/:id', nivelAcceso('administrador'), clientesController.eliminar)

// Rutas con parámetro :id (siempre al final para evitar conflictos)
router.get('/:id', nivelAcceso('administrador'), clientesController.buscarPorId)

export default router