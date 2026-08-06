<template>
  <div class="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
          <span class="text-lg font-bold text-white">PH</span>
        </div>
        <h1 class="text-2xl font-bold text-black">{{ title }}</h1>
        <p class="mt-1 text-sm text-neutral-500">{{ subtitle }}</p>
      </div>

      <form
        class="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        @submit.prevent="$emit('submit')"
      >
        <slot />

        <button
          type="submit"
          :disabled="loading"
          class="mt-6 w-full rounded-xl bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:bg-neutral-300"
        >
          {{ loading ? loadingText : submitText }}
        </button>

        <p v-if="error" class="mt-4 text-center text-sm text-red-600">{{ error }}</p>

        <p class="mt-6 text-center text-sm text-neutral-500">
          <slot name="footer" />
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
  submitText: String,
  loadingText: String,
  loading: Boolean,
  error: String,
})

defineEmits(['submit'])
</script>
