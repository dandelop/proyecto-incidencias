/*
  Capa de acceso a datos para la gestión de equipos (dispositivos de clientes)
  Centraliza todas las consultas a Supabase relacionadas con la tabla 'equipos'
  Los equipos mantienen un historial de incidencias que permite rastrear
  todas las reparaciones realizadas sobre un mismo dispositivo
 */

import supabase from '../config/supabase.js'

const equiposDao = {

  // Devuelve el listado completo de equipos
  async listarTodos() {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
    if (error) throw error
    return data
  },

  // Busca un equipo por su ID
  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Inserta un nuevo equipo en la base de datos
  async insertar(equipo) {
    const { data, error } = await supabase
      .from('equipos')
      .insert([equipo])
      .select()
    if (error) throw error
    return data[0]
  },

  // Actualiza los datos de un equipo existente
  async actualizar(id, equipo) {
    const { data, error } = await supabase
      .from('equipos')
      .update(equipo)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  // Eliminación física del equipo de la base de datos
  async eliminar(id) {
    const { error } = await supabase
      .from('equipos')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  // Consultas avanzadas

  // Filtra equipos por tipo de dispositivo (smartphone, portátil, etc.)
  async listarPorTipo(tipo) {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('tipo', tipo)
    if (error) throw error
    return data
  },

  // Devuelve los equipos que tienen actualmente al menos una incidencia activa
  // La consulta parte de 'incidencias' hacia 'equipos' para aprovechar la FK existente
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

  // Devuelve un equipo junto con todas sus incidencias históricas
  // Las incidencias se ordenan por fecha de creación descendente en JavaScript
  // ya que Supabase no soporta ordenación en relaciones anidadas
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
    if (data.incidencias) {
      data.incidencias.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
    }
    return data
  },

  // Devuelve un objeto con el recuento de equipos agrupado por tipo de dispositivo
  // El agrupamiento se realiza en JavaScript con reduce
  async contarPorTipo() {
    const { data, error } = await supabase
      .from('equipos')
      .select('tipo')
    if (error) throw error
    return data.reduce((acc, equipo) => {
      acc[equipo.tipo] = (acc[equipo.tipo] || 0) + 1
      return acc
    }, {})
  },

  // Busca un equipo por su número de serie
  // Devuelve null si no existe (en lugar de lanzar error) para permitir
  // al flujo de creación de incidencias decidir si crear un equipo nuevo
  async buscarPorSerial(serial) {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('serial', serial)
      .single()
    if (error) return null
    return data
  },
}

export default equiposDao