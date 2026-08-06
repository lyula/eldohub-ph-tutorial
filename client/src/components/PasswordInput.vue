<template>
  <div>
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-neutral-700">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :value="modelValue"
        :type="visible ? 'text' : 'password'"
        :required="required"
        :minlength="minlength"
        :placeholder="placeholder"
        class="w-full rounded-xl border border-neutral-200 px-4 py-3 pr-11 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-700"
        :aria-label="visible ? 'Hide password' : 'Show password'"
        @click="visible = !visible"
      >
        <svg v-if="visible" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.75">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M10.58 10.58A2 2 0 0012 14a2 2 0 001.414-.586M9.88 5.09A10.72 10.72 0 0112 5c5.523 0 10 5 10 7s-1.2 2.16-3 3.5M6.12 6.12A10.72 10.72 0 002 12c0 2 4.477 7 10 7 1.657 0 3.21-.36 4.6-.99" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="h-5 w-5" stroke="currentColor" stroke-width="1.75">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Password' },
  placeholder: { type: String, default: '••••••••' },
  required: { type: Boolean, default: false },
  minlength: { type: [Number, String], default: undefined },
})

defineEmits(['update:modelValue'])

const visible = ref(false)
</script>
