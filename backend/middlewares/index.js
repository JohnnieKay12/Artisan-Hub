const { protect, authorize, optionalAuth } = require('./auth');
const errorHandler = require('./errorHandler');
const { upload, uploadSingleImage, uploadMultipleImages, uploadMixedFiles } = require('./upload');
const {
  handleValidationErrors,
  validateUserRegister,
  validateUserLogin,
  validateArtisanRegister,
  validateBooking,
  validateReview,
  validatePayment,
  validateSettings
} = require('./validation');

module.exports = {
  protect,
  authorize,
  optionalAuth,
  errorHandler,
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadMixedFiles,
  handleValidationErrors,
  validateUserRegister,
  validateUserLogin,
  validateArtisanRegister,
  validateBooking,
  validateReview,
  validatePayment,
  validateSettings
};
