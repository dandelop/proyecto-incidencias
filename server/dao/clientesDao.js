/*
  Capa de acceso a datos para la gestión de clientes
  Centraliza todas las consultas a Supabase relacionadas con la tabla 'clientes'
  Las consultas avanzadas incluyen joins con la tabla 'incidencias' usando
  las foreign keys definidas en Supabase
 */

import supabase from '../config/supabase.js'

const clientesDao = {

  // Devuelve todos los clientes ordenados alfabéticamente por apellido y nombre
  async listarTodos() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('apellido1', { ascending: true })
      .order('nombre', { ascending: true })
    if (error) throw error
    return data
  },

  // Busca un cliente por su ID
  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Inserta un nuevo cliente en la base de datos
  async insertar(cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
    if (error) throw error
    return data[0]
  },

  // Actualiza los datos de un cliente existente
  async actualizar(id, cliente) {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  // Baja lógica: marca el cliente como inactivo y registra la fecha de baja
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

  // Eliminación física del cliente de la base de datos
  async eliminar(id) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  },

  // Devuelve el total de clientes usando count optimizado (sin traer filas)
  async contar() {
    const { count, error } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count
  },

  // Consultas avanzadas

  // Filtra clientes por tipo (particular, autónomo, empresa)
  async listarPorTipo(tipo) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('tipo_cliente', tipo)
    if (error) throw error
    return data
  },

  // Devuelve solo los clientes activos, ordenados por fecha de alta descendente
  async listarActivos() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .order('fecha_alta', { ascending: false })
    if (error) throw error
    return data
  },

  // Devuelve los clientes dados de baja, ordenados por fecha de baja descendente
  async listarBajas() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('activo', false)
      .order('fecha_baja', { ascending: false })
    if (error) throw error
    return data
  },

  // Devuelve todos los clientes con sus incidencias asociadas
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

  // Devuelve clientes que tienen al menos una incidencia activa
  // Usa !inner para comportarse como un INNER JOIN (excluye clientes sin incidencias activas)
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

  // Devuelve clientes activos sin ninguna incidencia registrada
  // El filtrado se hace en JavaScript ya que Supabase no soporta IS EMPTY directamente
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

  // Devuelve un objeto con el recuento de clientes agrupado por tipo
  // El agrupamiento se realiza en JavaScript con reduce
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

  // Devuelve el cliente con mayor número de incidencias registradas
  // El ordenamiento se realiza en JavaScript tras obtener los datos
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

  // Reactiva un cliente dado de baja: lo marca como activo y limpia su fecha de baja
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