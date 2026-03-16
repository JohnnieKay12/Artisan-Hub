const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const artisanRoutes = require('./artisans');
const userRoutes = require('./users');
const bookingRoutes = require('./bookings');
const paymentRoutes = require('./payments');
const chatRoutes = require('./chat');
const adminRoutes = require('./admin');

router.use('/auth', authRoutes);
router.use('/artisans', artisanRoutes);
router.use('/users', userRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
