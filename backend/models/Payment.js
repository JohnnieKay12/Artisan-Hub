const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    default: 0
  },
  artisanAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'refunded', 'released'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'ussd', 'qr', 'mobile_money', 'bank', 'cash'],
    default: 'card'
  },
  paystackReference: {
    type: String
  },
  paystackTransactionId: {
    type: String
  },
  authorizationUrl: {
    type: String
  },
  accessCode: {
    type: String
  },
  paidAt: {
    type: Date
  },
  releasedAt: {
    type: Date
  },
  releasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying payments
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ artisan: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ reference: 1 });

// Generate reference before saving
PaymentSchema.pre('save', async function(next) {
  if (!this.reference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.reference = `PAY${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
