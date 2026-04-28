/*
  Función de registro de auditoría del sistema
  Se llama desde los controllers tras cada operación relevante
  (login, creación, modificación, eliminación, cambio de contraseña, etc.)
  para dejar constancia de quién hizo qué y desde dónde
 
  El registro incluye: usuario, acción, detalles, IP y user-agent
  Si el registro falla no interrumpe la operación principal
  Un fallo de auditoría nunca debe impedir que el usuario pueda trabajar
 */

import supabase from '../config/supabase.js'

const registrarLog = async (usuarioId, accion, detalles, req) => {
  try {
    await supabase
      .from('log')
      .insert([{
        usuario_id: usuarioId,                  // ID del empleado que realizó la acción (null en login fallido)
        accion: accion,                         // Tipo de acción (LOGIN_EXITOSO, CLIENTE_CREADO, etc.)
        detalles: detalles,                     // Descripción legible de la acción
        ip: req.ip,                             // IP del cliente para trazabilidad
        user_agent: req.headers['user-agent'],  // Navegador y sistema operativo del cliente
        fecha: new Date().toISOString()
      }])
  } catch (err) {
    // El fallo del log se registra en consola pero no interrumpe la operación principal
    console.error('Error al registrar log:', err.message)
  }
}

export default registrarLog