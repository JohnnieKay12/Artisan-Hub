# Artisan Marketplace Backend

A complete backend API for an artisan marketplace platform similar to TaskRabbit or Fiverr, built with Node.js, Express.js, MongoDB, and Socket.io.

## Features

### Authentication
- User registration and login
- Artisan registration and login
- Admin login
- JWT-based authentication
- Password hashing with bcrypt

### User Features
- Browse artisans by category, location, and rating
- View artisan profiles with reviews
- Book artisans for services
- Make payments via Paystack
- View booking history
- Chat with artisans in real-time
- Leave reviews for completed bookings

### Artisan Features
- Create and manage profile
- Add skills and portfolio
- Set service pricing
- Manage availability
- Accept or decline bookings
- View earnings and statistics
- Chat with users

### Admin Features
- Dashboard with statistics
- Approve/reject artisans
- Manage users and artisans
- View all bookings and payments
- Release payments to artisans
- Set platform commission percentage
- Manage reviews

### Real-time Chat
- Socket.io powered chat system
- One-on-one messaging between users and artisans
- Typing indicators
- Unread message counts
- Message read receipts

### Payment Integration
- Paystack payment gateway
- Secure payment processing
- Payment release to artisans
- Commission tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.io
- **Payment Gateway**: Paystack
- **Image Upload**: Cloudinary
- **Security**: Helmet, express-rate-limit

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Paystack account
- Cloudinary account (for image uploads)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artisan-marketplace-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Copy the `.env.example` file to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/artisan_marketplace

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30

   # Paystack Configuration
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Google Maps API
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Admin Configuration
   ADMIN_EMAIL=admin@artisanmarket.com
   ADMIN_PASSWORD=admin123

   # Platform Configuration
   PLATFORM_COMMISSION_PERCENTAGE=10
   ```

4. **Seed the database** (optional - creates sample data)
   ```bash
   npm run seed
   ```

   To delete all data:
   ```bash
   npm run seed:destroy
   ```

5. **Start the server**

   Development mode:
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login user | Public |
| POST | `/auth/artisan/register` | Register a new artisan | Public |
| POST | `/auth/artisan/login` | Login artisan | Public |
| POST | `/auth/admin/login` | Login admin | Public |
| GET | `/auth/me` | Get current user | Private |
| GET | `/auth/logout` | Logout user | Private |
| PUT | `/auth/update-password` | Update password | Private |

### Artisan Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/artisans` | Get all artisans | Public |
| GET | `/artisans/categories` | Get all categories | Public |
| GET | `/artisans/:id` | Get single artisan | Public |
| GET | `/artisans/profile/me` | Get artisan profile | Artisan |
| PUT | `/artisans/profile` | Update artisan profile | Artisan |
| GET | `/artisans/bookings/my-bookings` | Get artisan bookings | Artisan |
| GET | `/artisans/earnings/my-earnings` | Get artisan earnings | Artisan |
| POST | `/artisans/portfolio` | Add portfolio item | Artisan |
| PUT | `/artisans/portfolio` | Update portfolio | Artisan |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users/profile` | Get user profile | User |
| PUT | `/users/profile` | Update user profile | User |
| DELETE | `/users/profile` | Delete account | User |
| GET | `/users/bookings` | Get user bookings | User |
| GET | `/users/bookings/:id` | Get single booking | User |
| PUT | `/users/bookings/:id/cancel` | Cancel booking | User |
| POST | `/users/reviews` | Create review | User |
| GET | `/users/reviews` | Get user reviews | User |
| GET | `/users/favorites` | Get favorite artisans | User |

### Booking Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/bookings` | Create booking | User |
| GET | `/bookings` | Get all bookings | Admin |
| GET | `/bookings/stats/overview` | Get booking stats | Admin |
| GET | `/bookings/:id` | Get single booking | Private |
| PUT | `/bookings/:id/status` | Update booking status | Artisan |
| PUT | `/bookings/:id/cancel` | Cancel booking | Artisan |

### Payment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/payments/initialize` | Initialize payment | User |
| GET | `/payments/verify` | Verify payment | Public |
| POST | `/payments/webhook` | Paystack webhook | Public |
| GET | `/payments` | Get all payments | Admin |
| GET | `/payments/stats/overview` | Get payment stats | Admin |
| GET | `/payments/my-payments` | Get user payments | User |
| POST | `/payments/:id/release` | Release payment | Admin |

### Chat Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/chat/conversations` | Get/create conversation | Private |
| GET | `/chat/conversations` | Get user conversations | Private |
| GET | `/chat/conversations/:id/messages` | Get messages | Private |
| PUT | `/chat/conversations/:id/read` | Mark as read | Private |
| POST | `/chat/messages` | Send message | Private |
| GET | `/chat/unread-count` | Get unread count | Private |
| DELETE | `/chat/messages/:id` | Delete message | Private |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/dashboard` | Get dashboard stats | Admin |
| POST | `/admin/register` | Register admin | Super Admin |
| GET | `/admin/admins` | Get all admins | Super Admin |
| GET | `/admin/users` | Get all users | Admin |
| PUT | `/admin/users/:id/deactivate` | Deactivate user | Admin |
| GET | `/admin/artisans` | Get all artisans | Admin |
| PUT | `/admin/artisans/:id/approve` | Approve artisan | Admin |
| PUT | `/admin/artisans/:id/reject` | Reject artisan | Admin |
| PUT | `/admin/artisans/:id/deactivate` | Deactivate artisan | Admin |
| GET | `/admin/settings` | Get settings | Admin |
| PUT | `/admin/settings` | Update settings | Admin |
| GET | `/admin/reviews` | Get all reviews | Admin |
| PUT | `/admin/reviews/:id/visibility` | Toggle review visibility | Admin |

## Query Parameters

### Artisan Search
- `search` - Search by name, bio, skills, category
- `category` - Filter by category
- `minRating` - Minimum rating (0-5)
- `maxPrice` - Maximum hourly rate
- `lat` & `lng` - Location coordinates
- `radius` - Search radius in km (default: 10)
- `sortBy` - Sort option: `rating`, `price_low`, `price_high`, `experience`, `newest`
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Example Request
```bash
curl "http://localhost:5000/api/artisans?category=Plumbing&minRating=4&sortBy=rating&page=1&limit=10"
```

## WebSocket Events

### Client to Server
- `join_conversation` - Join a chat room
- `leave_conversation` - Leave a chat room
- `typing` - Send typing indicator
- `stop_typing` - Stop typing indicator
- `send_message` - Send a message
- `mark_as_read` - Mark messages as read

### Server to Client
- `new_message` - New message received
- `new_notification` - New notification
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `messages_read` - Messages marked as read

## Sample Data

The seeder creates:
- 3 sample users
- 12 sample artisans across various categories
- 1 super admin account

### Default Admin Credentials
- Email: `admin@artisanmarket.com`
- Password: `admin123`

### Sample User Credentials
- Email: `john@example.com`
- Password: `password123`

### Sample Artisan Credentials
- Email: `emmanuel.plumber@example.com`
- Password: `password123`

## Folder Structure

```
artisan-marketplace-backend/
├── config/
│   ├── cloudinary.js      # Cloudinary configuration
│   ├── database.js        # MongoDB connection
│   ├── jwt.js             # JWT utilities
│   └── paystack.js        # Paystack integration
├── controllers/
│   ├── authController.js
│   ├── artisanController.js
│   ├── userController.js
│   ├── bookingController.js
│   ├── paymentController.js
│   ├── chatController.js
│   └── adminController.js
├── middlewares/
│   ├── auth.js            # Authentication middleware
│   ├── errorHandler.js    # Error handling
│   ├── upload.js          # File upload middleware
│   └── validation.js      # Input validation
├── models/
│   ├── User.js
│   ├── Artisan.js
│   ├── Admin.js
│   ├── Booking.js
│   ├── Payment.js
│   ├── ChatMessage.js
│   ├── Conversation.js
│   ├── Review.js
│   └── Settings.js
├── routes/
│   ├── auth.js
│   ├── artisans.js
│   ├── users.js
│   ├── bookings.js
│   ├── payments.js
│   ├── chat.js
│   └── admin.js
├── socket/
│   └── chatSocket.js      # Socket.io chat handler
├── utils/
│   ├── helpers.js         # Utility functions
│   └── email.js           # Email utilities
├── seeder/
│   └── seed.js            # Database seeder
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    { "field": "email", "message": "Email already exists" }
  ]
}
```

## Security Features

- Helmet.js for security headers
- Rate limiting to prevent abuse
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration

## License

MIT

## Support

For support, email support@artisanmarket.com or open an issue on GitHub.
