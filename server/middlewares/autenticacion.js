import jwt from 'jsonwebtoken'

// Equivalente a comprobar $_SESSION['usuario_id'] en PHP
const verificarToken = (req, res, next) => {
  // Busca el token en la cookie httpOnly
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ error: 'No hay sesión activa' })
  }

  try {
    // Verifica que el token sea válido y no haya expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.empleado = decoded // disponible en todos los controllers como req.empleado
    next()
  } catch (err) {
    // El token ha expirado o es inválido
    res.clearCookie('token')
    return res.status(401).json({ error: 'Sesión expirada, vuelve a iniciar sesión' })
  }
}

// Equivalente a comprobar $nivel_requerido
const requireNivel = (...nivelesPermitidos) => {
  return (req, res, next) => {
    if (!nivelesPermitidos.includes(req.empleado.nivel_acceso)) {
      return res.status(403).json({ error: 'No tienes permisos suficientes' })
    }
    next()
  }
}

export { verificarToken, requireNivel }