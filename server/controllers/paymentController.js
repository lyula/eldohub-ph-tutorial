const axios = require('axios');
const Transaction = require('../models/Transaction');

// function to initiate STK push
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

    await Transaction.create({
      userId: req.userId,
      checkoutRequestId: data.CheckoutRequestID,
      payheroReference: data.reference,
      externalReference: reference,
      phoneNumber: phone,
      amount,
      status: data.status || 'Queued',
    });

    res.json(data);
  } catch (error) {
    const payheroError = error.response?.data;
    res.status(error.response?.status || 500).json({
      error: payheroError?.message || payheroError?.error || error.message,
      details: payheroError,
    });
  }
};

// function to handle payment callback for payment status
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
      { status, rawCallbackData: body },
      { new: true }
    );

    res.status(200).send('OK');
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).send('Error');
  }
};

exports.getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(transactions);
};

exports.getTransactionStatus = async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://backend.payhero.co.ke/api/v2/transaction-status',
      {
        params: { reference: req.params.reference },
        headers: { Authorization: process.env.PAYHERO_AUTH_TOKEN },
      }
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
};
