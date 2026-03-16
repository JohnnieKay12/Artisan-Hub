const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { protect, authorize } = require('../middlewares/auth');
const { validateBooking, validateReview } = require('../middlewares/validation');
const { uploadSingleImage } = require('../middlewares/upload');

// Profile routes
router.get('/profile', protect, authorize('user'), userController.getProfile);
router.put('/profile', protect, authorize('user'), uploadSingleImage('avatar'), userController.updateProfile);
router.delete('/profile', protect, authorize('user'), userController.deleteAccount);

// Booking routes
router.get('/bookings', protect, authorize('user'), userController.getMyBookings);
router.get('/bookings/:id', protect, authorize('user'), userController.getBooking);
router.put('/bookings/:id/cancel', protect, authorize('user'), userController.cancelBooking);

// Review routes
router.post('/reviews', protect, authorize('user'), validateReview, userController.createReview);
router.get('/reviews', protect, authorize('user'), userController.getMyReviews);

// Favorites
router.get('/favorites', protect, authorize('user'), userController.getFavoriteArtisans);

module.exports = router;
