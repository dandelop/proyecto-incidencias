/*
  Capa de acceso a datos para la gestión de incidencias (reparaciones)
  Centraliza todas las consultas a Supabase relacionadas con la tabla 'incidencias'
  Las consultas avanzadas incluyen joins con clientes, equipos y empleados
  usando aliases explícitos para distinguir entre las dos FKs que apuntan a 'empleados'
  (id_empleado_creador e id_tecnico_asignado)
 */

import supabase from '../config/supabase.js'

const incidenciasDao = {

  // Devuelve el total de incidencias usando count optimizado (sin traer filas)
  async contar() {
    const { count, error } = await supabase
      .from('incidencias')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  },

  // Devuelve todas las incidencias ordenadas por fecha de creación descendente
  async listarTodas() {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .order('fecha_creacion', { ascending: false })
    if (error) throw error
    return data
  },

  // Busca una incidencia por su ID
  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Inserta una nueva incidencia en la base de datos
  async insertar(incidencia) {
    const { data, error } = await supabase
      .from('incidencias')
      .insert([incidencia])
      .select()
    if (error) throw error
    return data[0]
  },

  // Actualiza los campos de una incidencia existente
  async modificar(id, incidencia) {
    const { data, error } = await supabase
      .from('incidencias')
      .update(incidencia)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  // Eliminación física de una incidencia de la base de datos
  async eliminar(id) {
    const { error } = await supabase
      .from('incidencias')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  // Consultas avanzadas

  // Devuelve todas las incidencias con datos completos de cliente, equipo,
  // técnico asignado y empleado creador
  // Usa aliases 'tecnico' y 'creador' para distinguir las dos FKs hacia 'empleados'
  async listarConDetalles() {
    const { data, error } = await supabase
      .from('incidencias')
      .select(`
        *,
        clientes (id, nombre, apellido1, apellido2, correo, telefono, tipo_cliente),
        equipos (id, nombre, tipo, marca, modelo, serial, estado),
        tecnico:empleados!id_tecnico_asignado (id, nombre, apellido1),
        creador:empleados!id_empleado_creador (id, nombre, apellido1)
      `)
      .order('fecha_creacion', { ascending: false })
    if (error) throw error
    return data
  },

  // Filtra incidencias por estado incluyendo datos del cliente y equipo
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

  // Filtra incidencias por el empleado asignado (técnico o administrador)
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

  // Filtra incidencias por cliente incluyendo datos del cliente y equipo
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

  // Filtra incidencias por tipo de equipo
  // Usa !inner para comportarse como INNER JOIN - excluye incidencias
  // cuyo equipo no coincida con el tipo buscado
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

  // Devuelve las incidencias que no están en estado 'entregado' ni 'cancelado',
  // incluyendo datos del cliente y equipo asociados
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