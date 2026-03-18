import { Router } from 'express'
import empleadosRoutes from './empleadosRoutes.js'
import clientesRoutes from './clientesRoutes.js'
import incidenciasRoutes from './incidenciasRoutes.js'
import equiposRoutes from './equiposRoutes.js'

const router = Router()

router.use('/empleados', empleadosRoutes)
router.use('/clientes', clientesRoutes)
router.use('/incidencias', incidenciasRoutes)
router.use('/equipos', equiposRoutes)

router.use((req, res, next) => {
  console.log('Ruta equipos:', req.method, req.path)
  next()
})

export default router