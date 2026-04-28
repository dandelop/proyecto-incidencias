/*
  Punto de entrada de la aplicación Vue

  - Crea la instancia de la aplicación Vue
  - Registra el enrutador (Vue Router)
  - Importa Bootstrap para estilos y componentes JS
  - Monta la aplicación en el elemento #app del index.html
*/

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App)
app.use(router)
app.mount('#app')