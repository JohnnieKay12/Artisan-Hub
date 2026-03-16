// Generate random string
const generateRandomString = (length = 10) => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

// Format currency
const formatCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in kilometers
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Format date
const formatDate = (date, format = 'long') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-NG');
  }
  
  return d.toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Paginate results
const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < array.length,
      hasPrevPage: startIndex > 0
    }
  };
};

// Generate pagination options for mongoose
const getPaginationOptions = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  return {
    page,
    limit,
    skip
  };
};

// Build search query
const buildSearchQuery = (searchTerm, searchableFields) => {
  if (!searchTerm) return {};
  
  const regex = new RegExp(searchTerm, 'i');
  const orConditions = searchableFields.map(field => ({
    [field]: regex
  }));
  
  return { $or: orConditions };
};

// Calculate platform commission
const calculateCommission = (amount, commissionPercentage) => {
  const commission = (amount * commissionPercentage) / 100;
  const artisanAmount = amount - commission;
  
  return {
    commission: Math.round(commission * 100) / 100,
    artisanAmount: Math.round(artisanAmount * 100) / 100
  };
};

// Validate coordinates
const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

// Generate time slots
const generateTimeSlots = (startHour = 8, endHour = 18, intervalMinutes = 60) => {
  const slots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  
  return slots;
};

// Check if time is within business hours
const isWithinBusinessHours = (time, openTime, closeTime) => {
  const [hours, minutes] = time.split(':').map(Number);
  const [openHours, openMinutes] = openTime.split(':').map(Number);
  const [closeHours, closeMinutes] = closeTime.split(':').map(Number);
  
  const timeValue = hours * 60 + minutes;
  const openValue = openHours * 60 + openMinutes;
  const closeValue = closeHours * 60 + closeMinutes;
  
  return timeValue >= openValue && timeValue < closeValue;
};

// Deep clone object
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Remove undefined/null values from object
const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null && v !== '')
  );
};

module.exports = {
  generateRandomString,
  formatCurrency,
  calculateDistance,
  formatDate,
  formatTime,
  sanitizeInput,
  paginate,
  getPaginationOptions,
  buildSearchQuery,
  calculateCommission,
  isValidCoordinates,
  generateTimeSlots,
  isWithinBusinessHours,
  deepClone,
  cleanObject
};
