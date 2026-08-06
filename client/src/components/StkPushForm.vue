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
          :disabled="isWaiting"
          class="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-neutral-50"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">M-Pesa Number</label>
        <input
          v-model="form.phone"
          type="tel"
          placeholder="0712345678"
          :disabled="isWaiting"
          class="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-neutral-50"
        />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-neutral-700">Reference</label>
        <input
          v-model="form.reference"
          type="text"
          placeholder="ELDO-001"
          :disabled="isWaiting"
          class="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-neutral-50"
        />
      </div>

      <button
        type="submit"
        :disabled="loading || isWaiting"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        {{ submitLabel }}
      </button>
    </form>

    <div
      v-if="isWaiting"
      class="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4"
    >
      <div class="flex items-start gap-3">
        <span class="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-amber-900">Waiting for payment confirmation</p>
          <p class="mt-1 text-xs text-amber-800">
            Check your phone and enter your M-Pesa PIN.
          </p>
        </div>
      </div>
    </div>

    <p v-else-if="successMessage" class="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
      {{ successMessage }}
    </p>
    <p v-else-if="warningMessage" class="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
      {{ warningMessage }}
    </p>
    <p v-if="error" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </p>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { paymentApi } from '@/services/api'
import { usePaymentStatus } from '@/composables/usePaymentStatus'

const emit = defineEmits(['transaction-added', 'transaction-updated'])

const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const warningMessage = ref('')

const { isWaiting, startWaiting } = usePaymentStatus()

const form = reactive({
  amount: '',
  phone: '',
  reference: `ELDO-${Date.now()}`,
})

const submitLabel = computed(() => {
  if (loading.value) return 'Sending...'
  if (isWaiting.value) return 'Waiting for payment...'
  return 'Send STK Push'
})

function formatPhone(phone) {
  let p = phone.replace(/\s+/g, '')
  if (p.startsWith('0')) p = `254${p.slice(1)}`
  if (p.startsWith('+')) p = p.slice(1)
  return p
}

function clearMessages() {
  error.value = ''
  successMessage.value = ''
  warningMessage.value = ''
}

async function submit() {
  clearMessages()

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

    emit('transaction-added', data.transaction)
    form.reference = `ELDO-${Date.now()}`

    startWaiting(data.transaction._id, {
      onUpdate: (transaction) => emit('transaction-updated', transaction),
      onComplete: (result) => {
        if (result === 'Success') {
          successMessage.value = 'Payment confirmed successfully.'
        } else if (result === 'Failed') {
          error.value = 'Payment failed or was cancelled.'
        } else {
          warningMessage.value = 'Payment confirmation timed out. Check your transactions for the latest status.'
        }
      },
    })
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to send STK push.'
  } finally {
    loading.value = false
  }
}
</script>
