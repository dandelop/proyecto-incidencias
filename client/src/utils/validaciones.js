export const esEmailValido = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validación laxa para preubas en desarrollo
export const esDniValido = (dni) => {
  return /^[0-9]{8}[A-Za-z]$/.test(dni) || // DNI
    /^[XYZ][0-9]{7}[A-Za-z]$/.test(dni) || // NIE
    /^[A-Za-z][0-9]{7}[A-Za-z0-9]$/.test(dni) // CIF
}

// Validación laxa para preubas en desarrollo
export const esPasswordValida = (password) => {
  return password.length >= 6
}

export const campoObligatorio = (valor) => {
  return valor !== null && valor !== undefined && valor.toString().trim() !== ''
}