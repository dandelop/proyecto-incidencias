/*
  Capa de acceso a datos para la autenticación de empleados
  Separado del empleadosDao para mantener una separación clara
  entre la gestión de empleados y el proceso de login
 */

import supabase from '../config/supabase.js'

const autenticacionDao = {

  // Busca un empleado por su correo electrónico para el proceso de login
  // Devuelve null tanto si no existe como si hay un error de Supabase,
  // evitando distinguir entre ambos casos y así no dar pistas a posibles atacantes
  // (siempre se mostrará "Credenciales incorrectas" en el frontend)
  async buscarPorCorreo(correo) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('correo', correo)
      .single()
    if (error) return null
    return data
  }

}

export default autenticacionDao