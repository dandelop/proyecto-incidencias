/*
  Punto de entrada centralizado para todas las rutas de la API
  Agrupa y registra todos los routers bajo el prefijo /api (definido en server/index.js)
 
  Estructura de acceso:
  - /autenticacion → rutas públicas (login, logout, me) - no requieren token
  - Resto de rutas → protegidas globalmente con verificarToken
  El control de acceso por rol se aplica individualmente en cada router
 */

import { Router } from 'express'
import { verificarToken } from '../middlewares/autenticacion.js'
import empleadosRoutes from './empleadosRoutes.js'
import clientesRoutes from './clientesRoutes.js'
import incidenciasRoutes from './incidenciasRoutes.js'
import equiposRoutes from './equiposRoutes.js'
import autenticacionRoutes from './autenticacionRoutes.js'
import logRoutes from './logRoutes.js'

const router = Router()

// Rutas públicas - accesibles sin token (login, logout, me)
router.use('/autenticacion', autenticacionRoutes)

// Middleware global de autenticación - todas las rutas definidas a partir de aquí requieren JWT válido
router.use(verificarToken)

router.use('/empleados', empleadosRoutes)
router.use('/clientes', clientesRoutes)
router.use('/incidencias', incidenciasRoutes)
router.use('/equipos', equiposRoutes)
router.use('/log', logRoutes)

export default router