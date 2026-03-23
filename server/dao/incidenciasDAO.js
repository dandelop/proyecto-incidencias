import supabase from '../config/supabase.js'

const incidenciasDao = {

  // Consultas básicas
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
  },

  // Consultas avanzadas
  async listarConDetalles() {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        clientes (id, nombre, apellido1, apellido2, correo, telefono, tipo_cliente),
        equipos (id, nombre, tipo, marca, modelo, serial, estado)
      `)
      .order('fecha_creacion', { ascending: false })
    if (error) throw error
    return data
  },

  async listarPorEstado(estado) {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        clientes (id, nombre, apellido1, apellido2, correo, telefono),
        equipos (id, nombre, tipo, marca, modelo, serial, estado)
      `)
      .eq('estado', estado)
      .order('fecha_creacion', { ascending: false })
    if (error) throw error
    return data
  },

  async listarPorAsignado(id_tecnico) {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        clientes (id, nombre, apellido1, apellido2, correo, telefono),
        equipos (id, nombre, tipo, marca, modelo, serial, estado)
      `)
      .eq('id_tecnico_asignado', id_tecnico)
      .order('fecha_creacion', { ascending: false })
    if (error) throw error
    return data
  },

  async listarPorCliente(id_cliente) {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        clientes (id, nombre, apellido1, apellido2, correo, telefono),
        equipos (id, nombre, tipo, marca, modelo, serial, estado)
      `)
      .eq('id_cliente', id_cliente)
      .order('fecha_creacion', { ascending: false })
    if (error) throw error
    return data
  },

  async listarPorTipoEquipo(tipo) {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        clientes (id, nombre, apellido1, apellido2, correo, telefono),
        equipos!inner (id, nombre, tipo, marca, modelo, serial, estado)
      `)
      .eq('equipos.tipo', tipo)
      .order('fecha_creacion', { ascending: false })
    if (error) throw error
    return data
  },

  async listarActivas() {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        clientes (id, nombre, apellido1, apellido2, correo, telefono),
        equipos (id, nombre, tipo, marca, modelo, serial, estado)
      `)
      .not('estado', 'in', '("entregado","cancelado")')
      .order('fecha_creacion', { ascending: false })
    if (error) throw error
    return data
  }
}

export default incidenciasDao