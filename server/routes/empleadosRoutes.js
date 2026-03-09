import { Router } from 'express'
import empleadosController from '../controllers/empleadosController.js'

const router = Router()

router.get('/', empleadosController.obtenerTodos)
router.get('/:correo', empleadosController.obtenerPorCorreo)
router.post('/', empleadosController.registrar)
router.patch('/:id/baja', empleadosController.darDeBaja)

export default router