const { Admin, User, Artisan, Booking, Payment, Review, Settings } = require('../models');
const { getPaginationOptions } = require('../utils/helpers');
const { sendTokenResponse } = require('../config/jwt');

// @desc    Register admin
// @route   POST /api/admin/register
// @access  Private (Super Admin)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin',
      permissions: permissions || ['manage_users', 'manage_artisans', 'manage_bookings', 'view_analytics']
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboard = async (req, res) => {
  try {
    // Count statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalArtisans = await Artisan.countDocuments({ isActive: true });
    const pendingArtisans = await Artisan.countDocuments({ isApproved: false, isActive: true });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Revenue statistics
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalPlatformFees: { $sum: '$platformFee' },
          totalArtisanPayouts: { $sum: '$artisanAmount' }
        }
      }
    ]);

    // Monthly statistics
    const monthlyStats = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$pricing.totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate('user', 'firstName lastName')
      .populate('artisan', 'firstName lastName category')
      .sort({ createdAt: -1 })
      .limit(10);

    // Top artisans
    const topArtisans = await Artisan.find({ isApproved: true })
      .select('firstName lastName profileImage rating completedJobs totalEarnings')
      .sort({ rating: -1, completedJobs: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalArtisans,
          pendingArtisans,
          totalBookings,
          pendingBookings,
          completedBookings,
          revenue: revenueStats[0] || { totalRevenue: 0, totalPlatformFees: 0, totalArtisanPayouts: 0 }
        },
        monthlyStats,
        recentBookings,
        topArtisans
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { search, isActive } = req.query;

    let query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all artisans
// @route   GET /api/admin/artisans
// @access  Private (Admin)
const getArtisans = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { search, isApproved, isActive } = req.query;

    let query = {};
    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const artisans = await Artisan.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Artisan.countDocuments(query);

    res.status(200).json({
      success: true,
      count: artisans.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      data: artisans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve artisan
// @route   PUT /api/admin/artisans/:id/approve
// @access  Private (Admin)
const approveArtisan = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    artisan.isApproved = true;
    artisan.isVerified = true;
    await artisan.save();

    res.status(200).json({
      success: true,
      message: 'Artisan approved successfully',
      data: artisan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject artisan
// @route   PUT /api/admin/artisans/:id/reject
// @access  Private (Admin)
const rejectArtisan = async (req, res) => {
  try {
    const { reason } = req.body;
    const artisan = await Artisan.findById(req.params.id);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    artisan.isApproved = false;
    artisan.rejectionReason = reason;
    await artisan.save();

    res.status(200).json({
      success: true,
      message: 'Artisan rejected',
      data: artisan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private (Admin)
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Deactivate artisan
// @route   PUT /api/admin/artisans/:id/deactivate
// @access  Private (Admin)
const deactivateArtisan = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    artisan.isActive = false;
    await artisan.save();

    res.status(200).json({
      success: true,
      message: 'Artisan deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.find();

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
  try {
    const { commissionPercentage } = req.body;

    // Update commission percentage
    if (commissionPercentage !== undefined) {
      await Settings.findOneAndUpdate(
        { key: 'commissionPercentage' },
        {
          key: 'commissionPercentage',
          value: commissionPercentage,
          description: 'Platform commission percentage on each booking',
          updatedBy: req.user.id,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }

    const settings = await Settings.find();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private (Admin)
const getReviews = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { reported } = req.query;

    let query = {};
    if (reported === 'true') {
      query.reported = true;
    }

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName')
      .populate('artisan', 'firstName lastName')
      .populate('booking', 'bookingNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

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

// @desc    Hide/Show review
// @route   PUT /api/admin/reviews/:id/visibility
// @access  Private (Admin)
const toggleReviewVisibility = async (req, res) => {
  try {
    const { isVisible } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isVisible = isVisible;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${isVisible ? 'shown' : 'hidden'} successfully`,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all admins
// @route   GET /api/admin/admins
// @access  Private (Super Admin)
const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerAdmin,
  getDashboard,
  getUsers,
  getArtisans,
  approveArtisan,
  rejectArtisan,
  deactivateUser,
  deactivateArtisan,
  getSettings,
  updateSettings,
  getReviews,
  toggleReviewVisibility,
  getAdmins
};
