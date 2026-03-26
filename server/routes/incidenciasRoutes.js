import { Router } from 'express'
import incidenciasController from '../controllers/incidenciasController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Muestra todas las incidencias
router.get('/', nivelAcceso('administrador', 'técnico'), incidenciasController.listarTodas)

// Muestra el número total de incidencias registradas
router.get('/contar', nivelAcceso('administrador', 'técnico'), incidenciasController.contar)

// Muestra las incidencias junto con los nombres del cliente, empleado y equipo relacionados
router.get('/detalles', nivelAcceso('administrador', 'técnico'), incidenciasController.listarConDetalles)

// Muestra solo las incidencias que están actualmente abiertas
router.get('/activas', nivelAcceso('administrador', 'técnico'), incidenciasController.listarActivas)

// Muestra las incidencias filtradas por estado (abierta, en progreso, cerrada)
router.get('/estado/:estado', nivelAcceso('administrador', 'técnico'), incidenciasController.listarPorEstado)

// Muestra las incidencias asignadas a un empleado específico
router.get('/asignado/:id', nivelAcceso('administrador', 'técnico'), incidenciasController.listarPorAsignado)

// Muestra las incidencias reportadas por un cliente específico
router.get('/cliente/:id', nivelAcceso('administrador', 'técnico'), incidenciasController.listarPorCliente)

// Muestra las incidencias relacionadas con un tipo específico de equipo
router.get('/equipo/tipo/:tipo', nivelAcceso('administrador', 'técnico'), incidenciasController.listarPorTipoEquipo)

// Estas al final por tema de supabase y el buscar por id
// Muestra los detalles de una incidencia específica por su ID
router.get('/:id', nivelAcceso('administrador', 'técnico'), incidenciasController.buscarPorId)

// Crea una nueva incidencia
router.post('/', nivelAcceso('administrador', 'técnico'), incidenciasController.insertar)

// Modifica una incidencia existente por su ID
router.put('/:id', nivelAcceso('administrador', 'técnico'), incidenciasController.modificar)

// Elimina una incidencia por su ID
router.delete('/:id', nivelAcceso('administrador'), incidenciasController.eliminar)

export default router