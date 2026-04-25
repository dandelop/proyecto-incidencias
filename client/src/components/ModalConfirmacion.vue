<script setup>
defineProps({
  id: String,
  titulo: String,
  mensaje: String,
  peligroso: {
    type: Boolean,
    default: false
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

defineEmits(['confirmar'])
</script>

<template>
  <div class="modal fade" :id="id" tabindex="-1">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
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
          <button type="button" :class="`btn btn-sm ${peligroso ? 'btn-danger' : 'btn-primary'}`"
            data-bs-dismiss="modal" @click="$emit('confirmar')">
            {{ textoConfirmar }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>