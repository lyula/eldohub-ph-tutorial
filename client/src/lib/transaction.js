export function getMpesaCode(transaction) {
  return (
    transaction?.mpesaReceiptNumber ||
    transaction?.rawCallbackData?.response?.MpesaReceiptNumber ||
    null
  )
}
