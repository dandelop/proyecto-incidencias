import clientesDao from '../dao/clientesDao.js'
import supabase from '../config/supabase.js'
import registrarLog from '../middlewares/registroSeguridad.js'

const clientesController = {

  async listarTodos(req, res) {
    try {
      const clientes = await clientesDao.listarTodos()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

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
        // Cancelamos todas las incidencias activas
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

  async eliminar(req, res) {
    try {
      const { id } = req.params

      // Comprobamos si tiene incidencias activas
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

  async contar(req, res) {
    try {
      const total = await clientesDao.contar()
      res.json({ total })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorTipo(req, res) {
    try {
      const { tipo } = req.params
      const clientes = await clientesDao.listarPorTipo(tipo)
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarActivos(req, res) {
    try {
      const clientes = await clientesDao.listarActivos()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarBajas(req, res) {
    try {
      const clientes = await clientesDao.listarBajas()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarConIncidencias(req, res) {
    try {
      const clientes = await clientesDao.listarConIncidencias()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarConIncidenciasActivas(req, res) {
    try {
      const clientes = await clientesDao.listarConIncidenciasActivas()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarSinIncidencias(req, res) {
    try {
      const clientes = await clientesDao.listarSinIncidencias()
      res.json(clientes)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async contarPorTipo(req, res) {
    try {
      const conteo = await clientesDao.contarPorTipo()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async clienteConMasIncidencias(req, res) {
    try {
      const cliente = await clientesDao.clienteConMasIncidencias()
      res.json(cliente)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

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
