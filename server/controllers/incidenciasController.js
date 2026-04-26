import incidenciasDao from '../dao/incidenciasDao.js'
import supabase from '../config/supabase.js'
import registrarLog from '../middlewares/registroSeguridad.js'

const incidenciasController = {

  // consultas básicas
  async contar(req, res) {
    try {
      const total = await incidenciasDao.contar()
      res.json({ total })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarTodas(req, res) {
    try {
      const incidencias = await incidenciasDao.listarTodas()
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

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

  async insertar(req, res, next) {
    try {
      const incidencia = req.body

      // Título obligatorio
      if (!incidencia.titulo || incidencia.titulo.trim() === '') {
        return res.status(400).json({ error: 'El título es obligatorio' })
      }

      // Comprueba si el equipo ya tiene una incidencia activa
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

      const nueva = await incidenciasDao.insertar({
        ...incidencia,
        codigo: 'TEMPORAL'
      })

      const año = new Date().getFullYear()
      const codigo = `INC-${año}-${nueva.id}`
      const actualizada = await incidenciasDao.modificar(nueva.id, { codigo })

      await registrarLog(req.empleado.id, 'INCIDENCIA_CREADA', `Incidencia ${actualizada.codigo} creada`, req)

      res.status(201).json(actualizada)

    } catch (err) {
      next(err)
    }
  },

  async modificar(req, res, next) {
    try {
      const { id } = req.params
      const cambios = req.body

      // Fechas automáticas según el estado
      if (cambios.estado === 'en_proceso' && !cambios.fecha_inicio) {
        cambios.fecha_inicio = new Date().toISOString()
      }

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

  // Consultas avanzadas

  async listarConDetalles(req, res) {
    try {
      const incidencias = await incidenciasDao.listarConDetalles()
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorEstado(req, res) {
    try {
      const { estado } = req.params
      const incidencias = await incidenciasDao.listarPorEstado(estado)
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorAsignado(req, res) {
    try {
      const { id } = req.params
      const incidencias = await incidenciasDao.listarPorAsignado(Number(id))
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorCliente(req, res) {
    try {
      const { id } = req.params
      const incidencias = await incidenciasDao.listarPorCliente(Number(id))
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorTipoEquipo(req, res) {
    try {
      const { tipo } = req.params
      const incidencias = await incidenciasDao.listarPorTipoEquipo(tipo)
      res.json(incidencias)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

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
