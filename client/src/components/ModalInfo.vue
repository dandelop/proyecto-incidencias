<!--
  Componente reutilizable para mostrar mensajes informativos al usuario
  A diferencia de ModalConfirmacion.vue, este modal solo tiene un botón de cierre
  y no emite ningún evento — se usa para notificar, no para confirmar acciones

  Props:
    - id: identificador único del modal (requerido por Bootstrap para el data-bs-target)
    - titulo: texto del encabezado del modal
    - mensaje: texto del cuerpo del modal
-->

<script setup>
defineProps({
  id: String,
  titulo: String,
  mensaje: String,
})
</script>

<template>
  <div class="modal fade" :id="id" tabindex="-1">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">

        <div class="modal-header">
          <h6 class="modal-title">{{ titulo }}</h6>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <p class="mb-0">{{ mensaje }}</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal">
            Entendido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>