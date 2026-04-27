/*
  Funciones de validación reutilizables para los formularios de la aplicación
  Se usan en el frontend como primera línea de defensa antes de enviar datos al servidor
  El backend realiza sus propias validaciones independientemente
*/

// Comprueba que el email tiene un formato válido (contiene @ y dominio)
export const esEmailValido = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Comprueba el formato de documentos de identidad españoles:
// DNI (8 dígitos + letra), NIE (X/Y/Z + 7 dígitos + letra) y CIF (letra + 7 dígitos + dígito/letra)
// Validación laxa para pruebas en desarrollo (no verifica la letra de control)
export const esDniValido = (dni) => {
  return /^[0-9]{8}[A-Za-z]$/.test(dni) ||    // DNI
    /^[XYZ][0-9]{7}[A-Za-z]$/.test(dni) ||    // NIE
    /^[A-Za-z][0-9]{7}[A-Za-z0-9]$/.test(dni) // CIF
}

// Comprueba que la contraseña tiene al menos 6 caracteres
// Validación laxa para pruebas en desarrollo
export const esPasswordValida = (password) => {
  return password.length >= 6
}

// Comprueba que un campo no está vacío, es null ni undefined
export const campoObligatorio = (valor) => {
  return valor !== null && valor !== undefined && valor.toString().trim() !== ''
}