const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
    // required: true
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
  service: {
    type: String,
    required: [true, 'Please provide service details']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'in-progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please provide a scheduled date']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Please provide a scheduled time']
  },
  duration: {
    type: Number,
    default: 1,
    min: [0.5, 'Duration must be at least 30 minutes']
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  pricing: {
    hourlyRate: {
      type: Number,
      required: true
    },
    hours: {
      type: Number,
      default: 1
    },
    subtotal: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  isPaymentReleased: {
    type: Boolean,
    default: false
  },
  paymentReleasedAt: {
    type: Date
  },
  amountReleasedToArtisan: {
    type: Number,
    default: 0
  },
  commissionDeducted: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  cancellationReason: {
    type: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'cancelledByModel'
  },
  cancelledByModel: {
    type: String,
    enum: ['User', 'Artisan', 'Admin']
  },
  cancelledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  reviewLeft: {
    type: Boolean,
    default: false
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for querying bookings by user or artisan
BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ artisan: 1, createdAt: -1 });
BookingSchema.index({ status: 1 });

// Generate booking number before saving
BookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    this.bookingNumber = `BK-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
