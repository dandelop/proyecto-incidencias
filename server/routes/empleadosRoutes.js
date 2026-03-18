import { Router } from 'express'
import empleadosController from '../controllers/empleadosController.js'

const router = Router()

// Muestra todos los empleados
router.get('/', empleadosController.obtenerTodos)
// Muestra los empleados activos
router.get('/activos', empleadosController.listarActivos)
// Muestra el técnico con más incidencias asignadas
router.get('/tecnico-top', empleadosController.tecnicoConMasIncidencias)
// Muestra el número total de empleados por departamento
router.get('/contar/departamento', empleadosController.contarPorDepartamento)
// Muestra el número total de empleados por estado
router.get('/contar/estado', empleadosController.contarPorEstado)
// Muestra los empleados filtrados por departamento
router.get('/departamento/:departamento', empleadosController.listarPorDepartamento)
// Muestra los empleados filtrados por nivel de acceso
router.get('/nivel/:nivel', empleadosController.listarPorNivel)
// Muestra un empleado específico por su correo
router.get('/correo/:correo', empleadosController.obtenerPorCorreo)
// Muestra las incidencias creadas por un empleado específico
router.get('/:id/incidencias-creadas', empleadosController.listarConIncidenciasCreadas)
// Muestra las incidencias asignadas a un empleado específico
router.get('/:id/incidencias-asignadas', empleadosController.listarConIncidenciasAsignadas)
// Registra un nuevo empleado
router.post('/', empleadosController.registrar)
// Da de baja a un empleado
router.patch('/:id/baja', empleadosController.darDeBaja)

export default router