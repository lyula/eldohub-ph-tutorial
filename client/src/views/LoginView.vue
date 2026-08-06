<template>
  <AuthForm
    title="PayHero Demo"
    subtitle="Sign in to test M-Pesa STK integration"
    submit-text="Sign in"
    loading-text="Signing in..."
    :loading="loading"
    :error="error"
    @submit="handleLogin"
  >
    <div class="space-y-4">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
        <input
          v-model="email"
          type="email"
          required
          placeholder="you@example.com"
          class="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>
      <PasswordInput v-model="password" required />
    </div>

    <template #footer>
      Don't have an account?
      <RouterLink to="/register" class="font-medium text-green-700 hover:text-green-800">
        Register
      </RouterLink>
    </template>
  </AuthForm>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthForm from '@/components/AuthForm.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import { authApi } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { setSession } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await authApi.login(email.value, password.value)
    setSession(data.token, data.user)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.error || 'Invalid email or password.'
  } finally {
    loading.value = false
  }
}
</script>
