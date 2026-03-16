const { User, Booking, Artisan, Review } = require('../models');
const { getPaginationOptions } = require('../utils/helpers');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (User)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (User)
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, location } = req.body;

    const updateData = {
      firstName,
      lastName,
      phone,
      address,
      location
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle avatar upload
    if (req.cloudinaryUrl) {
      updateData.avatar = req.cloudinaryUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private (User)
const getMyBookings = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { status } = req.query;

    let query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('artisan', 'firstName lastName phone profileImage category rating')
      .populate('payment', 'reference status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/users/bookings/:id
// @access  Private (User)
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('artisan', 'firstName lastName phone profileImage category rating')
      .populate('payment', 'reference status amount')
      .populate('user', 'firstName lastName phone avatar');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/users/bookings/:id/cancel
// @access  Private (User)
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status}`
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user.id;
    booking.cancelledByModel = 'User';
    booking.cancelledAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create review
// @route   POST /api/users/reviews
// @access  Private (User)
const createReview = async (req, res) => {
  try {
    const { booking: bookingId, rating, review, categories } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.id,
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not completed'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const newReview = await Review.create({
      booking: bookingId,
      user: req.user.id,
      artisan: booking.artisan,
      rating,
      review,
      categories,
      isVerified: true
    });

    // Update artisan rating
    const artisan = await Artisan.findById(booking.artisan);
    const allReviews = await Review.find({ artisan: booking.artisan });
    
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    artisan.rating = totalRating / allReviews.length;
    artisan.reviewCount = allReviews.length;
    
    await artisan.save();

    // Mark booking as reviewed
    booking.reviewLeft = true;
    await booking.save();

    res.status(201).json({
      success: true,
      data: newReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user reviews
// @route   GET /api/users/reviews
// @access  Private (User)
const getMyReviews = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);

    const reviews = await Review.find({ user: req.user.id })
      .populate('artisan', 'firstName lastName profileImage category')
      .populate('booking', 'bookingNumber service')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: reviews.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get favorite artisans (artisans user has booked before)
// @route   GET /api/users/favorites
// @access  Private (User)
const getFavoriteArtisans = async (req, res) => {
  try {
    // Get unique artisans from bookings
    const bookings = await Booking.find({ user: req.user.id })
      .distinct('artisan');

    const artisans = await Artisan.find({
      _id: { $in: bookings },
      isActive: true,
      isApproved: true
    }).select('firstName lastName profileImage category rating hourlyRate');

    res.status(200).json({
      success: true,
      count: artisans.length,
      data: artisans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private (User)
const deleteAccount = async (req, res) => {
  try {
    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      user: req.user.id,
      status: { $in: ['pending', 'paid', 'in-progress'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with active bookings. Please cancel or complete all bookings first.'
      });
    }

    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getMyBookings,
  getBooking,
  cancelBooking,
  createReview,
  getMyReviews,
  getFavoriteArtisans,
  deleteAccount
};
