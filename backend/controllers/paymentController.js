const { Payment, Booking, Artisan, Settings } = require('../models');
const { initializeTransaction, verifyTransaction, initiateTransfer } = require('../config/paystack');
const { getPaginationOptions, calculateCommission } = require('../utils/helpers');

// @desc    Initialize payment
// @route   POST /api/payments/initialize
// @access  Private (User)
const initializePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Get booking
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.id
    }).populate('artisan', 'firstName lastName email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Booking has already been paid'
      });
    }

    // Check if payment already exists
    let payment = await Payment.findOne({ booking: bookingId });

    if (payment && payment.status === 'pending') {
      // Return existing payment authorization
      return res.status(200).json({
        success: true,
        message: 'Payment already initialized',
        data: {
          authorizationUrl: payment.authorizationUrl,
          reference: payment.paystackReference
        }
      });
    }

    // Get platform commission
    const settings = await Settings.findOne({ key: 'commissionPercentage' });
    const commissionPercentage = settings ? settings.value : 10;

    const { commission, artisanAmount } = calculateCommission(
      booking.pricing.totalAmount,
      commissionPercentage
    );

    // Initialize Paystack transaction
    const callbackUrl = `${process.env.FRONTEND_URL}/payment-success`;
    const paystackResponse = await initializeTransaction(
      req.user.email,
      booking.pricing.totalAmount,
      {
        bookingId: booking._id.toString(),
        userId: req.user.id,
        artisanId: booking.artisan._id.toString()
      },
      callbackUrl
    );

    if (!paystackResponse.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to initialize payment',
        error: paystackResponse.error
      });
    }

    // Create payment record
    payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      artisan: booking.artisan._id,
      amount: booking.pricing.totalAmount,
      platformFee: commission,
      artisanAmount,
      reference: paystackResponse.data.reference,
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      status: 'pending'
    });

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        authorizationUrl: paystackResponse.data.authorization_url,
        reference: payment.paystackReference,
        paystackReference: paystackResponse.data.reference
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify payment
// @route   GET /api/payments/verify
// @access  Public
const verifyPayment = async (req, res) => {
  try {
    const { reference, trxref } = req.query;
    const paymentRef = reference || trxref;

    if (!paymentRef) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    // Find payment by Paystack reference
    const payment = await Payment.findOne({
      reference: reference
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify with Paystack
    const verification = await verifyTransaction(paymentRef);

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: verification.error
      });
    }

    const transactionData = verification.data;

    // Update payment status
    if (transactionData.status === 'success') {
      payment.status = 'success';
      payment.paidAt = new Date(transactionData.paid_at);
      payment.gatewayResponse = transactionData;
      await payment.save();

      // Update booking
      const booking = await Booking.findById(payment.booking);

      if (booking) {
        booking.isPaid = true;
        booking.paidAt = new Date();
        booking.status = 'paid';
        booking.payment = payment._id;
        await booking.save();
      }
      
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          reference: payment.reference,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.paidAt
        }
      });
    } else {
      payment.status = transactionData.status;
      payment.gatewayResponse = transactionData;
      await payment.save();

      res.status(400).json({
        success: false,
        message: `Payment ${transactionData.status}`,
        data: {
          reference: payment.paystackReference,
          status: transactionData.status
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Webhook for Paystack events
// @route   POST /api/payments/webhook
// @access  Public
const paystackWebhook = async (req, res) => {
  try {
    const event = req.body;

    // Verify webhook signature (in production, implement proper verification)
    // const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    //   .update(JSON.stringify(event)).digest('hex');
    // if (hash !== req.headers['x-paystack-signature']) {
    //   return res.status(401).json({ success: false, message: 'Invalid signature' });
    // }

    switch (event.event) {
      case 'charge.success':
        const { reference } = event.data;
        const payment = await Payment.findOne({ paystackReference: reference });
        
        if (payment && payment.status !== 'success') {
          payment.status = 'success';
          payment.paidAt = new Date();
          payment.gatewayResponse = event.data;
          await payment.save();

          // Update booking
          const booking = await Booking.findById(payment.booking);
          booking.isPaid = true;
          booking.paidAt = new Date();
          booking.status = 'paid';
          booking.payment = payment._id;
          await booking.save();
        }
        break;

      case 'transfer.success':
        // Handle successful transfer to artisan
        console.log('Transfer successful:', event.data);
        break;

      case 'transfer.failed':
        // Handle failed transfer
        console.log('Transfer failed:', event.data);
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Release payment to artisan (admin)
// @route   POST /api/payments/:id/release
// @access  Private (Admin)
const releasePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'bookingNumber');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed'
      });
    }

    if (payment.status === 'released') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been released'
      });
    }

    // Get artisan bank details (you would need to store these)
    const artisan = await Artisan.findById(payment.artisan);

    // In production, you would initiate transfer to artisan's bank account
    // const transfer = await initiateTransfer(
    //   payment.artisanAmount,
    //   artisan.transferRecipientCode,
    //   `Payment for booking ${payment.booking.bookingNumber}`
    // );

    // For now, simulate successful release
    payment.status = 'released';
    payment.releasedAt = new Date();
    payment.releasedBy = req.user.id;
    await payment.save();

    // Update booking
    const booking = await Booking.findById(payment.booking);
    booking.isPaymentReleased = true;
    booking.paymentReleasedAt = new Date();
    booking.amountReleasedToArtisan = payment.artisanAmount;
    booking.commissionDeducted = payment.platformFee;
    await booking.save();

    // Update artisan earnings
    artisan.totalEarnings += payment.artisanAmount;
    artisan.completedJobs += 1;
    await artisan.save();

    res.status(200).json({
      success: true,
      message: 'Payment released to artisan successfully',
      data: {
        reference: payment.reference,
        amountReleased: payment.artisanAmount,
        commission: payment.platformFee,
        releasedAt: payment.releasedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
// @access  Private (Admin)
const getPayments = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);
    const { status, user, artisan } = req.query;

    let query = {};
    if (status) query.status = status;
    if (user) query.user = user;
    if (artisan) query.artisan = artisan;

    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email')
      .populate('artisan', 'firstName lastName email category')
      .populate('booking', 'bookingNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    // Calculate totals
    const totals = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPlatformFee: { $sum: '$platformFee' },
          totalArtisanAmount: { $sum: '$artisanAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      totals: totals[0] || { totalAmount: 0, totalPlatformFee: 0, totalArtisanAmount: 0 },
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment statistics (admin)
// @route   GET /api/payments/stats/overview
// @access  Private (Admin)
const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyStats = await Payment.aggregate([
      {
        $match: { status: 'success' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
          platformFee: { $sum: '$platformFee' },
          artisanAmount: { $sum: '$artisanAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPlatformFees = await Payment.aggregate([
      { $match: { status: { $in: ['success', 'released'] } } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown: stats,
        monthlyStats,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalPlatformFees: totalPlatformFees[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user payments
// @route   GET /api/payments/my-payments
// @access  Private (User)
const getMyPayments = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);

    const payments = await Payment.find({ user: req.user.id })
      .populate('artisan', 'firstName lastName profileImage category')
      .populate('booking', 'bookingNumber service status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: payments.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  releasePayment,
  getPayments,
  getPaymentStats,
  getMyPayments
};
