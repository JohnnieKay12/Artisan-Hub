const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ArtisanSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
    match: [
      /^(\+234|0)[789][01]\d{8}$/,
      'Please provide a valid phone number'
    ]
  },
  profileImage: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1/default-artisan.png'
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot be more than 1000 characters']
  },
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: [
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
    ]
  },
  yearsOfExperience: {
    type: Number,
    default: 0,
    min: [0, 'Years of experience cannot be negative']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Please provide an hourly rate'],
    min: [0, 'Hourly rate cannot be negative']
  },
  basePrice: {
    type: Number,
    default: 0,
    min: [0, 'Base price cannot be negative']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please provide coordinates'],
      // index: '2dsphere'
    },
    address: {
      type: String,
      required: [true, 'Please provide an address']
    },
    city: {
      type: String,
      required: [true, 'Please provide a city']
    },
    state: {
      type: String,
      required: [true, 'Please provide a state']
    }
  },
  serviceRadius: {
    type: Number,
    default: 10,
    min: [1, 'Service radius must be at least 1 km']
  },
  availability: {
    monday: { open: String, close: String, isAvailable: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isAvailable: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isAvailable: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isAvailable: { type: Boolean, default: true } },
    friday: { open: String, close: String, isAvailable: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isAvailable: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isAvailable: { type: Boolean, default: false } }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documents: [{
    type: String,
    description: String
  }],
  portfolio: [{
    image: String,
    title: String,
    description: String
  }],
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

// Index for geospatial queries
ArtisanSchema.index({ 'location.coordinates': '2dsphere' });

// Index for text search
ArtisanSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  bio: 'text',
  skills: 'text',
  category: 'text'
});

// Encrypt password before saving
ArtisanSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
ArtisanSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full name
ArtisanSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for reviews
ArtisanSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'artisan',
  justOne: false
});

// Virtual for bookings
ArtisanSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'artisan',
  justOne: false
});

module.exports = mongoose.model('Artisan', ArtisanSchema);
