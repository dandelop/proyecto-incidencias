/*
  Controlador para la gestión de clientes
  Actúa como intermediario entre las rutas HTTP y la capa de acceso a datos (DAO)
  Incluye lógica de negocio como comprobación de incidencias activas antes de bajas/eliminaciones
  y registro de auditoría en todas las operaciones de escritura
 */

import clientesDao from '../dao/clientesDao.js'
import supabase from '../config/supabase.js'
import registrarLog from '../middlewares/registroSeguridad.js'

const clientesController = {

  // Devuelve el listado completo de clientes ordenado alfabéticamente
  async listarTodos(req, res) {
    try {
      const clientes = await clientesDao.listarTodos()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Busca un cliente por su ID. Devuelve 404 si no existe
  async buscarPorId(req, res) {
    try {
      const { id } = req.params
      const cliente = await clientesDao.buscarPorId(Number(id))
      if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })
      res.json(cliente)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Crea un nuevo cliente y registra la acción en el log de auditoría
  async insertar(req, res) {
    try {
      const cliente = req.body
      const nuevo = await clientesDao.insertar(cliente)
      await registrarLog(req.empleado.id, 'CLIENTE_CREADO', `Cliente ${nuevo.nombre} ${nuevo.apellido1} creado`, req)
      res.status(201).json(nuevo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Actualiza los datos de un cliente existente y registra la modificación
  async actualizar(req, res) {
    try {
      const { id } = req.params
      const cliente = req.body
      const actualizado = await clientesDao.actualizar(Number(id), cliente)
      await registrarLog(req.empleado.id, 'CLIENTE_MODIFICADO', `Cliente id:${id} modificado`, req)
      res.json(actualizado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Baja lógica del cliente
  // Si tiene incidencias activas, las cancela automáticamente antes de proceder
  // Devuelve el número de incidencias canceladas para informar al frontend
  async darDeBaja(req, res) {
    try {
      const { id } = req.params

      // Comprobamos si tiene incidencias activas
      const { data: incidencias } = await supabase
        .from('incidencias')
        .select('id')
        .eq('id_cliente', Number(id))
        .not('estado', 'in', '("entregado","cancelado")')

      if (incidencias.length > 0) {
        // Cancelamos todas las incidencias activas antes de dar de baja al cliente
        await supabase
          .from('incidencias')
          .update({ estado: 'cancelado', fecha_cierre: new Date().toISOString() })
          .eq('id_cliente', Number(id))
          .not('estado', 'in', '("entregado","cancelado")')
      }

      const cliente = await clientesDao.darDeBaja(Number(id))
      await registrarLog(req.empleado.id, 'CLIENTE_BAJA', `Cliente id:${id} dado de baja`, req)
      res.json({ cliente, incidenciasCanceladas: incidencias.length })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Eliminación física del cliente
  // No se permite si tiene incidencias activas. Devuelve error 409 en ese caso
  async eliminar(req, res) {
    try {
      const { id } = req.params

      // Bloqueamos la eliminación si hay incidencias activas asociadas
      const { data: incidencias } = await supabase
        .from('incidencias')
        .select('id')
        .eq('id_cliente', Number(id))
        .not('estado', 'in', '("entregado","cancelado")')

      if (incidencias.length > 0) {
        return res.status(409).json({
          error: 'El cliente tiene incidencias activas',
          incidenciasActivas: incidencias.length
        })
      }

      await clientesDao.eliminar(Number(id))
      await registrarLog(req.empleado.id, 'CLIENTE_ELIMINADO', `Cliente id:${id} eliminado`, req)
      res.json({ mensaje: 'Cliente eliminado correctamente' })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve el total de clientes registrados
  async contar(req, res) {
    try {
      const total = await clientesDao.contar()
      res.json({ total })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra clientes por tipo (particular, autónomo, empresa)
  async listarPorTipo(req, res) {
    try {
      const { tipo } = req.params
      const clientes = await clientesDao.listarPorTipo(tipo)
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve solo los clientes con estado activo
  async listarActivos(req, res) {
    try {
      const clientes = await clientesDao.listarActivos()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve solo los clientes dados de baja
  async listarBajas(req, res) {
    try {
      const clientes = await clientesDao.listarBajas()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve clientes con todas sus incidencias asociadas
  async listarConIncidencias(req, res) {
    try {
      const clientes = await clientesDao.listarConIncidencias()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve clientes que tienen al menos una incidencia en estado activo
  async listarConIncidenciasActivas(req, res) {
    try {
      const clientes = await clientesDao.listarConIncidenciasActivas()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve clientes activos que no tienen ninguna incidencia registrada
  async listarSinIncidencias(req, res) {
    try {
      const clientes = await clientesDao.listarSinIncidencias()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve un objeto con el recuento de clientes agrupado por tipo
  async contarPorTipo(req, res) {
    try {
      const conteo = await clientesDao.contarPorTipo()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve el cliente con mayor número de incidencias registradas
  async clienteConMasIncidencias(req, res) {
    try {
      const cliente = await clientesDao.clienteConMasIncidencias()
      res.json(cliente)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Reactiva un cliente dado de baja, limpiando su fecha de baja y marcándolo como activo
  async darDeAlta(req, res) {
    try {
      const { id } = req.params
      const cliente = await clientesDao.darDeAlta(Number(id))
      res.json(cliente)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

}

export default clientesController