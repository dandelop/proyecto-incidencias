import supabase from '../config/supabase.js'

const autenticacionDao = {
  async buscarPorCorreo(correo) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('correo', correo)
      .single()

    // Para no distinguir el tipo de error de supabase (mostrar siempre "Credenciales Incorrectas")
    if (error) return null
    return data
  }
}

export default autenticacionDao