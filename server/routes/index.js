import { Router } from 'express'
import empleadosRoutes from './empleadosRoutes.js'
import clientesRoutes from './clientesRoutes.js'
import incidenciasRoutes from './incidenciasRoutes.js'

const router = Router()

router.use('/empleados', empleadosRoutes)
router.use('/clientes', clientesRoutes)
router.use('/incidencias', incidenciasRoutes)

export default router