import { ref } from 'vue'
import { paymentApi } from '@/services/api'

const POLL_INTERVAL_MS = 5000
const MAX_ATTEMPTS = 12

function isFinalStatus(status) {
  return ['Success', 'Failed'].includes(status)
}

export function useTransactionPolling() {
  const pollingState = ref({})
  const timers = new Map()

  function setPollingMeta(id, patch) {
    pollingState.value = {
      ...pollingState.value,
      [id]: {
        attempt: 0,
        maxAttempts: MAX_ATTEMPTS,
        isPolling: true,
        ...pollingState.value[id],
        ...patch,
      },
    }
  }

  function clearPollingMeta(id) {
    const next = { ...pollingState.value }
    delete next[id]
    pollingState.value = next
  }

  function stopPolling(id) {
    const timer = timers.get(id)
    if (typeof timer === 'number') clearTimeout(timer)
    timers.delete(id)
    if (pollingState.value[id]) {
      setPollingMeta(id, { isPolling: false })
    }
  }

  function startPolling(id, onRefresh) {
    if (timers.has(id)) return

    let attempt = 0
    setPollingMeta(id, { attempt: 0, isPolling: true })

    const runPoll = async () => {
      if (!timers.has(id) && attempt > 0) return
      if (attempt >= MAX_ATTEMPTS) {
        stopPolling(id)
        clearPollingMeta(id)
        return
      }

      attempt += 1
      setPollingMeta(id, { attempt, isPolling: true })

      try {
        const { data } = await paymentApi.getTransactions()
        onRefresh(data)

        const transaction = data.find((tx) => tx._id === id)
        if (transaction && isFinalStatus(transaction.status)) {
          stopPolling(id)
          clearPollingMeta(id)
          return
        }
      } catch {
        // Keep checking until attempts are exhausted.
      }

      if (attempt >= MAX_ATTEMPTS) {
        stopPolling(id)
        clearPollingMeta(id)
        return
      }

      const timeout = setTimeout(runPoll, POLL_INTERVAL_MS)
      timers.set(id, timeout)
    }

    timers.set(id, 0)
    runPoll()
  }

  function resumePollingForQueued(transactions, onRefresh) {
    transactions
      .filter((tx) => ['Pending', 'Queued'].includes(tx.status))
      .forEach((tx) => startPolling(tx._id, onRefresh))
  }

  function stopAll() {
    timers.forEach((timer) => {
      if (typeof timer === 'number') clearTimeout(timer)
    })
    timers.clear()
    pollingState.value = {}
  }

  return {
    pollingState,
    startPolling,
    stopPolling,
    stopAll,
    resumePollingForQueued,
  }
}
