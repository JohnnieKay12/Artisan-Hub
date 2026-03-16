const express = require('express');
const router = express.Router();
const { paymentController } = require('../controllers');
const { protect, authorize } = require('../middlewares/auth');
const { validatePayment } = require('../middlewares/validation');

// Initialize payment (User only)
router.post('/initialize', protect, authorize('user'), validatePayment, paymentController.initializePayment);

// Verify payment (Public - callback from Paystack)
router.get('/verify', paymentController.verifyPayment);

// Paystack webhook (Public)
router.post('/webhook', paymentController.paystackWebhook);

// Get all payments (Admin only)
router.get('/', protect, authorize('admin', 'superadmin'), paymentController.getPayments);

// Get payment statistics (Admin only)
router.get('/stats/overview', protect, authorize('admin', 'superadmin'), paymentController.getPaymentStats);

// Get user payments
router.get('/my-payments', protect, authorize('user'), paymentController.getMyPayments);

// Release payment to artisan (Admin only)
router.post('/:id/release', protect, authorize('admin', 'superadmin'), paymentController.releasePayment);

module.exports = router;
