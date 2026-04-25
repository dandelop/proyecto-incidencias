import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import autenticacionDao from '../dao/autenticacionDAO.js'
import registrarLog from '../middlewares/registroSeguridad.js'

const autenticacionController = {

  async login(req, res, next) {
    try {
      const { correo, password } = req.body

      // se comprueba que vienen los dos campos
      if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' })
      }

      // se busca al empleado
      const empleado = await autenticacionDao.buscarPorCorreo(correo)

      // se comprueba el password - mismo mensaje aunque falle por correo o por password
      if (!empleado || !(await bcrypt.compare(password, empleado.password_hash))) {
        await registrarLog(null, 'LOGIN_FALLIDO', `Intento fallido con correo: ${correo}`, req)
        return res.status(401).json({ error: 'Credenciales incorrectas' })
      }

      // se comprueba que el empleado está activo
      if (empleado.estado !== 'activo') {
        return res.status(403).json({ error: 'Usuario inactivo, contacta con un administrador' })
      }

      // se genera el JWT con los datos del empleado
      const payload = {
        id: empleado.id,
        correo: empleado.correo,
        nombre: empleado.nombre,
        apellido1: empleado.apellido1,
        nivel_acceso: empleado.nivel_acceso,
        departamento: empleado.departamento
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      })

      // se guarda el token en una cookie httponly
      res.cookie('token', token, {
        httpOnly: true,         // JS no puede acceder a ella
        secure: process.env.NODE_ENV === 'production', // solo HTTPS en producción
        sameSite: 'Lax',        // protección CSRF
        maxAge: 8 * 60 * 60 * 1000 // 8 horas en milisegundos
      })

      // Registramos el login exitoso
      await registrarLog(empleado.id, 'LOGIN_EXITOSO', 'Inicio de sesión correcto', req)

      // Devolvemos los datos básicos al frontend
      res.json({
        empleado: {
          id: empleado.id,
          nombre: empleado.nombre,
          apellido1: empleado.apellido1,
          correo: empleado.correo,
          nivel_acceso: empleado.nivel_acceso,
          departamento: empleado.departamento,
          puesto: empleado.puesto
        }
      })

    } catch (err) {
      next(err)
    }
  },

  async logout(req, res) {
    // Registramos el logout antes de borrar la cookie
    await registrarLog(req.empleado?.id, 'LOGOUT', 'Cierre de sesión', req)
    res.clearCookie('token')
    res.json({ mensaje: 'Sesión cerrada correctamente' })
  },

  // prueba
  async me(req, res) {
    res.json({ empleado: req.empleado })
  }
}

export default autenticacionController