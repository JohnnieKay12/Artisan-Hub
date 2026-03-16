'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaCreditCard, 
  FaLock, 
  FaCheckCircle, 
  FaShieldAlt,
  FaArrowLeft
} from 'react-icons/fa';
import { PaystackButton } from 'react-paystack';
import { bookingService, paymentService } from '@/services';
import { Booking } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const bookingId = searchParams.get('booking');
  const paymentRef = searchParams.get('reference');
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
  console.log("PAYSTACK KEY:", process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
    
    // Handle payment verification from redirect
    if (paymentRef) {
      verifyPayment(paymentRef);
    }
  }, [bookingId, paymentRef]);

  const loadBooking = async () => {
    try {
      const response = await bookingService.getBooking(bookingId as string);
      if (response.success) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Failed to load booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    setVerifying(true);
    try {
      const response = await paymentService.verifyPayment(reference);
      if (response.success) {
        toast.success('Payment successful! Redirecting...');
      
        setTimeout(() => {
          router.push('/dashboard/user?tab=bookings');
        }, 1500);
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      toast.error('Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  const initializePayment = async () => {
    try {
      const response = await paymentService.initializePayment(bookingId as string);
      if (response.success) {
        // Redirect to Paystack
        window.location.href = response.data.authorizationUrl;
      }
    } catch (error) {
      toast.error('Failed to initialize payment');
    }
  };

  // Paystack config
  const paystackConfig = {
    // reference: booking?.paymentReference,
    reference: booking?.bookingNumber + '_' + new Date().getTime(),
    email: user?.email || '',
    amount: (booking?.pricing?.totalAmount || 0) * 100, // Convert to kobo
    publicKey,
    text: 'Pay Now',
    onSuccess: (response: any) => {
      const ref = response.reference || response;
    
      console.log("PAYSTACK RESPONSE:", response);
      console.log("REFERENCE:", response.reference);

      const verifyUrl = `http://localhost:5000/api/payments/verify?reference=${response.reference}`;

      console.log("VERIFY URL:", verifyUrl);

      // await fetch(verifyUrl);
    
      verifyPayment(ref);
    },
    onClose: () => {
      toast('Payment window closed', { icon: 'ℹ️' });
    },
  };

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{verifying ? 'Verifying payment...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
          <button
            onClick={() => router.push('/dashboard/user')}
            className="text-primary-600 hover:underline"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  // If already paid
  if (booking.isPaid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. The artisan will be notified.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/user?tab=bookings')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              View My Bookings
            </button>
            <button
              onClick={() => router.push(`/chat?artisan=${booking.artisan.id}`)}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
            >
              Message Artisan
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                  <FaCreditCard className="text-primary-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
                  <p className="text-gray-600">Complete your booking</p>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center bg-green-50 rounded-lg p-4 mb-6">
                <FaShieldAlt className="text-green-500 text-xl mr-3" />
                <div>
                  <p className="font-medium text-green-800">Secure Payment</p>
                  <p className="text-sm text-green-600">
                    Your payment is protected and held securely
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Select Payment Method</h3>
                
                <div className="border-2 border-primary-600 rounded-lg p-4 bg-primary-50">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full border-2 border-primary-600 bg-primary-600 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Pay with Card/Bank</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard, Verve, Bank Transfer</p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-10 h-6 bg-gray-200 rounded" />
                      <div className="w-10 h-6 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              {/* {publicKey ? (
                <PaystackButton
                  {...paystackConfig}
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
                />
              ) : (
                <button
                  onClick={initializePayment}
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <FaLock className="mr-2" />
                  Pay {formatCurrency(booking.pricing.totalAmount)}
                </button>
              )} */}

              <button
                onClick={initializePayment}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                <FaLock className="mr-2" />
                Pay {formatCurrency(booking.pricing.totalAmount)}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                By clicking Pay Now, you agree to our Terms of Service
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Artisan Info */}
              <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                <img
                  src={(booking.artisan as any).profileImage}
                  alt={`${(booking.artisan as any).firstName} ${(booking.artisan as any).lastName}`}
                  className="w-12 h-12 rounded-lg object-cover mr-3"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {(booking.artisan as any).firstName} {(booking.artisan as any).lastName}
                  </p>
                  <p className="text-sm text-gray-600">{(booking.artisan as any).category}</p>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <p className="font-medium text-gray-900">{booking.service}</p>
                <p className="text-sm text-gray-600">{booking.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Time:</span>
                  <span>{booking.scheduledTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span>{booking.duration} hour(s)</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span>{formatCurrency(booking.pricing.hourlyRate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hours</span>
                  <span>x {booking.pricing.hours}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(booking.pricing.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span>{formatCurrency(booking.pricing.platformFee)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-primary-600">
                    {formatCurrency(booking.pricing.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
