import supabase from '../config/supabase.js'

const registrarLog = async (usuarioId, accion, detalles, req) => {
  try {
    await supabase
      .from('log')
      .insert([{
        usuario_id: usuarioId,
        accion: accion,
        detalles: detalles,
        ip: req.ip,
        user_agent: req.headers['user-agent'],
        fecha: new Date().toISOString()
      }])
  } catch (err) {
    console.error('Error al registrar log:', err.message)
  }
}

export default registrarLog