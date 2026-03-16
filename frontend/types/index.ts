export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'artisan' | 'admin';
  address?: Address;
  location?: Location;
  isActive: boolean;
  createdAt: string;
}

export interface Artisan {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string;
  bio: string;
  skills: string[];
  category: string;
  yearsOfExperience: number;
  hourlyRate: number;
  basePrice: number;
  location: ArtisanLocation;
  serviceRadius: number;
  availability: Availability;
  rating: number;
  reviewCount: number;
  totalEarnings: number;
  completedJobs: number;
  isApproved: boolean;
  isVerified: boolean;
  portfolio: PortfolioItem[];
  createdAt: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number];
}

export interface ArtisanLocation extends Location {
  address: string;
  city: string;
  state: string;
}

export interface Availability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface DayAvailability {
  open: string;
  close: string;
  isAvailable: boolean;
}

export interface PortfolioItem {
  image: string;
  title?: string;
  description?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  user: User;
  artisan: Artisan;
  service: string;
  description: string;
  status: 'pending' | 'paid' | 'in-progress' | 'completed' | 'cancelled' | 'disputed';
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location: BookingLocation;
  pricing: Pricing;
  payment?: Payment;
  isPaid: boolean;
  paidAt?: string;
  isPaymentReleased: boolean;
  paymentReleasedAt?: string;
  amountReleasedToArtisan: number;
  commissionDeducted: number;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  completedAt?: string;
  reviewLeft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingLocation {
  address: string;
  city?: string;
  state?: string;
  coordinates?: [number, number];
}

export interface Pricing {
  hourlyRate: number;
  hours: number;
  subtotal: number;
  platformFee: number;
  totalAmount: number;
}

export interface Payment {
  id: string;
  reference: string;
  booking: string;
  user: string;
  artisan: string;
  amount: number;
  platformFee: number;
  artisanAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'released';
  paymentMethod: string;
  paystackReference?: string;
  paidAt?: string;
  releasedAt?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  booking: string;
  user: User;
  artisan: string;
  rating: number;
  review: string;
  categories?: ReviewCategories;
  isVerified: boolean;
  isVisible: boolean;
  createdAt: string;
}

export interface ReviewCategories {
  punctuality?: number;
  quality?: number;
  communication?: number;
  professionalism?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: User | Artisan;
  senderModel: 'User' | 'Artisan';
  recipient: string;
  recipientModel: 'User' | 'Artisan';
  message: string;
  messageType: 'text' | 'image' | 'file' | 'location' | 'booking';
  attachments?: Attachment[];
  isRead: boolean;
  readAt?: string;
  relatedBooking?: string;
  createdAt: string;
}

export interface Attachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface Conversation {
  id: string;
  conversationId: string;
  user: User;
  artisan: Artisan;
  lastMessage?: LastMessage;
  unreadCount: UnreadCount;
  isActive: boolean;
  relatedBooking?: string;
  updatedAt: string;
}

export interface LastMessage {
  message: string;
  sender: string;
  senderModel: 'User' | 'Artisan';
  createdAt: string;
}

export interface UnreadCount {
  user: number;
  artisan: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalArtisans: number;
  pendingArtisans: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  revenue: RevenueStats;
}

export interface RevenueStats {
  totalRevenue: number;
  totalPlatformFees: number;
  totalArtisanPayouts: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  artisanCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  pagination?: Pagination;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ArtisanRegisterData extends RegisterData {
  bio: string;
  skills: string[];
  category: string;
  yearsOfExperience: number;
  hourlyRate: number;
  location: ArtisanLocation;
}

export interface BookingData {
  artisan: string;
  service: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  location: BookingLocation;
}
