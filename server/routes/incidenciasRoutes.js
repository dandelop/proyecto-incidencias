import { Router } from 'express'
import incidenciasController from '../controllers/incidenciasController.js'

const router = Router()

router.get('/', incidenciasController.listarTodas)
router.get('/contar', incidenciasController.contar)
router.get('/:id', incidenciasController.buscarPorId)
router.post('/', incidenciasController.insertar)
router.put('/:id', incidenciasController.modificar)
router.delete('/:id', incidenciasController.eliminar)

export default router