import { Router } from 'express'
import clientesController from '../controllers/clientesController.js'

const router = Router()

// Muestra todos los clientes
router.get('/', clientesController.listarTodos)
// Muestra el número total de clientes registrados
router.get('/contar', clientesController.contar)
// Muestra el número total de clientes registrados por tipo
router.get('/contar/tipo', clientesController.contarPorTipo)
// Muestra los clientes filtrados por tipo
router.get('/activos', clientesController.listarActivos)
// Muestra los clientes dados de baja
router.get('/bajas', clientesController.listarBajas)
// Muestra los clientes que tienen incidencias registradas
router.get('/sin-incidencias', clientesController.listarSinIncidencias)
// Muestra los clientes que tienen incidencias activas
router.get('/con-incidencias', clientesController.listarConIncidencias)
// Muestra los clientes que tienen incidencias activas
router.get('/con-incidencias-activas', clientesController.listarConIncidenciasActivas)
// Muestra el cliente con más incidencias registradas
router.get('/mas-incidencias', clientesController.clienteConMasIncidencias)
// Muestra los clientes filtrados por tipo
router.get('/tipo/:tipo', clientesController.listarPorTipo)

// Estas al final por tema de supabase y el buscar por id
// Muestra los detalles de un cliente específico por su ID
router.get('/:id', clientesController.buscarPorId)
// Crea un nuevo cliente
router.post('/', clientesController.insertar)
// Modifica un cliente existente por su ID
router.put('/:id', clientesController.actualizar)
// Da de baja a un cliente por su ID
router.patch('/:id/baja', clientesController.darDeBaja)
// Elimina un cliente por su ID
router.delete('/:id', clientesController.eliminar)

export default router