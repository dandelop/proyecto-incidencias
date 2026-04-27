/*
  Estado global de autenticación de la aplicación

  Implementado con reactive() de Vue como alternativa ligera a Pinia,
  suficiente para el alcance de esta aplicación

  Propiedades:
  - empleado:   datos del empleado logueado (id, nombre, nivel_acceso...) o null si no hay sesión
  - isLoggedIn: indica si hay una sesión activa
  - cargando:   true mientras App.vue verifica la sesión con el servidor al arrancar
                El navigation guard espera a que sea false antes de evaluar el acceso a rutas
*/

import { reactive } from 'vue'

export const authStore = reactive({
  empleado: null,
  isLoggedIn: false,
  cargando: true
})