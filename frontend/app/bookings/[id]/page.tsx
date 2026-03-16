'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { userService } from '@/services';
import { formatCurrency, formatDate } from '@/utils/helpers';

export default function BookingDetailsPage() {
  const params = useParams();
  const id = params.id as string | string[];

  const bookingId = Array.isArray(id) ? id[0] : id

  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    loadBooking();
  }, []);

  const loadBooking = async () => {
    const response = await userService.getBooking(bookingId);

    if (response.success) {
      setBooking(response.data);
    }
  };

  if (!booking) {
    return (
      <div className="p-10 text-center">
        Loading booking details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6">Booking Details</h1>

      <div className="bg-white shadow rounded-xl p-6 space-y-4">
        <p><strong>Service:</strong> {booking.service}</p>

        <img 
          src={booking.artisan.profileImage}
          alt={booking.artisan.firstName}
          className="w-16 h-16 rounded-full object-cover"
        />

        <p>
          <strong>Artisan:</strong>{" "}
          {booking.artisan.firstName} {booking.artisan.lastName}
        </p>

        <p>
          <strong>Date:</strong>{" "}
          {formatDate(booking.scheduledDate)}
        </p>

        <p>
          <strong>Time:</strong> {booking.scheduledTime}
        </p>

        <p>
          <strong>Status:</strong> {booking.status}
        </p>

        <p>
          <strong>Total:</strong>{" "}
          {formatCurrency(booking.pricing.totalAmount)}
        </p>
      </div>
    </div>
  );
}