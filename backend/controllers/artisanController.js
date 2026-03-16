const { Artisan, Review, Booking } = require('../models');
const { getPaginationOptions, buildSearchQuery, calculateDistance } = require('../utils/helpers');

// @desc    Get all artisans
// @route   GET /api/artisans
// @access  Public
const getArtisans = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { search, category, minRating, maxPrice, lat, lng, radius = 10, sortBy = 'rating' } = req.query;

    // Build query
    let query = { isApproved: true, isActive: true };

    // Search
    if (search) {
      const searchQuery = buildSearchQuery(search, ['firstName', 'lastName', 'bio', 'skills', 'category']);
      query = { ...query, ...searchQuery };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Price filter
    if (maxPrice) {
      query.hourlyRate = { $lte: parseFloat(maxPrice) };
    }

    // Location filter (if coordinates provided)
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      };
    }

    // Sort options
    let sortOption = {};
    switch (sortBy) {
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'price_low':
        sortOption = { hourlyRate: 1 };
        break;
      case 'price_high':
        sortOption = { hourlyRate: -1 };
        break;
      case 'experience':
        sortOption = { yearsOfExperience: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { rating: -1 };
    }

    const artisans = await Artisan.find(query)
      .select('-password')
      .sort(sortOption)
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

// @desc    Get single artisan
// @route   GET /api/artisans/:id
// @access  Public
const getArtisan = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id)
      .select('-password')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'firstName lastName avatar'
        }
      });

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: artisan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get artisan profile (for logged in artisan)
// @route   GET /api/artisans/profile/me
// @access  Private (Artisan)
const getMyProfile = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.user.id)
      .select('-password')
      .populate('reviews');

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      { $match: { artisan: artisan._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      pending: 0,
      paid: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0
    };

    bookingStats.forEach(stat => {
      stats[stat._id.replace('-', '')] = stat.count;
      stats.total += stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        ...artisan.toObject(),
        bookingStats: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update artisan profile
// @route   PUT /api/artisans/profile
// @access  Private (Artisan)
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      bio,
      skills,
      category,
      yearsOfExperience,
      hourlyRate,
      basePrice,
      location,
      serviceRadius,
      availability
    } = req.body;

    const updateData = {
      firstName,
      lastName,
      phone,
      bio,
      skills,
      category,
      yearsOfExperience,
      hourlyRate,
      basePrice,
      location,
      serviceRadius,
      availability
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle profile image upload
    if (req.cloudinaryUrl) {
      updateData.profileImage = req.cloudinaryUrl;
    }

    const artisan = await Artisan.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: artisan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update artisan portfolio
// @route   PUT /api/artisans/portfolio
// @access  Private (Artisan)
const updatePortfolio = async (req, res) => {
  try {
    const { portfolio } = req.body;

    const artisan = await Artisan.findByIdAndUpdate(
      req.user.id,
      { portfolio },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: artisan.portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add portfolio item
// @route   POST /api/artisans/portfolio
// @access  Private (Artisan)
const addPortfolioItem = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.cloudinaryUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const artisan = await Artisan.findById(req.user.id);

    artisan.portfolio.push({
      image: req.cloudinaryUrl,
      title,
      description
    });

    await artisan.save();

    res.status(201).json({
      success: true,
      data: artisan.portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get artisan bookings
// @route   GET /api/artisans/bookings
// @access  Private (Artisan)
const getMyBookings = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { status } = req.query;

    let query = { artisan: req.user.id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName phone avatar')
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

// @desc    Get artisan earnings
// @route   GET /api/artisans/earnings
// @access  Private (Artisan)
const getEarnings = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.user.id).select('totalEarnings completedJobs');

    // Get monthly earnings
    const monthlyEarnings = await Booking.aggregate([
      {
        $match: {
          artisan: artisan._id,
          status: 'completed',
          isPaymentReleased: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          total: { $sum: '$amountReleasedToArtisan' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Get recent payments
    const recentPayments = await Booking.find({
      artisan: req.user.id,
      status: 'completed',
      isPaymentReleased: true
    })
      .select('bookingNumber amountReleasedToArtisan paymentReleasedAt')
      .sort({ paymentReleasedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: artisan.totalEarnings,
        completedJobs: artisan.completedJobs,
        monthlyEarnings,
        recentPayments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/artisans/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = [
      'Plumbing',
      'Electrical',
      'Carpentry',
      'Painting',
      'Masonry',
      'Cleaning',
      'Gardening',
      'HVAC',
      'Roofing',
      'Tiling',
      'Welding',
      'Auto Repair',
      'Appliance Repair',
      'Interior Design',
      'Photography',
      'Event Planning',
      'Catering',
      'Hair Styling',
      'Makeup',
      'Tailoring',
      'Other'
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getArtisans,
  getArtisan,
  getMyProfile,
  updateProfile,
  updatePortfolio,
  addPortfolioItem,
  getMyBookings,
  getEarnings,
  getCategories
};
