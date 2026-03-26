import { Router } from 'express'
import logController from '../controllers/logController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Todo solo para admin
router.get('/', nivelAcceso('administrador'), logController.listarTodos)
router.get('/accion/:accion', nivelAcceso('administrador'), logController.listarPorAccion)
router.get('/empleado/:id', nivelAcceso('administrador'), logController.listarPorEmpleado)
router.delete('/antiguos', nivelAcceso('administrador'), logController.eliminarAntiguos)

export default router