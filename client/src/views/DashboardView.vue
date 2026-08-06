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
          <StkPushForm
            @transaction-added="addTransaction"
            @transaction-updated="updateTransaction"
          />
        </div>
        <div class="lg:col-span-3">
          <TransactionTable
            :transactions="transactions"
            :initial-loading="initialLoading"
            @refresh="loadTransactions(true)"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import StkPushForm from '@/components/StkPushForm.vue'
import TransactionTable from '@/components/TransactionTable.vue'
import { paymentApi } from '@/services/api'

const transactions = ref([])
const initialLoading = ref(true)

async function loadTransactions(showLoading = false) {
  if (showLoading) initialLoading.value = true
  try {
    const { data } = await paymentApi.getTransactions()
    transactions.value = data
  } catch {
    if (showLoading) transactions.value = []
  } finally {
    initialLoading.value = false
  }
}

function addTransaction(transaction) {
  const exists = transactions.value.some((tx) => tx._id === transaction._id)
  if (!exists) {
    transactions.value = [transaction, ...transactions.value]
  }
}

function updateTransaction(transaction) {
  const index = transactions.value.findIndex((tx) => tx._id === transaction._id)
  if (index === -1) return
  transactions.value[index] = { ...transactions.value[index], ...transaction }
}

onMounted(() => loadTransactions(true))
</script>
