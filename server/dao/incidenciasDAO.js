import supabase from '../config/supabase.js'

const incidenciasDao = {

  async contar() {
    const { count, error } = await supabase
      .from('incidencias')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  },

  async listarTodas() {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    if (error) throw error
    return data
  },

  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async insertar(incidencia) {
    const { data, error } = await supabase
      .from('incidencias')
      .insert([incidencia])
      .select()
    if (error) throw error
    return data[0]
  },

  async modificar(id, incidencia) {
    const { data, error } = await supabase
      .from('incidencias')
      .update(incidencia)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async eliminar(id) {
    const { error } = await supabase
      .from('incidencias')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  }

}

export default incidenciasDao