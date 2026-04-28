/*
  Middlewares de limitación de peticiones (rate limiting)
  Protegen la API contra ataques de fuerza bruta y abuso de endpoints
  Cada IP tiene un límite de peticiones por ventana de tiempo
  Requiere que Express tenga configurado 'trust proxy' para funcionar
  correctamente detrás de un proxy inverso (como Render)
 */

import rateLimit from 'express-rate-limit'

// Limitador general aplicado a todas las rutas de la API
// Permite hasta 300 peticiones por IP en una ventana de 15 minutos
export const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Demasiadas peticiones, espera unos minutos y vuelve a intentarlo.' },
  standardHeaders: true,
  legacyHeaders: false
})

// Limitador estricto aplicado exclusivamente al endpoint de login
// Permite hasta 10 intentos por IP en una ventana de 15 minutos,
// haciendo inviables los ataques de fuerza bruta sobre las credenciales
export const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos fallidos, espera unos minutos y vuelve a intentarlo.' },
  standardHeaders: true,
  legacyHeaders: false
})