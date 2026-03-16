const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { protect, authorize } = require('../middlewares/auth');
const { validateSettings } = require('../middlewares/validation');

// Dashboard
router.get('/dashboard', protect, authorize('admin', 'superadmin'), adminController.getDashboard);

// Admin management (Super Admin only)
router.post('/register', protect, authorize('superadmin'), adminController.registerAdmin);
router.get('/admins', protect, authorize('superadmin'), adminController.getAdmins);

// User management
router.get('/users', protect, authorize('admin', 'superadmin'), adminController.getUsers);
router.put('/users/:id/deactivate', protect, authorize('admin', 'superadmin'), adminController.deactivateUser);

// Artisan management
router.get('/artisans', protect, authorize('admin', 'superadmin'), adminController.getArtisans);
router.put('/artisans/:id/approve', protect, authorize('admin', 'superadmin'), adminController.approveArtisan);
router.put('/artisans/:id/reject', protect, authorize('admin', 'superadmin'), adminController.rejectArtisan);
router.put('/artisans/:id/deactivate', protect, authorize('admin', 'superadmin'), adminController.deactivateArtisan);

// Settings
router.get('/settings', protect, authorize('admin', 'superadmin'), adminController.getSettings);
router.put('/settings', protect, authorize('admin', 'superadmin'), validateSettings, adminController.updateSettings);

// Reviews
router.get('/reviews', protect, authorize('admin', 'superadmin'), adminController.getReviews);
router.put('/reviews/:id/visibility', protect, authorize('admin', 'superadmin'), adminController.toggleReviewVisibility);

module.exports = router;
