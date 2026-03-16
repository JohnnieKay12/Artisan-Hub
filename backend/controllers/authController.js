const { User, Artisan, Admin } = require('../models');
const { sendTokenResponse } = require('../config/jwt');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address
    });

    sendTokenResponse(user, 201, res, 'user');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    sendTokenResponse(user, 200, res, 'user');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register artisan
// @route   POST /api/auth/artisan/register
// @access  Public
const registerArtisan = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
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

    // Check if artisan already exists
    const existingArtisan = await Artisan.findOne({ email });
    if (existingArtisan) {
      return res.status(400).json({
        success: false,
        message: 'Artisan with this email already exists'
      });
    }

    // Create artisan
    const artisan = await Artisan.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      bio,
      skills,
      category,
      yearsOfExperience,
      hourlyRate,
      basePrice,
      location,
      serviceRadius,
      availability,
      isApproved: false // Requires admin approval
    });

    sendTokenResponse(artisan, 201, res, 'artisan');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login artisan
// @route   POST /api/auth/artisan/login
// @access  Public
const loginArtisan = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for artisan
    const artisan = await Artisan.findOne({ email }).select('+password');
    if (!artisan) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await artisan.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!artisan.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    if (!artisan.isApproved) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval. Please wait for admin verification.'
      });
    }

    sendTokenResponse(artisan, 200, res, 'artisan');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    sendTokenResponse(admin, 200, res, admin.role);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    let user;
    
    if (req.userType === 'artisan') {
      user = await Artisan.findById(req.user.id);
    } else if (req.userType === 'admin' || req.userType === 'superadmin') {
      user = await Admin.findById(req.user.id);
    } else {
      user = await User.findById(req.user.id);
    }

    res.status(200).json({
      success: true,
      data: user,
      userType: req.userType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    let user;
    if (req.userType === 'artisan') {
      user = await Artisan.findById(req.user.id).select('+password');
    } else if (req.userType === 'admin' || req.userType === 'superadmin') {
      user = await Admin.findById(req.user.id).select('+password');
    } else {
      user = await User.findById(req.user.id).select('+password');
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, req.userType);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerArtisan,
  loginArtisan,
  adminLogin,
  getMe,
  logout,
  updatePassword
};
