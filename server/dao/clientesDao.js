import supabase from '../config/supabase.js'

const clientesDao = {

  async listarTodos() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('apellido1', { ascending: true })
      .order('nombre', { ascending: true })
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
      .update({
        fecha_baja: new Date().toISOString(),
        activo: false
      })
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
  },

  // Consultas avanzadas

  async listarPorTipo(tipo) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('tipo_cliente', tipo)
    if (error) throw error
    return data
  },

  async listarActivos() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .order('fecha_alta', { ascending: false })
    if (error) throw error
    return data
  },

  async listarBajas() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('activo', false)
      .order('fecha_baja', { ascending: false })
    if (error) throw error
    return data
  },

  async listarConIncidencias() {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        incidencias (id, codigo, titulo, estado, prioridad, fecha_creacion)
      `)
      .order('fecha_alta', { ascending: false })
    if (error) throw error
    return data
  },

  async listarConIncidenciasActivas() {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        incidencias!inner (id, codigo, titulo, estado, prioridad, fecha_creacion)
      `)
      .not('incidencias.estado', 'in', '("entregado","cancelado")')
    if (error) throw error
    return data
  },

  async listarSinIncidencias() {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        incidencias (id)
      `)
      .eq('activo', true)
    if (error) throw error
    return data.filter(cliente => cliente.incidencias.length === 0)
  },

  async contarPorTipo() {
    const { data, error } = await supabase
      .from('clientes')
      .select('tipo_cliente')
    if (error) throw error
    return data.reduce((acc, cliente) => {
      acc[cliente.tipo_cliente] = (acc[cliente.tipo_cliente] || 0) + 1
      return acc
    }, {})
  },

  async clienteConMasIncidencias() {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        id, nombre, apellido1, apellido2, correo, tipo_cliente,
        incidencias (id)
      `)
    if (error) throw error
    return data
      .map(cliente => ({
        ...cliente,
        total_incidencias: cliente.incidencias.length
      }))
      .sort((a, b) => b.total_incidencias - a.total_incidencias)[0]
  },

  async darDeAlta(id) {
    const { data, error } = await supabase
      .from('clientes')
      .update({
        activo: true,
        fecha_baja: null
      })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

}

export default clientesDao
