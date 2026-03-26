import { Router } from 'express'
import autenticacionController from '../controllers/autenticacionController.js'
import { verificarToken } from '../middlewares/autenticacion.js'
import { limiterLogin } from '../middlewares/limiteAcceso.js'

const router = Router()

// El limiterLogin solo se aplica al login, no al resto
router.post('/login', limiterLogin, autenticacionController.login)

router.post('/logout', verificarToken, autenticacionController.logout)

router.get('/me', verificarToken, autenticacionController.me)

export default router