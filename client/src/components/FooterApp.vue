<!-- 
  Componente de pie de página común a todas las vistas excepto el login
  Se incluye en App.vue condicionalmente según la ruta actual
-->
<template>
  <footer class="bg-dark text-light py-3 mt-auto">
    <div class="container text-center">
      <p class="mb-0">
        &copy; {{ new Date().getFullYear() }} IncidenciasApp — Todos los derechos reservados
      </p>
    </div>
  </footer>
</template>