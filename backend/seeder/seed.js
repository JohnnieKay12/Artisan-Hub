const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load models
const { User, Artisan, Admin, Booking, Payment, Review, Settings } = require('../models');

// Connect to DB

mongoose.connect(process.env.MONGODB_URI);

// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// Sample data
const users = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+2348012345678',
    address: {
      street: '123 Main Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria'
    },
    location: {
      type: 'Point',
      coordinates: [3.3792, 6.5244]
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '+2348023456789',
    address: {
      street: '456 Oak Avenue',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria'
    },
    location: {
      type: 'Point',
      coordinates: [7.3986, 9.0765]
    }
  },
  {
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael@example.com',
    password: 'password123',
    phone: '+2348034567890',
    address: {
      street: '789 Pine Road',
      city: 'Port Harcourt',
      state: 'Rivers',
      country: 'Nigeria'
    },
    location: {
      type: 'Point',
      coordinates: [7.0134, 4.8156]
    }
  }
];

const artisans = [
  {
    firstName: 'Emmanuel',
    lastName: 'Adeyemi',
    email: 'emmanuel.plumber@example.com',
    password: 'password123',
    phone: '+2348045678901',
    bio: 'Professional plumber with over 10 years of experience. Specializing in residential and commercial plumbing services.',
    skills: ['Pipe Fitting', 'Leak Repair', 'Drain Cleaning', 'Water Heater Installation'],
    category: 'Plumbing',
    yearsOfExperience: 10,
    hourlyRate: 5000,
    basePrice: 2000,
    location: {
      type: 'Point',
      coordinates: [3.3892, 6.5344],
      address: '15 Allen Avenue',
      city: 'Ikeja',
      state: 'Lagos'
    },
    serviceRadius: 15,
    availability: {
      monday: { open: '08:00', close: '18:00', isAvailable: true },
      tuesday: { open: '08:00', close: '18:00', isAvailable: true },
      wednesday: { open: '08:00', close: '18:00', isAvailable: true },
      thursday: { open: '08:00', close: '18:00', isAvailable: true },
      friday: { open: '08:00', close: '18:00', isAvailable: true },
      saturday: { open: '09:00', close: '16:00', isAvailable: true },
      sunday: { open: '00:00', close: '00:00', isAvailable: false }
    },
    rating: 4.8,
    reviewCount: 45,
    completedJobs: 120,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Chioma',
    lastName: 'Okafor',
    email: 'chioma.electrical@example.com',
    password: 'password123',
    phone: '+2348056789012',
    bio: 'Licensed electrician providing safe and reliable electrical services for homes and businesses.',
    skills: ['Wiring', 'Electrical Repair', 'Lighting Installation', 'Circuit Breaker'],
    category: 'Electrical',
    yearsOfExperience: 8,
    hourlyRate: 4500,
    basePrice: 2500,
    location: {
      type: 'Point',
      coordinates: [3.3592, 6.5144],
      address: '22 Adeniyi Jones',
      city: 'Ikeja',
      state: 'Lagos'
    },
    serviceRadius: 20,
    availability: {
      monday: { open: '07:00', close: '19:00', isAvailable: true },
      tuesday: { open: '07:00', close: '19:00', isAvailable: true },
      wednesday: { open: '07:00', close: '19:00', isAvailable: true },
      thursday: { open: '07:00', close: '19:00', isAvailable: true },
      friday: { open: '07:00', close: '19:00', isAvailable: true },
      saturday: { open: '08:00', close: '17:00', isAvailable: true },
      sunday: { open: '00:00', close: '00:00', isAvailable: false }
    },
    rating: 4.9,
    reviewCount: 38,
    completedJobs: 95,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Ibrahim',
    lastName: 'Mohammed',
    email: 'ibrahim.carpentry@example.com',
    password: 'password123',
    phone: '+2348067890123',
    bio: 'Master carpenter crafting beautiful furniture and providing quality carpentry services.',
    skills: ['Furniture Making', 'Cabinet Installation', 'Wood Repair', 'Custom Carpentry'],
    category: 'Carpentry',
    yearsOfExperience: 15,
    hourlyRate: 6000,
    basePrice: 3000,
    location: {
      type: 'Point',
      coordinates: [7.4086, 9.0865],
      address: '10 Wuse Zone 4',
      city: 'Abuja',
      state: 'FCT'
    },
    serviceRadius: 25,
    availability: {
      monday: { open: '08:00', close: '17:00', isAvailable: true },
      tuesday: { open: '08:00', close: '17:00', isAvailable: true },
      wednesday: { open: '08:00', close: '17:00', isAvailable: true },
      thursday: { open: '08:00', close: '17:00', isAvailable: true },
      friday: { open: '08:00', close: '17:00', isAvailable: true },
      saturday: { open: '09:00', close: '15:00', isAvailable: true },
      sunday: { open: '00:00', close: '00:00', isAvailable: false }
    },
    rating: 4.7,
    reviewCount: 52,
    completedJobs: 150,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Amina',
    lastName: 'Bello',
    email: 'amina.painting@example.com',
    password: 'password123',
    phone: '+2348078901234',
    bio: 'Professional painter delivering high-quality interior and exterior painting services.',
    skills: ['Interior Painting', 'Exterior Painting', 'Wallpaper Installation', 'Texture Painting'],
    category: 'Painting',
    yearsOfExperience: 6,
    hourlyRate: 4000,
    basePrice: 5000,
    location: {
      type: 'Point',
      coordinates: [3.3692, 6.5044],
      address: '5 Victoria Island',
      city: 'Lagos',
      state: 'Lagos'
    },
    serviceRadius: 18,
    availability: {
      monday: { open: '08:00', close: '18:00', isAvailable: true },
      tuesday: { open: '08:00', close: '18:00', isAvailable: true },
      wednesday: { open: '08:00', close: '18:00', isAvailable: true },
      thursday: { open: '08:00', close: '18:00', isAvailable: true },
      friday: { open: '08:00', close: '18:00', isAvailable: true },
      saturday: { open: '09:00', close: '16:00', isAvailable: true },
      sunday: { open: '00:00', close: '00:00', isAvailable: false }
    },
    rating: 4.6,
    reviewCount: 28,
    completedJobs: 70,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Oluwaseun',
    lastName: 'Adeleke',
    email: 'seun.cleaning@example.com',
    password: 'password123',
    phone: '+2348089012345',
    bio: 'Reliable and thorough cleaning services for homes and offices. Your satisfaction is guaranteed.',
    skills: ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Move-in/Move-out Cleaning'],
    category: 'Cleaning',
    yearsOfExperience: 5,
    hourlyRate: 2500,
    basePrice: 5000,
    location: {
      type: 'Point',
      coordinates: [7.0234, 4.8256],
      address: '25 Trans Amadi',
      city: 'Port Harcourt',
      state: 'Rivers'
    },
    serviceRadius: 12,
    availability: {
      monday: { open: '07:00', close: '18:00', isAvailable: true },
      tuesday: { open: '07:00', close: '18:00', isAvailable: true },
      wednesday: { open: '07:00', close: '18:00', isAvailable: true },
      thursday: { open: '07:00', close: '18:00', isAvailable: true },
      friday: { open: '07:00', close: '18:00', isAvailable: true },
      saturday: { open: '08:00', close: '17:00', isAvailable: true },
      sunday: { open: '10:00', close: '16:00', isAvailable: true }
    },
    rating: 4.5,
    reviewCount: 35,
    completedJobs: 85,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Fatima',
    lastName: 'Yusuf',
    email: 'fatima.hair@example.com',
    password: 'password123',
    phone: '+2348090123456',
    bio: 'Talented hairstylist specializing in braids, weaves, and natural hair care.',
    skills: ['Braiding', 'Weaving', 'Natural Hair', 'Hair Treatment', 'Wig Installation'],
    category: 'Hair Styling',
    yearsOfExperience: 7,
    hourlyRate: 3500,
    basePrice: 4000,
    location: {
      type: 'Point',
      coordinates: [3.3992, 6.5444],
      address: '12 Surulere',
      city: 'Lagos',
      state: 'Lagos'
    },
    serviceRadius: 10,
    availability: {
      monday: { open: '09:00', close: '19:00', isAvailable: true },
      tuesday: { open: '09:00', close: '19:00', isAvailable: true },
      wednesday: { open: '09:00', close: '19:00', isAvailable: true },
      thursday: { open: '09:00', close: '19:00', isAvailable: true },
      friday: { open: '09:00', close: '19:00', isAvailable: true },
      saturday: { open: '09:00', close: '18:00', isAvailable: true },
      sunday: { open: '12:00', close: '17:00', isAvailable: true }
    },
    rating: 4.9,
    reviewCount: 62,
    completedJobs: 200,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Abdul',
    lastName: 'Rahman',
    email: 'abdul.hvac@example.com',
    password: 'password123',
    phone: '+2348101234567',
    bio: 'HVAC specialist with expertise in air conditioning installation, repair, and maintenance.',
    skills: ['AC Installation', 'AC Repair', 'HVAC Maintenance', 'Duct Cleaning'],
    category: 'HVAC',
    yearsOfExperience: 12,
    hourlyRate: 5500,
    basePrice: 4000,
    location: {
      type: 'Point',
      coordinates: [7.3886, 9.0665],
      address: '8 Garki',
      city: 'Abuja',
      state: 'FCT'
    },
    serviceRadius: 30,
    availability: {
      monday: { open: '08:00', close: '18:00', isAvailable: true },
      tuesday: { open: '08:00', close: '18:00', isAvailable: true },
      wednesday: { open: '08:00', close: '18:00', isAvailable: true },
      thursday: { open: '08:00', close: '18:00', isAvailable: true },
      friday: { open: '08:00', close: '18:00', isAvailable: true },
      saturday: { open: '09:00', close: '16:00', isAvailable: true },
      sunday: { open: '00:00', close: '00:00', isAvailable: false }
    },
    rating: 4.7,
    reviewCount: 41,
    completedJobs: 110,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Ngozi',
    lastName: 'Eze',
    email: 'ngozi.makeup@example.com',
    password: 'password123',
    phone: '+2348112345678',
    bio: 'Professional makeup artist for weddings, events, and special occasions.',
    skills: ['Bridal Makeup', 'Event Makeup', 'Special Effects', 'Makeup Lessons'],
    category: 'Makeup',
    yearsOfExperience: 9,
    hourlyRate: 8000,
    basePrice: 10000,
    location: {
      type: 'Point',
      coordinates: [3.3492, 6.4944],
      address: '18 Lekki Phase 1',
      city: 'Lagos',
      state: 'Lagos'
    },
    serviceRadius: 20,
    availability: {
      monday: { open: '08:00', close: '20:00', isAvailable: true },
      tuesday: { open: '08:00', close: '20:00', isAvailable: true },
      wednesday: { open: '08:00', close: '20:00', isAvailable: true },
      thursday: { open: '08:00', close: '20:00', isAvailable: true },
      friday: { open: '08:00', close: '20:00', isAvailable: true },
      saturday: { open: '07:00', close: '21:00', isAvailable: true },
      sunday: { open: '10:00', close: '18:00', isAvailable: true }
    },
    rating: 4.8,
    reviewCount: 55,
    completedJobs: 140,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Kunle',
    lastName: 'Ajayi',
    email: 'kunle.tiling@example.com',
    password: 'password123',
    phone: '+2348123456789',
    bio: 'Expert tiler providing quality tile installation for floors and walls.',
    skills: ['Floor Tiling', 'Wall Tiling', 'Tile Repair', 'Grouting'],
    category: 'Tiling',
    yearsOfExperience: 11,
    hourlyRate: 4500,
    basePrice: 8000,
    location: {
      type: 'Point',
      coordinates: [7.0334, 4.8356],
      address: '30 Rumuola',
      city: 'Port Harcourt',
      state: 'Rivers'
    },
    serviceRadius: 15,
    availability: {
      monday: { open: '07:00', close: '17:00', isAvailable: true },
      tuesday: { open: '07:00', close: '17:00', isAvailable: true },
      wednesday: { open: '07:00', close: '17:00', isAvailable: true },
      thursday: { open: '07:00', close: '17:00', isAvailable: true },
      friday: { open: '07:00', close: '17:00', isAvailable: true },
      saturday: { open: '08:00', close: '16:00', isAvailable: true },
      sunday: { open: '00:00', close: '00:00', isAvailable: false }
    },
    rating: 4.6,
    reviewCount: 33,
    completedJobs: 80,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Zainab',
    lastName: 'Ibrahim',
    email: 'zainab.catering@example.com',
    password: 'password123',
    phone: '+2348134567890',
    bio: 'Professional caterer offering delicious meals for events of all sizes.',
    skills: ['Event Catering', 'Wedding Catering', 'Corporate Catering', 'Meal Prep'],
    category: 'Catering',
    yearsOfExperience: 8,
    hourlyRate: 5000,
    basePrice: 50000,
    location: {
      type: 'Point',
      coordinates: [7.4186, 9.0965],
      address: '25 Maitama',
      city: 'Abuja',
      state: 'FCT'
    },
    serviceRadius: 35,
    availability: {
      monday: { open: '06:00', close: '22:00', isAvailable: true },
      tuesday: { open: '06:00', close: '22:00', isAvailable: true },
      wednesday: { open: '06:00', close: '22:00', isAvailable: true },
      thursday: { open: '06:00', close: '22:00', isAvailable: true },
      friday: { open: '06:00', close: '22:00', isAvailable: true },
      saturday: { open: '06:00', close: '23:00', isAvailable: true },
      sunday: { open: '08:00', close: '20:00', isAvailable: true }
    },
    rating: 4.9,
    reviewCount: 48,
    completedJobs: 95,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Tunde',
    lastName: 'Olawale',
    email: 'tunde.photography@example.com',
    password: 'password123',
    phone: '+2348145678901',
    bio: 'Creative photographer capturing beautiful moments at weddings, events, and portrait sessions.',
    skills: ['Wedding Photography', 'Event Photography', 'Portrait Photography', 'Photo Editing'],
    category: 'Photography',
    yearsOfExperience: 6,
    hourlyRate: 10000,
    basePrice: 50000,
    location: {
      type: 'Point',
      coordinates: [3.3392, 6.4844],
      address: '45 Yaba',
      city: 'Lagos',
      state: 'Lagos'
    },
    serviceRadius: 50,
    availability: {
      monday: { open: '08:00', close: '20:00', isAvailable: true },
      tuesday: { open: '08:00', close: '20:00', isAvailable: true },
      wednesday: { open: '08:00', close: '20:00', isAvailable: true },
      thursday: { open: '08:00', close: '20:00', isAvailable: true },
      friday: { open: '08:00', close: '20:00', isAvailable: true },
      saturday: { open: '07:00', close: '22:00', isAvailable: true },
      sunday: { open: '10:00', close: '20:00', isAvailable: true }
    },
    rating: 4.8,
    reviewCount: 42,
    completedJobs: 75,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop'
  },
  {
    firstName: 'Blessing',
    lastName: 'Okonkwo',
    email: 'blessing.tailoring@example.com',
    password: 'password123',
    phone: '+2348156789012',
    bio: 'Skilled tailor creating custom clothing, alterations, and repairs with attention to detail.',
    skills: ['Custom Clothing', 'Alterations', 'Repairs', 'Traditional Wear', 'Western Wear'],
    category: 'Tailoring',
    yearsOfExperience: 14,
    hourlyRate: 3500,
    basePrice: 3000,
    location: {
      type: 'Point',
      coordinates: [7.0434, 4.8456],
      address: '12 Aba Road',
      city: 'Port Harcourt',
      state: 'Rivers'
    },
    serviceRadius: 10,
    availability: {
      monday: { open: '08:00', close: '18:00', isAvailable: true },
      tuesday: { open: '08:00', close: '18:00', isAvailable: true },
      wednesday: { open: '08:00', close: '18:00', isAvailable: true },
      thursday: { open: '08:00', close: '18:00', isAvailable: true },
      friday: { open: '08:00', close: '18:00', isAvailable: true },
      saturday: { open: '09:00', close: '16:00', isAvailable: true },
      sunday: { open: '00:00', close: '00:00', isAvailable: false }
    },
    rating: 4.7,
    reviewCount: 56,
    completedJobs: 180,
    isApproved: true,
    isVerified: true,
    profileImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop'
  }
];

const admins = [
  {
    name: 'Super Admin',
    email: 'admin@artisanmarket.com',
    password: 'admin123',
    role: 'superadmin',
    permissions: [
      'manage_users',
      'manage_artisans',
      'manage_bookings',
      'manage_payments',
      'manage_reviews',
      'view_analytics',
      'manage_admins',
      'manage_settings'
    ]
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Artisan.deleteMany();
    await Admin.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Settings.deleteMany();

    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`.green.inverse);

    // Create artisans
    const createdArtisans = await Artisan.create(artisans);
    console.log(`${createdArtisans.length} artisans created`.green.inverse);

    // Create admins
    const createdAdmins = await Admin.create(admins);
    console.log(`${createdAdmins.length} admins created`.green.inverse);

    // Create default settings
    await Settings.create({
      key: 'commissionPercentage',
      value: 10,
      description: 'Platform commission percentage on each booking'
    });
    console.log('Default settings created'.green.inverse);

    console.log('Data imported successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Artisan.deleteMany();
    await Admin.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Settings.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Run script based on command line argument
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
