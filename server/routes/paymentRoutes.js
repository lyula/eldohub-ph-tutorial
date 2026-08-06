const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/paymentController');

const router = express.Router();

router.post('/stk-push', auth, controller.initiateSTKPush);
router.post('/callback', controller.paymentCallback);
router.get('/transactions', auth, controller.getTransactions);
router.get('/status/:reference', auth, controller.getTransactionStatus);

module.exports = router;
