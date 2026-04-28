/*
  Define las rutas de la API para la consulta y mantenimiento del log de auditoría
  Todas las rutas son exclusivas para administradores
  El log contiene información sensible sobre las acciones del sistema
  que no debe ser accesible para los técnicos
 */

import { Router } from 'express'
import logController from '../controllers/logController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Devuelve el historial completo de logs con datos del empleado asociado
router.get('/', nivelAcceso('administrador'), logController.listarTodos)
// Filtra el log por tipo de acción (LOGIN_EXITOSO, CLIENTE_CREADO, etc.)
router.get('/accion/:accion', nivelAcceso('administrador'), logController.listarPorAccion)
// Filtra el log por empleado (útil para auditar las acciones de un usuario concreto)
router.get('/empleado/:id', nivelAcceso('administrador'), logController.listarPorEmpleado)
// Elimina los registros con más de 90 días de antigüedad para mantener la tabla manejable
router.delete('/antiguos', nivelAcceso('administrador'), logController.eliminarAntiguos)

export default router