const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect, authorize } = require('../middlewares/auth');
const {
  validateUserRegister,
  validateUserLogin,
  validateArtisanRegister
} = require('../middlewares/validation');

// User authentication
router.post('/register', validateUserRegister, authController.registerUser);
router.post('/login', validateUserLogin, authController.loginUser);

// Artisan authentication
router.post('/artisan/register', validateArtisanRegister, authController.registerArtisan);
router.post('/artisan/login', validateUserLogin, authController.loginArtisan);

// Admin authentication
router.post('/admin/login', validateUserLogin, authController.adminLogin);

// Protected routes
router.get('/me', protect, authController.getMe);
router.get('/logout', protect, authController.logout);
router.put('/update-password', protect, authController.updatePassword);

module.exports = router;
