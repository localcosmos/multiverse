<script setup lang="ts">

</script>

<template>
  <span class="loader"></span>
</template>

<style scoped>
.loader {
  width: 30px;
  height: 30px;
  border: 3px solid #aaaaaa;
  border-bottom-color: #363636;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
  0% {
      transform: rotate(0deg);
  }
  100% {
      transform: rotate(360deg);
  }
} 
</style>

