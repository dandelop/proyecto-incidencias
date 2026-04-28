/*
  Define las rutas públicas del sistema de autenticación
  Son las únicas rutas que no requieren token previo para acceder
  El resto de rutas de la API están protegidas globalmente en routes/index.js
 
  Rutas:
  POST /api/autenticacion/login   -> Inicia sesión y genera la cookie JWT
  POST /api/autenticacion/logout  -> Cierra sesión y elimina la cookie JWT
  GET  /api/autenticacion/me      -> Devuelve los datos del empleado logueado
 */

import { Router } from 'express'
import autenticacionController from '../controllers/autenticacionController.js'
import { verificarToken } from '../middlewares/autenticacion.js'
import { limiterLogin } from '../middlewares/limiteAcceso.js'

const router = Router()

// El rate limiter estricto solo se aplica al login para frenar ataques de fuerza bruta
router.post('/login', limiterLogin, autenticacionController.login)

// Logout y me requieren token válido (no tiene sentido cerrar sesión sin estar logueado)
router.post('/logout', verificarToken, autenticacionController.logout)
router.get('/me', verificarToken, autenticacionController.me)

export default router