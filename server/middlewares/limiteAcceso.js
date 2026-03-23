import rateLimit from 'express-rate-limit'

// Limitador general
export const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP
  message: { error: 'Demasiadas peticiones, espera unos minutos y vuelve a intentarlo.' },
  standardHeaders: true,
  legacyHeaders: false
})

// para el login
export const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos de login por IP
  message: { error: 'Demasiados intentos fallidos, espera unos minutos y vuelve a intentarlo.' },
  standardHeaders: true,
  legacyHeaders: false
})