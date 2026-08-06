const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    checkoutRequestId: String,
    payheroReference: String,
    externalReference: { type: String, required: true },
    phoneNumber: String,
    amount: Number,
    mpesaReceiptNumber: String,
    status: { type: String, default: 'Pending' },
    rawCallbackData: Object,
    rawStatusData: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
