import { Router } from 'express'
import empleadosController from '../controllers/empleadosController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Muestra todos los empleados
router.get('/', nivelAcceso('administrador'), empleadosController.obtenerTodos)

// Muestra los empleados activos
router.get('/activos', nivelAcceso('administrador'), empleadosController.listarActivos)

// Muestra el técnico con más incidencias asignadas
router.get('/tecnico-top', nivelAcceso('administrador'), empleadosController.tecnicoConMasIncidencias)

// Muestra el número total de empleados por departamento
router.get('/contar/departamento', nivelAcceso('administrador'), empleadosController.contarPorDepartamento)

// Muestra el número total de empleados por estado
router.get('/contar/estado', nivelAcceso('administrador'), empleadosController.contarPorEstado)

// Muestra los empleados filtrados por departamento
router.get('/departamento/:departamento', nivelAcceso('administrador'), empleadosController.listarPorDepartamento)

// Muestra los empleados filtrados por nivel de acceso
router.get('/nivel/:nivel', nivelAcceso('administrador'), empleadosController.listarPorNivel)

// Muestra un empleado específico por su correo
router.get('/correo/:correo', nivelAcceso('administrador'), empleadosController.obtenerPorCorreo)


// Estas al final por tema de supabase y el buscar por id
// Muestra las incidencias creadas por un empleado específico
router.get('/:id/incidencias-creadas', nivelAcceso('administrador'), empleadosController.listarConIncidenciasCreadas)

// Muestra las incidencias asignadas a un empleado específico
router.get('/:id/incidencias-asignadas', nivelAcceso('administrador'), empleadosController.listarConIncidenciasAsignadas)

// Registra un nuevo empleado
router.post('/', nivelAcceso('administrador'), empleadosController.registrar)

// Da de baja a un empleado
router.patch('/:id/baja', nivelAcceso('administrador'), empleadosController.darDeBaja)

// Para que un técnico pueda mirar su propio perfil, pero no el de otros
router.get('/:id', nivelAcceso('administrador', 'técnico'), empleadosController.buscarPorId)

// Cambio de contraseña
router.patch('/:id/password', nivelAcceso('administrador', 'técnico'), empleadosController.cambiarPassword)

export default router