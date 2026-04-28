/*
  Utilidades para el envío de correos electrónicos transaccionales
  Usa Resend como servicio de envío de emails
 
  Limitación: en el plan gratuito de Resend sin dominio propio verificado,
  solo se pueden enviar emails al correo del propietario de la cuenta
  En producción con dominio propio, sustituir process.env.CORREO por empleado.correo
  para que el aviso llegue al correo real de cada empleado
 
  Si el envío falla no se interrumpe la operación principal que lo invocó
  un fallo de notificación nunca debe impedir que el sistema funcione
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Envía un email de aviso al empleado cuando su contraseña ha sido modificada
// Permite detectar cambios no autorizados y contactar con un administrador
export const enviarEmailCambioPassword = async (empleado) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      // En producción con dominio propio -> to: empleado.correo
      // Limitación de Resend sin dominio: solo permite enviar al correo del .env
      to: process.env.CORREO,
      subject: 'Tu contraseña ha sido modificada',
      html: `
        <h2>Cambio de contraseña</h2>
        <p>Hola <strong>${empleado.nombre} ${empleado.apellido1}</strong>,</p>
        <p>Tu contraseña ha sido modificada. Si no has sido tú, contacta con un administrador.</p>
        <br>
        <p>IncidenciasApp</p>
      `
    })
  } catch (err) {
    // El fallo del email se registra en consola pero no interrumpe la operación principal
    console.error('Error al enviar email:', err.message)
  }
}