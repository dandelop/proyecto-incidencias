const manejadorErrores = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)
  const status = err.status || 500
  const message = err.message || 'Error interno del servidor'
  res.status(status).json({
    error: message,
    // Solo muestra la traza en desarrollo
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export default manejadorErrores