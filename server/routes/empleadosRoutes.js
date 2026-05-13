/*
  Define las rutas de la API para la gestión de empleados.
  Todas las rutas requieren autenticación (aplicada globalmente en routes/index.js)
  El nivel de acceso varía según la operación:
  - Gestión completa: solo administrador
  - Perfil propio, cambio de contraseña y actualización: administrador y técnico
    (la lógica de restricción por propiedad del recurso se aplica en el controller)
 
  Importante: las rutas específicas van antes que las rutas con parámetros (:id)
  para evitar que Express interprete palabras clave como IDs
 */

import { Router } from 'express'
import empleadosController from '../controllers/empleadosController.js'
import { nivelAcceso } from '../middlewares/autenticacion.js'

const router = Router()

// Rutas exclusivas para administrador
router.get('/', nivelAcceso('administrador'), empleadosController.obtenerTodos)
router.get('/tecnico-top', nivelAcceso('administrador'), empleadosController.tecnicoConMasIncidencias)
router.get('/contar/departamento', nivelAcceso('administrador'), empleadosController.contarPorDepartamento)
router.get('/contar/estado', nivelAcceso('administrador'), empleadosController.contarPorEstado)
router.get('/departamento/:departamento', nivelAcceso('administrador'), empleadosController.listarPorDepartamento)
router.get('/nivel/:nivel', nivelAcceso('administrador'), empleadosController.listarPorNivel)
router.get('/correo/:correo', nivelAcceso('administrador'), empleadosController.obtenerPorCorreo)
router.get('/:id/incidencias-creadas', nivelAcceso('administrador'), empleadosController.listarConIncidenciasCreadas)
router.get('/:id/incidencias-asignadas', nivelAcceso('administrador'), empleadosController.listarConIncidenciasAsignadas)
router.post('/', nivelAcceso('administrador'), empleadosController.registrar)
router.patch('/:id/baja', nivelAcceso('administrador'), empleadosController.darDeBaja)

// Rutas accesibles para administrador y técnico
router.get('/activos', nivelAcceso('administrador', 'técnico'), empleadosController.listarActivos)
// Un técnico puede ver su propio perfil pero no el de otros (validado en el controller)
router.get('/:id', nivelAcceso('administrador', 'técnico'), empleadosController.buscarPorId)
// Un técnico solo puede cambiar su propia contraseña y debe verificar la actual (validado en el controller)
router.patch('/:id/password', nivelAcceso('administrador', 'técnico'), empleadosController.cambiarPassword)
// Un técnico puede actualizar sus propios datos no restringidos (validado en el controller)
router.put('/:id', nivelAcceso('administrador', 'técnico'), empleadosController.actualizar)

export default router