<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal';
import { computed } from 'vue';
import { useModalsStore } from '@/stores/modals';
import { PhX } from '@phosphor-icons/vue';

const props = defineProps<{
  modalType: string
}>();

const modals = useModalsStore();

const isOpen = computed({
  get: () => modals.open === props.modalType,
  set: (value: boolean) => {
    if (value) {
      modals.openModal(props.modalType);
    } else if (modals.open === props.modalType) {
      modals.closeModal();
    }
  }
});

const close = () => {
  modals.closeModal();
};
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    class="vfm-centered"
    v-bind="$attrs"
  >
    <div class="modal-box">
      <button class="modal-close-btn" @click="close" aria-label="Close">
        <PhX :size="28" />
      </button>
      <div class="modal-title">
        <slot name="title" />
      </div>
      <div class="modal-content">
        <slot />
      </div>
      <div class="modal-actions">
        <slot name="actions" />
      </div>
    </div>
  </VueFinalModal>
</template>

<style scoped>
.modal-box {
  background: #fff;
  border-radius: var(--border-radius);
  padding: var(--size-xl);
  min-width: 90vw;
  max-width: 98vw;
  min-height: 150px;
  max-height: 90vh;
  position: relative;
  margin: auto;
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #222;
}
.modal-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.modal-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 2;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close-btn:hover {
  color: #222;
}

@media (min-width: 640px) {
  .modal-box {
    min-width: 400px;
    max-width: 80vw;
  }
}

@media (min-width: 768px) {
  .modal-box {
    min-width: 480px;
    max-width: 60vw;
  }
}

@media (min-width: 1024px) {
  .modal-box {
    min-width: 540px;
    max-width: 40vw;
  }
}

@media (min-width: 1280px) {
  .modal-box {
    min-width: 600px;
    max-width: 32vw;
  }
}

@media (min-width: 1536px) {
  .modal-box {
    min-width: 700px;
    max-width: 28vw;
  }
}
</style>