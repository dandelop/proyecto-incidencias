import supabase from '../config/supabase.js'

const logDao = {

  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

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

  async listarPorEmpleado(usuario_id) {
    const { data, error } = await supabase
      .from('log')
      .select('*')
      .eq('usuario_id', usuario_id)
      .order('fecha', { ascending: false })
    if (error) throw error
    return data
  },

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

  async eliminarAntiguos() {
    // Borra logs de más de 90 días, equivale a tu limpiarLogsAntiguos() de PHP
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
