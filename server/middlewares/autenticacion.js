/*
  Middlewares de autenticación y autorización.
  Protegen las rutas verificando el JWT almacenado en la cookie httpOnly
  y comprobando el nivel de acceso del empleado.
 
  Equivalencias con el sistema de sesiones PHP anterior:
  - verificarToken -> comprobación de $_SESSION['usuario_id']
  - nivelAcceso    -> comprobación de $nivel_requerido
 */

import jwt from 'jsonwebtoken'

// Verifica que la petición incluye un JWT válido y no expirado
// Si es válido, adjunta los datos del empleado a req.empleado
// para que estén disponibles en todos los controllers posteriores
const verificarToken = (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ error: 'No hay sesión activa' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.empleado = decoded
    next()
  } catch (err) {
    // Si el token ha expirado o es inválido, limpiamos la cookie y rechazamos la petición
    res.clearCookie('token')
    return res.status(401).json({ error: 'Sesión expirada, vuelve a iniciar sesión' })
  }
}

// Factory que genera un middleware de control de acceso por rol
// Acepta uno o varios niveles permitidos y devuelve 403 si el empleado
// no tiene ninguno de ellos
// Uso: nivelAcceso('administrador') o nivelAcceso('administrador', 'técnico')
const nivelAcceso = (...nivelesPermitidos) => {
  return (req, res, next) => {
    if (!nivelesPermitidos.includes(req.empleado.nivel_acceso)) {
      return res.status(403).json({ error: 'No tienes permisos suficientes' })
    }
    next()
  }
}

export { verificarToken, nivelAcceso }