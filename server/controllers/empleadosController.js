/*
  Controlador para la gestión de empleados.
  Incluye lógica de control de acceso por rol (administrador/técnico),
  hasheo de contraseñas, notificaciones por email y registro de auditoría.
 */

import empleadosDao from '../dao/empleadosDao.js'
import bcrypt from 'bcryptjs'
import supabase from '../config/supabase.js'
import { enviarEmailCambioPassword } from '../utils/email.js'
import registrarLog from '../middlewares/registroSeguridad.js'

const empleadosController = {

  // Devuelve el listado completo de empleados ordenado alfabéticamente
  async obtenerTodos(req, res) {
    try {
      const empleados = await empleadosDao.obtenerTodos()
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Busca un empleado por su correo electrónico
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

  // Registra un nuevo empleado.
  // La contraseña se hashea con bcrypt antes de almacenarse - nunca se guarda en texto plano.
  async registrar(req, res) {
    try {
      const empleado = req.body
      const password_hash = await bcrypt.hash(empleado.password_hash, 10)
      const nuevo = await empleadosDao.registrar({
        ...empleado,
        password_hash
      })
      await registrarLog(req.empleado.id, 'EMPLEADO_CREADO', `Empleado ${nuevo.nombre} ${nuevo.apellido1} creado`, req)
      res.status(201).json(nuevo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Baja lógica del empleado (cambia su estado a 'baja')
  async darDeBaja(req, res) {
    try {
      const { id } = req.params
      const empleado = await empleadosDao.darDeBaja(Number(id))
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve solo los empleados con estado 'activo'
  async listarActivos(req, res) {
    try {
      const empleados = await empleadosDao.listarActivos()
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra empleados por departamento
  async listarPorDepartamento(req, res) {
    try {
      const { departamento } = req.params
      const empleados = await empleadosDao.listarPorDepartamento(departamento)
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Filtra empleados por nivel de acceso (administrador/técnico)
  async listarPorNivel(req, res) {
    try {
      const { nivel } = req.params
      const empleados = await empleadosDao.listarPorNivel(nivel)
      res.json(empleados)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve un empleado junto con las incidencias que ha creado
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

  // Devuelve un empleado junto con las incidencias que tiene asignadas
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

  // Devuelve el técnico con mayor número de incidencias asignadas
  async tecnicoConMasIncidencias(req, res) {
    try {
      const empleado = await empleadosDao.tecnicoConMasIncidencias()
      res.json(empleado)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve un objeto con el recuento de empleados agrupado por departamento
  async contarPorDepartamento(req, res) {
    try {
      const conteo = await empleadosDao.contarPorDepartamento()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Devuelve un objeto con el recuento de empleados agrupado por estado laboral
  async contarPorEstado(req, res) {
    try {
      const conteo = await empleadosDao.contarPorEstado()
      res.json(conteo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Busca un empleado por su ID.
  // Control de acceso: un técnico solo puede ver su propio perfil.
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

  // Cambia la contraseña de un empleado.
  // Control de acceso: un técnico solo puede cambiar la suya y debe verificar la actual.
  // Un administrador puede cambiar la de cualquier empleado sin verificación.
  // Tras el cambio se envía un email de aviso y se registra en el log de auditoría.
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
        // Verifica que la contraseña actual es correcta antes de permitir el cambio
        const empleado = await empleadosDao.buscarPorId(Number(id))
        const passwordValida = await bcrypt.compare(password_actual, empleado.password_hash)
        if (!passwordValida) {
          return res.status(401).json({ error: 'La contraseña actual es incorrecta' })
        }
      }

      // Hashea la nueva contraseña antes de almacenarla
      const password_hash = await bcrypt.hash(password_nueva, 10)
      await empleadosDao.cambiarPassword(Number(id), password_hash)

      // Envía correo de aviso al empleado (idealmente al correo del propio empleado)
      const empleado = await empleadosDao.buscarPorId(Number(id))
      await enviarEmailCambioPassword(empleado)

      await registrarLog(req.empleado.id, 'PASSWORD_CAMBIADA', `Contraseña del empleado id:${id} modificada`, req)

      res.json({ mensaje: 'Contraseña actualizada correctamente' })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },

  // Actualiza los datos de un empleado.
  // Si el nuevo estado implica no disponibilidad (baja, desvinculado, vacaciones),
  // desasigna automáticamente sus incidencias activas para que puedan ser reasignadas.
  // Devuelve el número de incidencias desasignadas para informar al frontend.
  async actualizar(req, res) {
    try {
      const { id } = req.params
      const empleado = req.body

      // Busca las incidencias activas asignadas al empleado
      const { data: incidenciasAfectadas } = await supabase
        .from('incidencias')
        .select('id')
        .eq('id_tecnico_asignado', Number(id))
        .not('estado', 'in', '("entregado","cancelado")')

      // Si el empleado no va a estar disponible, se le quitan las incidencias asignadas
      if (['baja', 'desvinculado', 'vacaciones'].includes(empleado.estado)) {
        await supabase
          .from('incidencias')
          .update({ id_tecnico_asignado: null })
          .eq('id_tecnico_asignado', Number(id))
          .not('estado', 'in', '("entregado","cancelado")')
      }

      const actualizado = await empleadosDao.actualizar(Number(id), empleado)
      await registrarLog(req.empleado.id, 'EMPLEADO_MODIFICADO', `Empleado id:${id} modificado`, req)
      res.json({ empleado: actualizado, incidenciasDesasignadas: incidenciasAfectadas.length })

    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  },
}

export default empleadosController