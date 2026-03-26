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
  },

  // Consultas avanzadas

  async listarActivos() {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('estado', 'activo')
    if (error) throw error
    return data
  },

  async listarPorDepartamento(departamento) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('departamento', departamento)
    if (error) throw error
    return data
  },

  async listarPorNivel(nivel_acceso) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('nivel_acceso', nivel_acceso)
    if (error) throw error
    return data
  },

  async listarConIncidenciasCreadas(id) {
    const { data, error } = await supabase
      .from('empleados')
      .select(`
        id, nombre, apellido1, apellido2, correo, puesto, departamento,
        incidencias_creadas:incidencias!id_empleado_creador (id, codigo, titulo, estado, prioridad, fecha_creacion)
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async listarConIncidenciasAsignadas(id) {
    const { data, error } = await supabase
      .from('empleados')
      .select(`
        id, nombre, apellido1, apellido2, correo, puesto, departamento,
        incidencias_asignadas:incidencias!id_tecnico_asignado (id, codigo, titulo, estado, prioridad, fecha_creacion)
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async tecnicoConMasIncidencias() {
    const { data, error } = await supabase
      .from('empleados')
      .select(`
        id, nombre, apellido1, apellido2, correo, puesto, departamento,
        incidencias_asignadas:incidencias!id_tecnico_asignado (id)
      `)
    if (error) throw error
    return data
      .map(empleado => ({
        ...empleado,
        total_asignadas: empleado.incidencias_asignadas.length
      }))
      .sort((a, b) => b.total_asignadas - a.total_asignadas)[0]
  },

  async contarPorDepartamento() {
    const { data, error } = await supabase
      .from('empleados')
      .select('departamento')
    if (error) throw error
    return data.reduce((acc, empleado) => {
      acc[empleado.departamento] = (acc[empleado.departamento] || 0) + 1
      return acc
    }, {})
  },

  async contarPorEstado() {
    const { data, error } = await supabase
      .from('empleados')
      .select('estado')
    if (error) throw error
    return data.reduce((acc, empleado) => {
      acc[empleado.estado] = (acc[empleado.estado] || 0) + 1
      return acc
    }, {})
  },

  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async cambiarPassword(id, passwordHash) {
    const { data, error } = await supabase
      .from('empleados')
      .update({ password_hash: passwordHash })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }

}

export default empleadosDao