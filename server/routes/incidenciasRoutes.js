import { Router } from 'express'
import incidenciasController from '../controllers/incidenciasController.js'

const router = Router()

router.get('/', incidenciasController.listarTodas)
// Muestra el número total de incidencias registradas
router.get('/contar', incidenciasController.contar)
// Muestra las incidencias junto con los nombres del cliente, empleado y equipo relacionados
router.get('/detalles', incidenciasController.listarConDetalles)
// Muestra solo las incidencias que están actualmente abiertas
router.get('/activas', incidenciasController.listarActivas)
// Muestra las incidencias filtradas por estado (abierta, en progreso, cerrada)
router.get('/estado/:estado', incidenciasController.listarPorEstado)
// Muestra las incidencias asignadas a un empleado específico
router.get('/asignado/:id', incidenciasController.listarPorAsignado)
// Muestra las incidencias reportadas por un cliente específico
router.get('/cliente/:id', incidenciasController.listarPorCliente)
// Muestra las incidencias relacionadas con un tipo específico de equipo
router.get('/equipo/tipo/:tipo', incidenciasController.listarPorTipoEquipo)

// Estas al final por tema de supabase y el buscar por id
// Muestra los detalles de una incidencia específica por su ID
router.get('/:id', incidenciasController.buscarPorId)
// Crea una nueva incidencia
router.post('/', incidenciasController.insertar)
// Modifica una incidencia existente por su ID
router.put('/:id', incidenciasController.modificar)
// Elimina una incidencia por su ID
router.delete('/:id', incidenciasController.eliminar)

export default router