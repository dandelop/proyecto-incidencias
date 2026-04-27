/*
  Instancia centralizada de Axios para todas las peticiones a la API

  baseURL se configura mediante la variable de entorno VITE_API_URL,
  definida en Vercel para producción y en .env.local para desarrollo
  Si no está definida, apunta a localhost para desarrollo local

  withCredentials: true es necesario para que el navegador envíe
  automáticamente la cookie httpOnly con el JWT en cada petición,
  permitiendo que el servidor verifique la sesión del usuario
*/

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true
})

export default api