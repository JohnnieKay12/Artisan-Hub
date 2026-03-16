const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User registration validation
const validateUserRegister = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Artisan registration validation
const validateArtisanRegister = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  body('skills')
    .isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('hourlyRate')
    .notEmpty().withMessage('Hourly rate is required')
    .isNumeric().withMessage('Hourly rate must be a number')
    .isFloat({ min: 0 }).withMessage('Hourly rate cannot be negative'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('location.address')
    .trim()
    .notEmpty().withMessage('Address is required'),
  body('location.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  body('location.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  handleValidationErrors
];

// Booking creation validation
const validateBooking = [
  body('artisan')
    .notEmpty().withMessage('Artisan ID is required')
    .isMongoId().withMessage('Invalid artisan ID'),
  body('service')
    .trim()
    .notEmpty().withMessage('Service description is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Booking description is required'),
  body('scheduledDate')
    .notEmpty().withMessage('Scheduled date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('scheduledTime')
    .trim()
    .notEmpty().withMessage('Scheduled time is required'),
  body('duration')
    .optional()
    .isNumeric().withMessage('Duration must be a number')
    .isFloat({ min: 0.5 }).withMessage('Duration must be at least 30 minutes'),
  body('location.address')
    .trim()
    .notEmpty().withMessage('Service location address is required'),
  handleValidationErrors
];

// Review validation
const validateReview = [
  body('booking')
    .notEmpty().withMessage('Booking ID is required')
    .isMongoId().withMessage('Invalid booking ID'),
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review')
    .trim()
    .notEmpty().withMessage('Review text is required')
    .isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters'),
  handleValidationErrors
];

// Payment validation
// Payment validation
const validatePayment = [
  body('bookingId')
    .notEmpty().withMessage('Booking ID is required')
    .isMongoId().withMessage('Invalid booking ID'),
  handleValidationErrors
];
// const validatePayment = [
//   body('booking')
//     .notEmpty().withMessage('Booking ID is required')
//     .isMongoId().withMessage('Invalid booking ID'),
//   handleValidationErrors
// ];

// Admin settings validation
const validateSettings = [
  body('commissionPercentage')
    .optional()
    .isNumeric().withMessage('Commission percentage must be a number')
    .isFloat({ min: 0, max: 100 }).withMessage('Commission percentage must be between 0 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegister,
  validateUserLogin,
  validateArtisanRegister,
  validateBooking,
  validateReview,
  validatePayment,
  validateSettings
};
