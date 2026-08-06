<template>
  <div class="min-h-screen overflow-x-hidden bg-neutral-50">
    <AppNavbar />

    <main class="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      <div class="mb-5 sm:mb-8">
        <h1 class="text-xl font-bold text-black sm:text-3xl">Dashboard</h1>
        <p class="mt-1 text-sm text-neutral-500">Initiate STK pushes and track payment callbacks.</p>
      </div>

      <div class="flex flex-col gap-5 sm:grid sm:grid-cols-5 sm:items-stretch sm:gap-6">
        <div class="sm:col-span-2 sm:flex">
          <StkPushForm
            class="w-full"
            @transaction-added="handleTransactionAdded"
            @transaction-updated="updateTransaction"
            @payment-complete="() => loadTransactions(page, false)"
          />
        </div>
        <div class="sm:col-span-3 sm:flex">
          <TransactionTable
            class="w-full"
            :transactions="transactions"
            :initial-loading="initialLoading"
            :pagination="pagination"
            @refresh="loadTransactions(page, true)"
            @page-change="loadTransactions"
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
const page = ref(1)
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })

async function loadTransactions(nextPage = page.value, showLoading = false) {
  if (showLoading) initialLoading.value = true
  page.value = nextPage

  try {
    const { data } = await paymentApi.getTransactions(nextPage)
    transactions.value = data.transactions
    pagination.value = data.pagination
  } catch {
    if (showLoading) transactions.value = []
  } finally {
    initialLoading.value = false
  }
}

function handleTransactionAdded(transaction) {
  if (page.value === 1) {
    const exists = transactions.value.some((tx) => tx._id === transaction._id)
    if (!exists) {
      transactions.value = [transaction, ...transactions.value].slice(0, pagination.value.limit)
    }
    pagination.value.total += exists ? 0 : 1
    return
  }

  loadTransactions(1, false)
}

function updateTransaction(transaction) {
  const index = transactions.value.findIndex((tx) => tx._id === transaction._id)
  if (index === -1) return
  transactions.value[index] = { ...transactions.value[index], ...transaction }
}

onMounted(() => loadTransactions(1, true))
</script>
