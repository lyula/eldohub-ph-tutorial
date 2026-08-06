<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="classes"
  >
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'Pending' },
})

const map = {
  Pending: { label: 'Pending', classes: 'bg-neutral-100 text-neutral-700' },
  Queued: { label: 'Queued', classes: 'bg-amber-50 text-amber-700' },
  Success: { label: 'Success', classes: 'bg-green-50 text-green-700' },
  Failed: { label: 'Failed', classes: 'bg-red-50 text-red-700' },
}

const label = computed(() => map[props.status]?.label || props.status)
const classes = computed(() => map[props.status]?.classes || map.Pending.classes)
</script>
