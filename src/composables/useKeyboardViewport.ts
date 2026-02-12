import { ref, onMounted, onUnmounted } from 'vue';

export function useKeyboardViewport() {
  const keyboardOpen = ref(false);

  const update = () => {
    const vv = window.visualViewport;
    if (!vv) return;
    const ratio = vv.height / window.innerHeight;
    const open = ratio < 0.85;
    if (open === keyboardOpen.value) return;

    keyboardOpen.value = open;
    document.documentElement.classList.toggle('keyboard-open', open);

    const header = document.getElementById('HeaderBar');
    if (header) {
      header.style.webkitTransform = 'translateZ(0)';
      header.style.transform = 'translateZ(0)';
      header.style.position = 'fixed';
    }
  };

  onMounted(() => {
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update, { passive: true });
      update();
    }
  });

  onUnmounted(() => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', update);
    }
  });

  return { keyboardOpen };
}