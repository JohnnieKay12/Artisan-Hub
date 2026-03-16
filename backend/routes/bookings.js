const express = require('express');
const router = express.Router();
const { bookingController } = require('../controllers');
const { protect, authorize } = require('../middlewares/auth');
const { validateBooking } = require('../middlewares/validation');

// Create booking (User only)
router.post('/', protect, authorize('user'), validateBooking, bookingController.createBooking);

// Get all bookings (Admin only)
router.get('/', protect, authorize('admin', 'superadmin'), bookingController.getBookings);

// Get booking statistics (Admin only)
router.get('/stats/overview', protect, authorize('admin', 'superadmin'), bookingController.getBookingStats);

// Get single booking
router.get('/:id', protect, bookingController.getBooking);

// Update booking status (Artisan only)
router.put('/:id/status', protect, authorize('artisan'), bookingController.updateBookingStatus);

// Cancel booking (Artisan only)
router.put('/:id/cancel', protect, authorize('artisan'), bookingController.cancelBookingArtisan);

module.exports = router;
