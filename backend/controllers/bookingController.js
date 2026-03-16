const { Booking, Artisan, Payment, Settings } = require('../models');
const { getPaginationOptions, calculateCommission } = require('../utils/helpers');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    const {
      artisan: artisanId,
      service,
      description,
      scheduledDate,
      scheduledTime,
      duration,
      location
    } = req.body;

    // Check if artisan exists and is approved
    const artisan = await Artisan.findById(artisanId);
    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    if (!artisan.isApproved || !artisan.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This artisan is not available for booking'
      });
    }

    // Calculate pricing
    const hours = duration || 1;
    const subtotal = artisan.hourlyRate * hours;
    
    // Get platform commission
    const settings = await Settings.findOne({ key: 'commissionPercentage' });
    const commissionPercentage = settings ? settings.value : 10;
    
    const { commission, artisanAmount } = calculateCommission(subtotal, commissionPercentage);
    const totalAmount = subtotal + commission;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      artisan: artisanId,
      service,
      description,
      scheduledDate,
      scheduledTime,
      duration: hours,
      location,
      pricing: {
        hourlyRate: artisan.hourlyRate,
        hours,
        subtotal,
        platformFee: commission,
        totalAmount
      }
    });

    await booking.populate('artisan', 'firstName lastName phone profileImage');
    await booking.populate('user', 'firstName lastName phone avatar');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private (Admin)
const getBookings = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { status, user, artisan } = req.query;

    let query = {};
    if (status) query.status = status;
    if (user) query.user = user;
    if (artisan) query.artisan = artisan;

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('artisan', 'firstName lastName email phone category')
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
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'firstName lastName email phone avatar')
      .populate('artisan', 'firstName lastName email phone profileImage category')
      .populate('payment', 'reference status amount paidAt')
      .populate('cancelledBy', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to view this booking
    const isAuthorized = 
      req.userType === 'admin' || 
      req.userType === 'superadmin' ||
      booking.user._id.toString() === req.user.id ||
      booking.artisan._id.toString() === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
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

// @desc    Update booking status (artisan)
// @route   PUT /api/bookings/:id/status
// @access  Private (Artisan)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      artisan: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Validate status transition
    const validTransitions = {
      'paid': ['in-progress'],
      'in-progress': ['completed']
    };

    if (validTransitions[booking.status] && !validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${booking.status} to ${status}`
      });
    }

    booking.status = status;
    
    if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking (artisan)
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Artisan)
const cancelBookingArtisan = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      artisan: req.user.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status}`
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user.id;
    booking.cancelledByModel = 'Artisan';
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

// @desc    Get booking statistics (admin)
// @route   GET /api/bookings/stats/overview
// @access  Private (Admin)
const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const monthlyStats = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: stats,
        monthlyStats,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBookingArtisan,
  getBookingStats
};
