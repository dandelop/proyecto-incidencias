import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true // hace falta para enviar la cookie http-only en cada petición
})

export default api