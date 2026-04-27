/*
  Funciones de utilidad para el tratamiento de texto
  Normaliza un texto para comparaciones insensibles a mayúsculas y tildes
  Convierte a minúsculas y elimina los diacríticos (tildes, diéresis, etc.)
  usando la descomposición Unicode NFD

  Uso: normalizar('Técnico') === normalizar('tecnico') // true
  
  @param {string} texto - Texto a normalizar
  @returns {string} Texto normalizado, o cadena vacía si el valor es nulo/indefinido
 */

export const normalizar = (texto) => {
  if (!texto) return ''
  return texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}