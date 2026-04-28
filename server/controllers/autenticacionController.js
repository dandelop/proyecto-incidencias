/* 
  Gestiona el ciclo de autenticación: login, logout y consulta de sesión activa
  Utiliza bcrypt para verificar contraseñas y JWT almacenado en cookie httpOnly
  para mantener la sesión sin exponer el token al frontend.
*/

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import autenticacionDao from '../dao/autenticacionDao.js'
import registrarLog from '../middlewares/registroSeguridad.js'

const autenticacionController = {

  async login(req, res, next) {
    try {
      const { correo, password } = req.body

      // Ambos campos son obligatorios
      if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' })
      }

      // Buscamos el empleado por correo
      const empleado = await autenticacionDao.buscarPorCorreo(correo)

      // Verificamos credenciales - el mensaje de error es intencionalmente genérico
      // para no revelar si el correo existe o no (prevención de enumeración de usuarios)
      if (!empleado || !(await bcrypt.compare(password, empleado.password_hash))) {
        await registrarLog(null, 'LOGIN_FALLIDO', `Intento fallido con correo: ${correo}`, req)
        return res.status(401).json({ error: 'Credenciales incorrectas' })
      }

      // Solo se permite acceso a empleados activos
      if (empleado.estado !== 'activo') {
        return res.status(403).json({ error: 'Usuario inactivo, contacta con un administrador' })
      }

      // Construimos el payload del JWT con los datos mínimos necesarios
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

      // Almacenamos el token en una cookie httpOnly para que JS no pueda acceder a él,
      // mitigando ataques XSS. Secure y sameSite='None' son necesarios en producción
      // cuando frontend y backend están en dominios distintos.
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 8 * 60 * 60 * 1000 // 8 horas en milisegundos
      })

      await registrarLog(empleado.id, 'LOGIN_EXITOSO', 'Inicio de sesión correcto', req)

      // Devolvemos solo los datos necesarios para el frontend, nunca el hash de la contraseña
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
    // Registramos el evento antes de destruir la cookie
    await registrarLog(req.empleado?.id, 'LOGOUT', 'Cierre de sesión', req)

    // Borramos la cookie con las mismas opciones con las que fue creada
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'None'
    })
    res.json({ mensaje: 'Sesión cerrada correctamente' })
  },

  // Devuelve los datos del empleado autenticado extraídos del JWT.
  // Usado por el frontend al arrancar para restaurar la sesión activa.
  async me(req, res) {
    res.json({ empleado: req.empleado })
  }
}

export default autenticacionController