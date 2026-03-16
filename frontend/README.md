# Artisan Marketplace Frontend

A modern, responsive Next.js frontend for the Artisan Marketplace platform - a TaskRabbit/Fiverr-like platform connecting customers with skilled artisans.

## Features

### User Features
- Browse artisans by category, location, and rating
- Search and filter artisans
- View artisan profiles with reviews and portfolio
- Book artisans for services
- Make secure payments via Paystack
- Real-time chat with artisans
- Manage bookings and leave reviews
- User dashboard with booking history

### Artisan Features
- Create and manage professional profile
- Add skills, portfolio, and availability
- Receive and manage bookings
- Track earnings and statistics
- Real-time chat with customers
- Artisan dashboard with analytics

### Admin Features
- Dashboard with platform statistics
- Manage users and artisans
- Approve/reject artisan applications
- View bookings and payments
- Configure platform settings
- Commission management

### Technical Features
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Socket.io for real-time chat
- Paystack integration for payments
- Google Maps integration
- Responsive mobile-first design
- Framer Motion animations

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Charts**: Recharts
- **Maps**: Google Maps API
- **Payments**: Paystack
- **Real-time**: Socket.io Client
- **Icons**: React Icons
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ 
- Backend API running (see backend README)
- Paystack account (for payments)
- Google Maps API key (for maps)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd artisan-marketplace-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
artisan-marketplace-frontend/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── providers.tsx      # Context providers
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── artisans/          # Browse artisans
│   ├── booking/           # Booking page
│   ├── payment/           # Payment page
│   ├── chat/              # Real-time chat
│   ├── dashboard/         # Dashboard pages
│   │   ├── user/          # User dashboard
│   │   ├── artisan/       # Artisan dashboard
│   │   └── admin/         # Admin dashboard
│   ├── about/             # About page
│   └── contact/           # Contact page
├── components/            # React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── index.ts
├── contexts/              # React contexts
│   ├── AuthContext.tsx
│   └── SocketContext.tsx
├── services/              # API services
│   ├── api.ts
│   ├── authService.ts
│   ├── artisanService.ts
│   ├── userService.ts
│   ├── bookingService.ts
│   ├── paymentService.ts
│   ├── chatService.ts
│   └── adminService.ts
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utility functions
│   └── helpers.ts
├── public/                # Static assets
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with search and featured artisans |
| Login | `/login` | User authentication |
| Register | `/register` | User/Artisan registration |
| Browse Artisans | `/artisans` | Search and filter artisans |
| Artisan Profile | `/artisans/[id]` | Artisan details with reviews |
| Booking | `/booking` | Create a new booking |
| Payment | `/payment` | Paystack payment integration |
| Chat | `/chat` | Real-time messaging |
| User Dashboard | `/dashboard/user` | User bookings and profile |
| Artisan Dashboard | `/dashboard/artisan` | Artisan bookings and earnings |
| Admin Dashboard | `/dashboard/admin` | Platform management |
| About | `/about` | About the platform |
| Contact | `/contact` | Contact form and info |

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`. All API calls are handled through service files in the `services/` directory.

### Authentication
- JWT tokens stored in cookies
- Automatic token refresh
- Protected routes with middleware

### Real-time Chat
- Socket.io client for WebSocket connection
- Join/leave conversations
- Send/receive messages
- Typing indicators
- Read receipts

### Payment Flow
1. User creates booking
2. Booking details sent to backend
3. Paystack payment initialized
4. User completes payment on Paystack
5. Payment verified and booking confirmed

## Customization

### Colors
Edit `tailwind.config.ts` to customize the color scheme:
```typescript
colors: {
  primary: { ... },
  secondary: { ... },
  accent: { ... },
}
```

### Components
All components use Tailwind CSS classes. Modify the classes to change styling.

## Building for Production

```bash
npm run build
```

The build output will be in the `.next/` directory.

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Other Platforms
Build the application and deploy the `.next/` folder to your hosting platform.

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check `NEXT_PUBLIC_API_URL` is correct
   - Ensure backend is running

2. **Paystack Not Working**
   - Verify `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - Check Paystack dashboard for configuration

3. **Maps Not Loading**
   - Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Enable required Google Maps APIs

4. **Socket.io Connection Issues**
   - Check `NEXT_PUBLIC_SOCKET_URL`
   - Ensure backend Socket.io is configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For support, email support@artisanmarket.com or open an issue on GitHub.
