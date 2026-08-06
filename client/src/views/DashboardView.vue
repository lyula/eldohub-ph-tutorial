<template>
  <div class="min-h-screen overflow-x-hidden bg-neutral-50">
    <AppNavbar />

    <main class="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      <div class="mb-5 sm:mb-8">
        <h1 class="text-xl font-bold text-black sm:text-3xl">Dashboard</h1>
        <p class="mt-1 text-sm text-neutral-500">Initiate STK pushes and track payment callbacks.</p>
      </div>

      <div class="flex flex-col gap-5 lg:grid lg:grid-cols-5 lg:gap-6">
        <div class="lg:col-span-2">
          <StkPushForm @sent="handleStkSent" />
        </div>
        <div class="lg:col-span-3">
          <TransactionTable
            :transactions="transactions"
            :loading="loading"
            :polling-state="pollingState"
            @refresh="loadTransactions"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import StkPushForm from '@/components/StkPushForm.vue'
import TransactionTable from '@/components/TransactionTable.vue'
import { paymentApi } from '@/services/api'
import { useTransactionPolling } from '@/composables/useTransactionPolling'

const transactions = ref([])
const loading = ref(false)

const { pollingState, startPolling, stopAll, resumePollingForQueued } = useTransactionPolling()

async function loadTransactions() {
  loading.value = true
  try {
    const { data } = await paymentApi.getTransactions()
    transactions.value = data
    resumePollingForQueued(data, (updated) => {
      transactions.value = updated
    })
  } catch {
    transactions.value = []
  } finally {
    loading.value = false
  }
}

function handleStkSent(payload) {
  if (payload?.transaction) {
    transactions.value = [
      payload.transaction,
      ...transactions.value.filter((tx) => tx._id !== payload.transaction._id),
    ]
    startPolling(payload.transaction._id, (updated) => {
      transactions.value = updated
    })
    return
  }

  loadTransactions()
}

onMounted(loadTransactions)
onUnmounted(stopAll)
</script>
