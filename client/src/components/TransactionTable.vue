<template>
  <section class="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-black sm:text-lg">Recent Transactions</h2>
        <p class="text-xs text-neutral-500 sm:text-sm">Latest STK requests and callbacks.</p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:border-green-200 hover:bg-green-50 sm:text-sm"
        @click="$emit('refresh')"
      >
        Refresh
      </button>
    </div>

    <div v-if="initialLoading" class="py-8 text-center text-sm text-neutral-500">Loading...</div>

    <div
      v-else-if="!transactions.length"
      class="rounded-xl bg-neutral-50 py-10 text-center text-sm text-neutral-500"
    >
      No transactions yet. Send your first STK push.
    </div>

    <template v-else>
      <!-- Mobile cards -->
      <div class="space-y-3 sm:hidden">
        <article
          v-for="tx in transactions"
          :key="tx._id"
          class="rounded-xl border border-neutral-100 bg-neutral-50 p-4 transition-colors"
        >
          <div class="mb-3 flex items-start justify-between gap-2">
            <p class="break-all font-mono text-xs text-neutral-800">{{ tx.externalReference }}</p>
            <StatusBadge :status="tx.status" />
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p class="text-xs text-neutral-500">Phone</p>
              <p class="font-medium text-black">{{ tx.phoneNumber }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-neutral-500">Amount</p>
              <p class="font-medium text-black">KES {{ tx.amount }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-neutral-500">M-Pesa Code</p>
              <p class="font-mono text-xs font-medium text-black">{{ mpesaLabel(tx) }}</p>
            </div>
          </div>
        </article>
      </div>

      <!-- Desktop table -->
      <div class="hidden overflow-x-auto sm:block">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
              <th class="pb-3 pr-4 font-medium">Reference</th>
              <th class="pb-3 pr-4 font-medium">Phone</th>
              <th class="pb-3 pr-4 font-medium">Amount</th>
              <th class="pb-3 pr-4 font-medium">M-Pesa Code</th>
              <th class="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in transactions"
              :key="tx._id"
              class="border-b border-neutral-50 last:border-0 transition-colors"
            >
              <td class="max-w-[160px] truncate py-3 pr-4 font-mono text-xs text-neutral-800">
                {{ tx.externalReference }}
              </td>
              <td class="py-3 pr-4 text-neutral-600">{{ tx.phoneNumber }}</td>
              <td class="py-3 pr-4 font-medium text-black">KES {{ tx.amount }}</td>
              <td class="py-3 pr-4 font-mono text-xs text-neutral-700">{{ mpesaLabel(tx) }}</td>
              <td class="py-3"><StatusBadge :status="tx.status" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
        <p class="text-xs text-neutral-500">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
          <span class="hidden sm:inline">· {{ pagination.total }} total</span>
        </p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pagination.page <= 1"
            @click="$emit('page-change', pagination.page - 1)"
          >
            Previous
          </button>
          <button
            type="button"
            class="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-300 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pagination.page >= pagination.totalPages"
            @click="$emit('page-change', pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'
import { getMpesaCode } from '@/lib/transaction'

defineProps({
  transactions: { type: Array, default: () => [] },
  initialLoading: { type: Boolean, default: false },
  pagination: {
    type: Object,
    default: () => ({ page: 1, limit: 10, total: 0, totalPages: 1 }),
  },
})

defineEmits(['refresh', 'page-change'])

function mpesaLabel(tx) {
  return getMpesaCode(tx) || '—'
}
</script>
