/*
  Configuración de Vite para el proyecto

  Plugins:
  - vue()        habilita el soporte para archivos .vue (Single File Components)
  - vueDevTools() añade el panel de Vue DevTools en el navegador durante el desarrollo
                  No tiene impacto en producción

  Alias:
  - '@' apunta a la carpeta src/, permitiendo imports absolutos como
    '@/components/NavBar.vue' en vez de rutas relativas como '../../../components/NavBar.vue'
*/

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})