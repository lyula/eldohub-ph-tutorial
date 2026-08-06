<template>
  <header class="border-b border-neutral-200 bg-white">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
      <div class="flex min-w-0 items-center gap-2.5">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-600">
          <span class="text-sm font-bold text-white">PH</span>
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-black">PayHero Demo</p>
          <p class="truncate text-xs text-neutral-500">Eldo Hub Integration</p>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <div class="hidden text-right md:block">
          <p class="text-sm font-medium text-black">{{ user?.name }}</p>
          <p class="max-w-[160px] truncate text-xs text-neutral-500">{{ user?.email }}</p>
        </div>
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700 md:hidden">
          {{ initials }}
        </div>
        <button
          type="button"
          class="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-black hover:text-black sm:px-3 sm:text-sm"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, logout } = useAuth()

const initials = computed(() => {
  const name = user.value?.name || 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

function handleLogout() {
  logout()
  router.push('/login')
}
</script>
