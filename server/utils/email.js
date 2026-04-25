import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const enviarEmailCambioPassword = async (empleado) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      // En producción con dominio propio -> to: empleado.correo
      // Limitaciones de la cuenta de Resend. Se usa el correo del .env para demostrar la funcionalidad
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
    // Si falla el email no se interrumpe la operación principal
    console.error('Error al enviar email:', err.message)
  }
}