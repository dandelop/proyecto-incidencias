import { Router } from 'express'
import { verificarToken } from '../middlewares/autenticacion.js'
import empleadosRoutes from './empleadosRoutes.js'
import clientesRoutes from './clientesRoutes.js'
import incidenciasRoutes from './incidenciasRoutes.js'
import equiposRoutes from './equiposRoutes.js'
import autenticacionRoutes from './autenticacionRoutes.js'
import logRoutes from './logRoutes.js'

const router = Router()

// Rutas públicas — no necesitan token
router.use('/autenticacion', autenticacionRoutes)

// A partir de aquí todas las rutas requieren token
router.use(verificarToken)
router.use('/empleados', empleadosRoutes)
router.use('/clientes', clientesRoutes)
router.use('/incidencias', incidenciasRoutes)
router.use('/equipos', equiposRoutes)
router.use('/log', logRoutes)

export default router