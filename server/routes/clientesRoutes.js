import { Router } from 'express'
import clientesController from '../controllers/clientesController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Muestra todos los clientes
router.get('/', nivelAcceso('administrador', 'técnico'), clientesController.listarTodos)

// Muestra el número total de clientes registrados
router.get('/contar', nivelAcceso('administrador'), clientesController.contar)

// Muestra el número total de clientes registrados por tipo
router.get('/contar/tipo', nivelAcceso('administrador'), clientesController.contarPorTipo)

// Muestra los clientes filtrados por tipo
router.get('/activos', nivelAcceso('administrador', 'técnico'), clientesController.listarActivos)

// Muestra los clientes dados de baja
router.get('/bajas', nivelAcceso('administrador'), clientesController.listarBajas)

// Muestra los clientes que tienen incidencias registradas
router.get('/sin-incidencias', nivelAcceso('administrador'), clientesController.listarSinIncidencias)

// Muestra los clientes que tienen incidencias activas
router.get('/con-incidencias', nivelAcceso('administrador', 'técnico'), clientesController.listarConIncidencias)

// Muestra los clientes que tienen incidencias activas
router.get('/con-incidencias-activas', nivelAcceso('administrador', 'técnico'), clientesController.listarConIncidenciasActivas)

// Muestra el cliente con más incidencias registradas
router.get('/mas-incidencias', nivelAcceso('administrador'), clientesController.clienteConMasIncidencias)

// Muestra los clientes filtrados por tipo
router.get('/tipo/:tipo', nivelAcceso('administrador', 'técnico'), clientesController.listarPorTipo)

// Dar de alta un cliente de baja
router.patch('/:id/alta', nivelAcceso('administrador'), clientesController.darDeAlta)

// Estas al final por tema de supabase y el buscar por id
// Muestra los detalles de un cliente específico por su ID
router.get('/:id', nivelAcceso('administrador'), clientesController.buscarPorId)

// Crea un nuevo cliente
router.post('/', nivelAcceso('administrador', 'técnico'), clientesController.insertar)

// Modifica un cliente existente por su ID
router.put('/:id', nivelAcceso('administrador', 'técnico'), clientesController.actualizar)

// Da de baja a un cliente por su ID
router.patch('/:id/baja', nivelAcceso('administrador'), clientesController.darDeBaja)

// Elimina un cliente por su ID
router.delete('/:id', nivelAcceso('administrador'), clientesController.eliminar)

export default router