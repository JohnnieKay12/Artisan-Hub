'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaStar, 
  FaHeart, 
  FaUser, 
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaTools
} from 'react-icons/fa';
import { userService } from '@/services';
import { Booking, Review, User } from '@/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';

export default function UserDashboard() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'bookings';
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const response = await userService.getMyBookings();
        if (response.success) {
          setBookings(response.data);
        }
      } else if (activeTab === 'reviews') {
        const response = await userService.getMyReviews();
        if (response.success) {
          setReviews(response.data);
        }
      } else if (activeTab === 'favorites') {
        const response = await userService.getFavoriteArtisans();
        if (response.success) {
          setFavorites(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      case 'pending':
        return <FaHourglassHalf className="text-yellow-500" />;
      case 'paid':
        return <FaDollarSign className="text-blue-500" />;
      case 'in-progress':
        return <FaTools className="text-purple-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: FaCalendarAlt },
    { id: 'reviews', label: 'My Reviews', icon: FaStar },
    { id: 'favorites', label: 'Favorites', icon: FaHeart },
    { id: 'profile', label: 'Profile', icon: FaUser },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-primary-100 rounded-xl flex items-center justify-center mr-6">
              {(user as any)?.avatar ? (
                <img
                  src={(user as any).avatar}
                  alt="Profile"
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <FaUser className="text-primary-600 text-3xl" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600">Manage your bookings and account</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
              <nav className="flex flex-col">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {activeTab === 'bookings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">My Bookings</h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <FaCalendarAlt className="text-gray-300 text-5xl mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No bookings yet</p>
                      <Link
                        href="/artisans"
                        className="text-primary-600 hover:underline font-medium"
                      >
                        Browse artisans
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <img
                                src={(booking.artisan as any).profileImage}
                                alt={`${(booking.artisan as any).firstName} ${(booking.artisan as any).lastName}`}
                                className="w-16 h-16 rounded-lg object-cover mr-4"
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                                <p className="text-sm text-gray-600">
                                  {(booking.artisan as any).firstName} {(booking.artisan as any).lastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                                </p>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(booking.status)}`}>
                                  {getStatusIcon(booking.status)}
                                  <span className="ml-1">{getStatusLabel(booking.status)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary-600">
                                {formatCurrency(booking.pricing.totalAmount)}
                              </p>
                              <Link
                                href={`/bookings/${booking.id}`}
                                className="text-sm text-primary-600 hover:underline mt-2 inline-block"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">My Reviews</h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <FaStar className="text-gray-300 text-5xl mx-auto mb-4" />
                      <p className="text-gray-500">No reviews yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border border-gray-200 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <img
                                src={(review.artisan as any).profileImage}
                                alt={(review.artisan as any).firstName}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {(review.artisan as any).firstName} {(review.artisan as any).lastName}
                                </p>
                                <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                              <FaStar className="text-yellow-400 mr-1" />
                              <span className="font-medium">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-600">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'favorites' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Favorite Artisans</h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <FaHeart className="text-gray-300 text-5xl mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No favorites yet</p>
                      <Link
                        href="/artisans"
                        className="text-primary-600 hover:underline font-medium"
                      >
                        Browse artisans
                      </Link>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {favorites.map((artisan) => (
                        <Link
                          key={artisan.id}
                          href={`/artisans/${artisan.id}`}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center">
                            <img
                              src={artisan.profileImage}
                              alt={`${artisan.firstName} ${artisan.lastName}`}
                              className="w-16 h-16 rounded-lg object-cover mr-4"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {artisan.firstName} {artisan.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">{artisan.category}</p>
                              <div className="flex items-center mt-1">
                                <FaStar className="text-yellow-400 text-sm mr-1" />
                                <span className="text-sm">{artisan.rating}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.firstName}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.lastName}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        defaultValue={user?.phone}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
