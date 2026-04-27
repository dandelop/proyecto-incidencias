<!--
  Componente reutilizable de modal de confirmación de Bootstrap
  Admite dos modos visuales: estándar (azul) y peligroso (rojo),
  controlados mediante la prop 'peligroso'
  
  Uso:
  <ModalConfirmacion
    id="modalEliminar"
    titulo="¿Eliminar?"
    mensaje="Esta acción no se puede deshacer"
    :peligroso="true"
    textoConfirmar="Eliminar"
    @confirmar="eliminar"
  />
-->

<script setup>
// Props que recibe el componente
defineProps({
  id: String,               // ID único del modal, necesario para el data-bs-target del botón que lo abre
  titulo: String,           // Título que aparece en la cabecera del modal
  mensaje: String,          // Mensaje informativo del cuerpo del modal
  peligroso: {
    type: Boolean,
    default: false          // Si es true, la cabecera y el botón de confirmar se muestran en rojo
  },
  textoCancelar: {
    type: String,
    default: 'Cancelar'
  },
  textoConfirmar: {
    type: String,
    default: 'Confirmar'
  }
})

// Evento que emite al confirmar, para que el componente padre ejecute la acción correspondiente
defineEmits(['confirmar'])
</script>

<template>
  <div class="modal fade" :id="id" tabindex="-1">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">

        <!-- Cabecera: roja si es peligroso, estándar si no -->
        <div class="modal-header" :class="peligroso ? 'bg-danger text-white' : ''">
          <h6 class="modal-title">{{ titulo }}</h6>
          <button type="button" class="btn-close" :class="peligroso ? 'btn-close-white' : ''"
            data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <p class="mb-0">{{ mensaje }}</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">
            {{ textoCancelar }}
          </button>
          <!-- Botón de confirmación: danger si es peligroso, primary si no -->
          <button type="button" :class="`btn btn-sm ${peligroso ? 'btn-danger' : 'btn-primary'}`"
            data-bs-dismiss="modal" @click="$emit('confirmar')">
            {{ textoConfirmar }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>