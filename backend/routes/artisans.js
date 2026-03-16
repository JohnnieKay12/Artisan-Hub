const express = require('express');
const router = express.Router();
const { artisanController } = require('../controllers');
const { protect, authorize } = require('../middlewares/auth');
const { uploadSingleImage } = require('../middlewares/upload');

// Public routes
router.get('/', artisanController.getArtisans);
router.get('/categories', artisanController.getCategories);
router.get('/:id', artisanController.getArtisan);

// Protected routes (Artisan only)
router.get('/profile/me', protect, authorize('artisan'), artisanController.getMyProfile);
router.put('/profile', protect, authorize('artisan'), uploadSingleImage('profileImage'), artisanController.updateProfile);
router.get('/bookings/my-bookings', protect, authorize('artisan'), artisanController.getMyBookings);
router.get('/earnings/my-earnings', protect, authorize('artisan'), artisanController.getEarnings);

// Portfolio routes
router.post('/portfolio', protect, authorize('artisan'), uploadSingleImage('image'), artisanController.addPortfolioItem);
router.put('/portfolio', protect, authorize('artisan'), artisanController.updatePortfolio);

module.exports = router;
