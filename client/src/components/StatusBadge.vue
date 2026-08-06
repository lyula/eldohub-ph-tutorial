<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="classes"
  >
    <span
      v-if="polling"
      class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
    />
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: 'Pending' },
  polling: { type: Boolean, default: false },
})

const map = {
  Pending: { label: 'Pending', classes: 'bg-neutral-100 text-neutral-700' },
  Queued: { label: 'Awaiting payment', classes: 'bg-amber-50 text-amber-700' },
  Success: { label: 'Success', classes: 'bg-green-50 text-green-700' },
  Failed: { label: 'Failed', classes: 'bg-red-50 text-red-700' },
}

const label = computed(() => {
  if (props.polling) return 'Checking status...'
  return map[props.status]?.label || props.status
})

const classes = computed(() => {
  if (props.polling) return 'bg-amber-50 text-amber-700'
  return map[props.status]?.classes || map.Pending.classes
})
</script>
