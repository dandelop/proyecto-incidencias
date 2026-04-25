import { reactive } from 'vue'

export const authStore = reactive({
  empleado: null,
  isLoggedIn: false,
  cargando: true
})