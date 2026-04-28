/*
  Middleware centralizado de manejo de errores
  Captura cualquier error no gestionado en controllers o DAOs
  y devuelve una respuesta HTTP estructurada y consistente
 
  Debe registrarse siempre al final de todos los middlewares en index.js
  para que Express lo reconozca como manejador de errores (4 parámetros)
 
  En desarrollo incluye la traza completa del error para facilitar la depuración
  En producción solo devuelve el mensaje, evitando exponer detalles internos
 */

const manejadorErrores = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  const status = err.status || 500
  const message = err.message || 'Error interno del servidor'

  res.status(status).json({
    error: message,
    // La traza solo se incluye en desarrollo para no exponer la estructura interna en producción
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export default manejadorErrores