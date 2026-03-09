import supabase from '../config/supabase.js'
const empleadosDao = {

  async obtenerTodos() {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
    if (error) throw error
    return data
  },

  async obtenerPorCorreo(correo) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('correo', correo)
      .single()
    if (error) throw error
    return data
  },

  async registrar(empleado) {
    const { data, error } = await supabase
      .from('empleados')
      .insert([empleado])
      .select()
    if (error) throw error
    return data[0]
  },

  async darDeBaja(id) {
    const { data, error } = await supabase
      .from('empleados')
      .update({ estado: 'baja' })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }
}

export default empleadosDao