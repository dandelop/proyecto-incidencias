/*
  Capa de acceso a datos para la gestión de empleados
  Centraliza todas las consultas a Supabase relacionadas con la tabla 'empleados'
  Las consultas con incidencias usan aliases explícitos para distinguir entre
  las dos foreign keys que apuntan a la misma tabla (id_empleado_creador e id_tecnico_asignado)
 */

import supabase from '../config/supabase.js'

const empleadosDao = {

  // Devuelve todos los empleados ordenados alfabéticamente por apellido y nombre
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .order('apellido1', { ascending: true })
      .order('nombre', { ascending: true })
    if (error) throw error
    return data
  },

  // Busca un empleado por su correo electrónico
  async obtenerPorCorreo(correo) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('correo', correo)
      .single()
    if (error) throw error
    return data
  },

  // Inserta un nuevo empleado en la base de datos
  // La contraseña llega ya hasheada desde el controller
  async registrar(empleado) {
    const { data, error } = await supabase
      .from('empleados')
      .insert([empleado])
      .select()
    if (error) throw error
    return data[0]
  },

  // Baja lógica: cambia el estado del empleado a 'baja'
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

  // Devuelve solo los empleados con estado 'activo'
  async listarActivos() {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('estado', 'activo')
    if (error) throw error
    return data
  },

  // Filtra empleados por departamento (coincidencia exacta)
  async listarPorDepartamento(departamento) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('departamento', departamento)
    if (error) throw error
    return data
  },

  // Filtra empleados por nivel de acceso (administrador/técnico)
  async listarPorNivel(nivel_acceso) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('nivel_acceso', nivel_acceso)
    if (error) throw error
    return data
  },

  // Devuelve un empleado con las incidencias que ha creado
  // Usa alias 'incidencias_creadas' para referenciar la FK id_empleado_creador
  // y distinguirla de la FK id_tecnico_asignado que apunta a la misma tabla
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

  // Devuelve un empleado con las incidencias que tiene asignadas
  // Usa alias 'incidencias_asignadas' para referenciar la FK id_tecnico_asignado
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

  // Devuelve el empleado con mayor número de incidencias asignadas
  // El ordenamiento se realiza en JavaScript tras obtener los datos
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

  // Devuelve un objeto con el recuento de empleados agrupado por departamento
  // El agrupamiento se realiza en JavaScript con reduce
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

  // Devuelve un objeto con el recuento de empleados agrupado por estado laboral
  // El agrupamiento se realiza en JavaScript con reduce
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

  // Busca un empleado por su ID
  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Actualiza el hash de la contraseña de un empleado
  // La contraseña llega ya hasheada desde el controller
  async cambiarPassword(id, passwordHash) {
    const { data, error } = await supabase
      .from('empleados')
      .update({ password_hash: passwordHash })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  // Actualiza los datos de un empleado existente
  async actualizar(id, empleado) {
    const { data, error } = await supabase
      .from('empleados')
      .update(empleado)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

}

export default empleadosDao