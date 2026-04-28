/*
  Capa de acceso a datos para el log de auditoría del sistema
  Centraliza todas las consultas a Supabase relacionadas con la tabla 'log'.
  Los registros se crean automáticamente desde registroSeguridad.js
  y solo se consultan o eliminan desde aquí
 */

import supabase from '../config/supabase.js'

const logDao = {

  // Devuelve el historial completo de logs ordenado por fecha descendente,
  // incluyendo los datos básicos del empleado que realizó cada acción
  async listarTodos() {
    const { data, error } = await supabase
      .from('log')
      .select(`
        *,
        empleados (id, nombre, apellido1, correo)
      `)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  // Filtra el log por empleado (útil para auditar las acciones de un usuario concreto)
  async listarPorEmpleado(usuario_id) {
    const { data, error } = await supabase
      .from('log')
      .select('*')
      .eq('usuario_id', usuario_id)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  // Filtra el log por tipo de acción (LOGIN_EXITOSO, CLIENTE_CREADO, etc.)
  // incluyendo los datos del empleado que realizó la acción
  async listarPorAccion(accion) {
    const { data, error } = await supabase
      .from('log')
      .select(`
        *,
        empleados (id, nombre, apellido1, correo)
      `)
      .eq('accion', accion)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

  // Elimina los registros de log con más de 90 días de antigüedad
  // Permite mantener la tabla en un tamaño manejable sin perder historial reciente
  async eliminarAntiguos() {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() - 90)
    const { error } = await supabase
      .from('log')
      .delete()
      .lt('fecha', fechaLimite.toISOString())
    if (error) throw error
    return true
  }

}

export default logDao