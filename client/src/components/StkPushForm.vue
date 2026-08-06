<template>
  <section class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
    <div class="mb-5">
      <h2 class="text-lg font-semibold text-black">Send STK Push</h2>
      <p class="mt-1 text-sm text-neutral-500">Trigger an M-Pesa prompt via PayHero API.</p>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">Amount (KES)</label>
        <input
          v-model="form.amount"
          type="number"
          min="1"
          placeholder="e.g. 10"
          class="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">M-Pesa Number</label>
        <input
          v-model="form.phone"
          type="tel"
          placeholder="0712345678"
          class="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">Reference</label>
        <input
          v-model="form.reference"
          type="text"
          placeholder="ELDO-001"
          class="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        {{ loading ? 'Sending...' : 'Send STK Push' }}
      </button>
    </form>

    <p v-if="message" class="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
      {{ message }}
    </p>
    <p v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </p>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { paymentApi } from '@/services/api'

const emit = defineEmits(['sent'])

const loading = ref(false)
const message = ref('')
const error = ref('')

const form = reactive({
  amount: '',
  phone: '',
  reference: `ELDO-${Date.now()}`,
})

function formatPhone(phone) {
  let p = phone.replace(/\s+/g, '')
  if (p.startsWith('0')) p = `254${p.slice(1)}`
  if (p.startsWith('+')) p = p.slice(1)
  return p
}

async function submit() {
  message.value = ''
  error.value = ''

  if (!form.amount || !form.phone) {
    error.value = 'Amount and phone number are required.'
    return
  }

  loading.value = true
  try {
    const { data } = await paymentApi.stkPush({
      amount: Number(form.amount),
      phone: formatPhone(form.phone),
      reference: form.reference,
    })
    message.value = `STK sent. Reference: ${data.reference || form.reference}`
    emit('sent')
    form.reference = `ELDO-${Date.now()}`
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to send STK push.'
  } finally {
    loading.value = false
  }
}
</script>
