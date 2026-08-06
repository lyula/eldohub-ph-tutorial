const axios = require('axios');
const Transaction = require('../models/Transaction');

function mapPayheroStatus(status) {
  const value = (status || '').toUpperCase();
  if (value === 'SUCCESS') return 'Success';
  if (value === 'FAILED') return 'Failed';
  return 'Queued';
}

exports.initiateSTKPush = async (req, res) => {
  const { amount, phone, reference } = req.body;

  try {
    const { data } = await axios.post(
      'https://backend.payhero.co.ke/api/v2/payments',
      {
        amount,
        phone_number: phone,
        channel_id: Number(process.env.PAYHERO_CHANNEL_ID),
        provider: 'm-pesa',
        external_reference: reference,
        callback_url: process.env.CALLBACK_URL,
      },
      {
        headers: {
          Authorization: process.env.PAYHERO_AUTH_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    const transaction = await Transaction.create({
      userId: req.userId,
      checkoutRequestId: data.CheckoutRequestID,
      payheroReference: data.reference,
      externalReference: reference,
      phoneNumber: phone,
      amount,
      status: mapPayheroStatus(data.status) || 'Queued',
    });

    res.json({
      ...data,
      transactionId: transaction._id,
      transaction,
    });
  } catch (error) {
    const payheroError = error.response?.data;
    res.status(error.response?.status || 500).json({
      error: payheroError?.message || payheroError?.error || error.message,
      details: payheroError,
    });
  }
};

exports.paymentCallback = async (req, res) => {
  const body = req.body;
  const payload = body.response || body;

  try {
    const status = payload.Status === 'Success' ? 'Success' : 'Failed';

    await Transaction.findOneAndUpdate(
      {
        $or: [
          { checkoutRequestId: payload.CheckoutRequestID },
          { externalReference: payload.ExternalReference },
        ],
      },
      {
        status,
        mpesaReceiptNumber: payload.MpesaReceiptNumber || undefined,
        rawCallbackData: body,
      },
      { new: true }
    );

    res.status(200).send('OK');
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Error');
  }
};

exports.getTransactions = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, Number.parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = { userId: req.userId };

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
};

exports.getTransaction = async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.userId,
  });

  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  res.json(transaction);
};
