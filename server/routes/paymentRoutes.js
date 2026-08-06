const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/paymentController');

const router = express.Router();

router.post('/stk-push', auth, controller.initiateSTKPush);
router.post('/callback', controller.paymentCallback);
router.get('/transactions', auth, controller.getTransactions);
router.get('/transactions/:id', auth, controller.getTransaction);

module.exports = router;
