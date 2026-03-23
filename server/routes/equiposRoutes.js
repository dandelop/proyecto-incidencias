import { Router } from 'express'
import equiposController from '../controllers/equiposController.js'

const router = Router()

// Muestra todos los equipos
router.get('/', equiposController.listarTodos)
// Muestra solo los equipos que tienen incidencias activas
router.get('/activos', equiposController.listarConIncidenciasActivas)
// Muestra el número total de equipos registrados
router.get('/contar/tipo', equiposController.contarPorTipo)
// Muestra los equipos filtrados por tipo
router.get('/tipo/:tipo', equiposController.listarPorTipo)

// Estas al final por tema de supabase y el buscar por id
// Muestra los detalles de un equipo específico por su ID
router.get('/:id', equiposController.buscarPorId)
// Muestra el historial de incidencias de un equipo específico por su ID
router.get('/:id/historial', equiposController.historialIncidencias)
// Crea un nuevo equipo
router.post('/', equiposController.insertar)
// Modifica un equipo existente por su ID
router.put('/:id', equiposController.actualizar)
// Elimina un equipo por su ID
router.delete('/:id', equiposController.eliminar)

export default router