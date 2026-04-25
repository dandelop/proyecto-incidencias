import { Router } from 'express'
import equiposController from '../controllers/equiposController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Muestra todos los equipos
router.get('/', nivelAcceso('administrador', 'técnico'), equiposController.listarTodos)

// Muestra solo los equipos que tienen incidencias activas
router.get('/activos', nivelAcceso('administrador', 'técnico'), equiposController.listarConIncidenciasActivas)

// Muestra el número total de equipos registrados
router.get('/contar/tipo', nivelAcceso('administrador'), equiposController.contarPorTipo)

// Muestra los equipos filtrados por tipo
router.get('/tipo/:tipo', nivelAcceso('administrador', 'técnico'), equiposController.listarPorTipo)

// Busca por id
router.get('/serial/:serial', nivelAcceso('administrador', 'técnico'), equiposController.buscarPorSerial)

// Estas al final por tema de supabase y el buscar por id
// Muestra los detalles de un equipo específico por su ID
router.get('/:id', nivelAcceso('administrador', 'técnico'), equiposController.buscarPorId)

// Muestra el historial de incidencias de un equipo específico por su ID
router.get('/:id/historial', nivelAcceso('administrador', 'técnico'), equiposController.historialIncidencias)

// Crea un nuevo equipo
router.post('/', nivelAcceso('administrador', 'técnico'), equiposController.insertar)

// Modifica un equipo existente por su ID
router.put('/:id', nivelAcceso('administrador', 'técnico'), equiposController.actualizar)

// Elimina un equipo por su ID
router.delete('/:id', nivelAcceso('administrador'), equiposController.eliminar)

export default router