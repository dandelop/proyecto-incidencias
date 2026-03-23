import supabase from '../config/supabase.js'

const equiposDao = {

  async listarTodos() {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
    if (error) throw error
    return data
  },

  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async insertar(equipo) {
    const { data, error } = await supabase
      .from('equipos')
      .insert([equipo])
      .select()
    if (error) throw error
    return data[0]
  },

  async actualizar(id, equipo) {
    const { data, error } = await supabase
      .from('equipos')
      .update(equipo)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async eliminar(id) {
    const { error } = await supabase
      .from('equipos')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  // Consultas avanzadas

  async listarPorTipo(tipo) {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('tipo', tipo)
    if (error) throw error
    return data
  },

  async listarConIncidenciasActivas() {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        id_equipo,
        estado,
        equipos (id, nombre, tipo, marca, modelo, serial, estado)
      `)
      .not('estado', 'in', '("entregado","cancelado")')
    if (error) throw error
    return data
  },

  async historialIncidencias(id) {
    const { data, error } = await supabase
      .from('equipos')
      .select(`
        *,
        incidencias (id, codigo, titulo, estado, prioridad, fecha_creacion, fecha_cierre)
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async contarPorTipo() {
    const { data, error } = await supabase
      .from('equipos')
      .select('tipo')
    if (error) throw error

    return data.reduce((acc, equipo) => {
      acc[equipo.tipo] = (acc[equipo.tipo] || 0) + 1
      return acc
    }, {})
  }

}

export default equiposDao