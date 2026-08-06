import { onUnmounted, ref } from 'vue'
import { paymentApi } from '@/services/api'

const POLL_INTERVAL_MS = 5000
const MAX_ATTEMPTS = 12

function isFinalStatus(status) {
  return ['Success', 'Failed'].includes(status)
}

export function usePaymentStatus() {
  const isWaiting = ref(false)
  const attempt = ref(0)
  const status = ref('')
  const transactionId = ref(null)

  let timer = null
  let attempts = 0

  function stopWaiting() {
    if (timer) clearTimeout(timer)
    timer = null
    isWaiting.value = false
  }

  function startWaiting(id, { onUpdate, onComplete }) {
    stopWaiting()

    transactionId.value = id
    attempts = 0
    attempt.value = 0
    status.value = 'Queued'
    isWaiting.value = true

    const poll = async () => {
      if (!isWaiting.value || attempts >= MAX_ATTEMPTS) {
        if (isWaiting.value && attempts >= MAX_ATTEMPTS) {
          status.value = 'Timeout'
          onComplete?.('Timeout')
        }
        stopWaiting()
        return
      }

      attempts += 1
      attempt.value = attempts

      try {
        const { data: transaction } = await paymentApi.getTransaction(id)

        if (transaction) {
          status.value = transaction.status
          onUpdate?.(transaction)

          if (isFinalStatus(transaction.status)) {
            onComplete?.(transaction.status, transaction)
            stopWaiting()
            return
          }
        }
      } catch {
        // Continue polling quietly.
      }

      if (attempts < MAX_ATTEMPTS && isWaiting.value) {
        timer = setTimeout(poll, POLL_INTERVAL_MS)
      } else {
        status.value = 'Timeout'
        onComplete?.('Timeout')
        stopWaiting()
      }
    }

    poll()
  }

  onUnmounted(stopWaiting)

  return {
    isWaiting,
    attempt,
    maxAttempts: MAX_ATTEMPTS,
    status,
    transactionId,
    startWaiting,
    stopWaiting,
  }
}
