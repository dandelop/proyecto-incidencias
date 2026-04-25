import empleadosDao from '../dao/empleadosDao.js'
import bcrypt from 'bcryptjs'
import supabase from '../config/supabase.js'
import { enviarEmailCambioPassword } from '../utils/email.js'

const empleadosController = {

  async obtenerTodos(req, res) {
    try {
      const empleados = await empleadosDao.obtenerTodos()
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async obtenerPorCorreo(req, res) {
    try {
      const { correo } = req.params
      const empleado = await empleadosDao.obtenerPorCorreo(correo)
      if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' })
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async registrar(req, res) {
    try {
      const empleado = req.body

      const password_hash = await bcrypt.hash(empleado.password_hash, 10)

      const nuevo = await empleadosDao.registrar({
        ...empleado,
        password_hash
      })
      res.status(201).json(nuevo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async darDeBaja(req, res) {
    try {
      const { id } = req.params
      const empleado = await empleadosDao.darDeBaja(Number(id))
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarActivos(req, res) {
    try {
      const empleados = await empleadosDao.listarActivos()
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorDepartamento(req, res) {
    try {
      const { departamento } = req.params
      const empleados = await empleadosDao.listarPorDepartamento(departamento)
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarPorNivel(req, res) {
    try {
      const { nivel } = req.params
      const empleados = await empleadosDao.listarPorNivel(nivel)
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarConIncidenciasCreadas(req, res) {
    try {
      const { id } = req.params
      const empleado = await empleadosDao.listarConIncidenciasCreadas(Number(id))
      if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' })
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async listarConIncidenciasAsignadas(req, res) {
    try {
      const { id } = req.params
      const empleado = await empleadosDao.listarConIncidenciasAsignadas(Number(id))
      if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' })
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async tecnicoConMasIncidencias(req, res) {
    try {
      const empleado = await empleadosDao.tecnicoConMasIncidencias()
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async contarPorDepartamento(req, res) {
    try {
      const conteo = await empleadosDao.contarPorDepartamento()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async contarPorEstado(req, res) {
    try {
      const conteo = await empleadosDao.contarPorEstado()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params
      if (isNaN(Number(id))) return res.status(400).json({ error: 'Id inválido' })

      // Si es técnico solo puede ver su propio perfil (admin puede ver todos)
      if (req.empleado.nivel_acceso === 'técnico' &&
        req.empleado.id !== Number(id)) {
        return res.status(403).json({ error: 'No tienes permisos para ver este perfil' })
      }

      const empleado = await empleadosDao.buscarPorId(Number(id))
      if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' })
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async cambiarPassword(req, res) {
    try {
      const { id } = req.params
      const { password_actual, password_nueva } = req.body

      if (!password_nueva) {
        return res.status(400).json({ error: 'La nueva contraseña es obligatoria' })
      }

      // Si es técnico solo puede cambiar la suya y necesita la actual (admin puede cambiar cualquiera)
      if (req.empleado.nivel_acceso === 'técnico') {
        if (req.empleado.id !== Number(id)) {
          return res.status(403).json({ error: 'No tienes permisos para cambiar la contraseña' })
        }

        if (!password_actual) {
          return res.status(400).json({ error: 'La contraseña actual es obligatoria' })
        }

        // Verifica contraseña actual
        const empleado = await empleadosDao.buscarPorId(Number(id))
        const passwordValida = await bcrypt.compare(password_actual, empleado.password_hash)
        if (!passwordValida) {
          return res.status(401).json({ error: 'La contraseña actual es incorrecta' })
        }
      }

      // Hashea la nueva
      const password_hash = await bcrypt.hash(password_nueva, 10)
      await empleadosDao.cambiarPassword(Number(id), password_hash)

      // Envía correo de aviso al empleado (idealmente al correo del propio empleado)
      const empleado = await empleadosDao.buscarPorId(Number(id))
      await enviarEmailCambioPassword(empleado)

      res.json({ mensaje: 'Contraseña actualizada correctamente' })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params
      const empleado = req.body

      // busca las incidencias del empleado
      const { data: incidenciasAfectadas } = await supabase
        .from('incidencias')
        .select('id')
        .eq('id_tecnico_asignado', Number(id))
        .not('estado', 'in', '("entregado","cancelado")')

      // Si el empleado no va a estar disponible, se le quitan las incidencias
      if (['baja', 'desvinculado', 'vacaciones'].includes(empleado.estado)) {
        await supabase
          .from('incidencias')
          .update({ id_tecnico_asignado: null })
          .eq('id_tecnico_asignado', Number(id))
          .not('estado', 'in', '("entregado","cancelado")')
      }

      const actualizado = await empleadosDao.actualizar(Number(id), empleado)
      res.json({ empleado: actualizado, incidenciasDesasignadas: incidenciasAfectadas.length })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },
}

export default empleadosController