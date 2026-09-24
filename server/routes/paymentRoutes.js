const express = require('express');
const router = express.Router();
const {
  processPayment,
  getPaymentByOrderId
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/process', processPayment);
router.post('/create', processPayment); // alias for convenience
router.get('/:orderId', getPaymentByOrderId);

module.exports = router;
