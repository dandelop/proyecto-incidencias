/*
  Controlador para la gestión de incidencias (reparaciones).
  Incluye lógica de negocio como validación de título obligatorio,
  comprobación de equipo sin incidencias activas, generación de código único,
  actualización automática de fechas según el estado y registro de auditoría.
 */

import incidenciasDao from '../dao/incidenciasDao.js'
import supabase from '../config/supabase.js'
import registrarLog from '../middlewares/registroSeguridad.js'

const incidenciasController = {

  // Devuelve el total de incidencias registradas
  async contar(req, res) {
    try {
      const total = await incidenciasDao.contar()
      res.json({ total })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve el listado completo de incidencias ordenado por fecha de creación descendente
  async listarTodas(req, res) {
    try {
      const incidencias = await incidenciasDao.listarTodas()
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Busca una incidencia por su ID. Devuelve 404 si no existe
  async buscarPorId(req, res) {
    try {
      const { id } = req.params
      const incidencia = await incidenciasDao.buscarPorId(Number(id))
      if (!incidencia) return res.status(404).json({ error: 'Incidencia no encontrada' })
      res.json(incidencia)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Crea una nueva incidencia con las siguientes reglas:
  // - El título es obligatorio
  // - Un equipo no puede tener más de una incidencia activa simultáneamente
  // - El código se genera automáticamente con el formato INC-{año}-{id}
  async insertar(req, res, next) {
    try {
      const incidencia = req.body

      // Título obligatorio
      if (!incidencia.titulo || incidencia.titulo.trim() === '') {
        return res.status(400).json({ error: 'El título es obligatorio' })
      }

      // Bloqueamos la creación si el equipo ya tiene una incidencia activa
      const { data: incidenciasEquipo } = await supabase
        .from('incidencias')
        .select('id')
        .eq('id_equipo', incidencia.id_equipo)
        .not('estado', 'in', '("entregado","cancelado")')

      if (incidenciasEquipo.length > 0) {
        return res.status(409).json({
          error: 'Este equipo ya tiene una incidencia activa'
        })
      }

      // Insertamos con código temporal para obtener el ID generado por Supabase
      const nueva = await incidenciasDao.insertar({
        ...incidencia,
        codigo: 'TEMPORAL'
      })

      // Actualizamos con el código definitivo usando el ID real
      const año = new Date().getFullYear()
      const codigo = `INC-${año}-${nueva.id}`
      const actualizada = await incidenciasDao.modificar(nueva.id, { codigo })

      await registrarLog(req.empleado.id, 'INCIDENCIA_CREADA', `Incidencia ${actualizada.codigo} creada`, req)

      res.status(201).json(actualizada)

    } catch (err) {
      next(err)
    }
  },

  // Modifica una incidencia existente.
  // Aplica fechas automáticas según el cambio de estado:
  // - Al pasar a 'en_proceso' se registra la fecha de inicio
  // - Al pasar a 'entregado' o 'cancelado' se registra la fecha de cierre
  async modificar(req, res, next) {
    try {
      const { id } = req.params
      const cambios = req.body

      // Fecha de inicio automática al comenzar a trabajar en la incidencia
      if (cambios.estado === 'en_proceso' && !cambios.fecha_inicio) {
        cambios.fecha_inicio = new Date().toISOString()
      }

      // Fecha de cierre automática al finalizar o cancelar la incidencia
      if (['entregado', 'cancelado'].includes(cambios.estado)) {
        cambios.fecha_cierre = new Date().toISOString()
      }

      const modificada = await incidenciasDao.modificar(Number(id), cambios)
      await registrarLog(req.empleado.id, 'INCIDENCIA_MODIFICADA', `Incidencia ${modificada.codigo} modificada`, req)
      res.json(modificada)

    } catch (err) {
      next(err)
    }
  },

  // Elimina una incidencia de forma permanente
  async eliminar(req, res) {
    try {
      const { id } = req.params
      await incidenciasDao.eliminar(Number(id))
      await registrarLog(req.empleado.id, 'INCIDENCIA_ELIMINADA', `Incidencia id:${id} eliminada`, req)
      res.json({ mensaje: 'Incidencia eliminada correctamente' })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve todas las incidencias con datos completos del cliente, equipo y empleados asociados
  async listarConDetalles(req, res) {
    try {
      const incidencias = await incidenciasDao.listarConDetalles()
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra incidencias por estado (creada, en_proceso, reparado, etc.)
  async listarPorEstado(req, res) {
    try {
      const { estado } = req.params
      const incidencias = await incidenciasDao.listarPorEstado(estado)
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra incidencias por el empleado asignado (técnico o administrador)
  async listarPorAsignado(req, res) {
    try {
      const { id } = req.params
      const incidencias = await incidenciasDao.listarPorAsignado(Number(id))
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra incidencias por cliente
  async listarPorCliente(req, res) {
    try {
      const { id } = req.params
      const incidencias = await incidenciasDao.listarPorCliente(Number(id))
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra incidencias por tipo de equipo (smartphone, portátil, etc.)
  async listarPorTipoEquipo(req, res) {
    try {
      const { tipo } = req.params
      const incidencias = await incidenciasDao.listarPorTipoEquipo(tipo)
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve las incidencias que no están en estado 'entregado' ni 'cancelado'
  async listarActivas(req, res) {
    try {
      const incidencias = await incidenciasDao.listarActivas()
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

}

export default incidenciasController