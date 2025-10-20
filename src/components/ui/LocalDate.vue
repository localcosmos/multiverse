<script setup lang="ts">

const props = defineProps<{
  date: string;
}>();

const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

const localDate = new Date(props.date).toLocaleDateString(undefined, dateOptions);

</script>

<template>
  <span>
    {{ localDate }}
  </span>
</template>