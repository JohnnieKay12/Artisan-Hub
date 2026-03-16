# Artisan Marketplace API Guide

## Quick Start

### 1. Start the Server
```bash
npm install
npm run seed    # Optional: Add sample data
npm run dev
```

### 2. Test the API

#### Health Check
```bash
curl http://localhost:5000/health
```

#### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+2348012345678"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Get All Artisans
```bash
curl http://localhost:5000/api/artisans
```

#### Get Artisans by Category
```bash
curl "http://localhost:5000/api/artisans?category=Plumbing"
```

#### Search Artisans
```bash
curl "http://localhost:5000/api/artisans?search=plumber&minRating=4"
```

## Sample Data Credentials

### Admin
- Email: `admin@artisanmarket.com`
- Password: `admin123`

### Users
- Email: `john@example.com`
- Password: `password123`

### Artisans
- Email: `emmanuel.plumber@example.com`
- Password: `password123`

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Email already exists" }
  ]
}
```

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

Or use cookies (automatically set on login).

## Booking Flow

1. **User browses artisans** → `GET /api/artisans`
2. **User creates booking** → `POST /api/bookings`
3. **User initializes payment** → `POST /api/payments/initialize`
4. **User completes payment** → Redirect to Paystack
5. **Payment verification** → `GET /api/payments/verify?reference=xxx`
6. **Artisan starts work** → `PUT /api/bookings/:id/status` (in-progress)
7. **Artisan completes work** → `PUT /api/bookings/:id/status` (completed)
8. **Admin releases payment** → `POST /api/payments/:id/release`

## Chat Flow (WebSocket)

1. Connect to Socket.io with auth token
2. Join conversation: `join_conversation` event
3. Send message: `send_message` event
4. Receive message: `new_message` event
5. Mark as read: `mark_as_read` event

## Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Artisan Filters
- `search` - Text search
- `category` - Filter by category
- `minRating` - Minimum rating
- `maxPrice` - Maximum price
- `lat` / `lng` - Location coordinates
- `radius` - Search radius in km
- `sortBy` - Sort: `rating`, `price_low`, `price_high`, `experience`, `newest`

### Status Filters
- `status` - Filter by status: `pending`, `paid`, `in-progress`, `completed`, `cancelled`
