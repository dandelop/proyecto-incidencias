import supabase from '../config/supabase.js'

const clientesDao = {

  async listarTodos() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('fecha_alta', { ascending: true })
    if (error) throw error
    return data
  },

  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async insertar(cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
    if (error) throw error
    return data[0]
  },

  async actualizar(id, cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async darDeBaja(id) {
    const { data, error } = await supabase
      .from('clientes')
      .update({ fecha_baja: new Date().toISOString() })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async eliminar(id) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  async contar() {
    const { count, error } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  }

}

export default clientesDao