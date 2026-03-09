import { Router } from 'express'
import clientesController from '../controllers/clientesController.js'

const router = Router()

router.get('/', clientesController.listarTodos)
router.get('/contar', clientesController.contar)
router.get('/:id', clientesController.buscarPorId)
router.post('/', clientesController.insertar)
router.put('/:id', clientesController.actualizar)
router.patch('/:id/baja', clientesController.darDeBaja)
router.delete('/:id', clientesController.eliminar)

export default router