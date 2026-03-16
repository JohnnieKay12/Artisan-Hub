'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaDollarSign, 
  FaStar, 
  FaUser, 
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaTools,
  FaWallet,
  FaChartLine
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { artisanService } from '@/services';
import { Booking } from '@/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview' || activeTab === 'bookings') {
        const [bookingsRes, profileRes] = await Promise.all([
          artisanService.getMyBookings(),
          artisanService.getMyProfile(),
        ]);
        if (bookingsRes.success) {
          setBookings(bookingsRes.data);
        }
        if (profileRes.success) {
          setProfile(profileRes.data);
        }
      } else if (activeTab === 'earnings') {
        const response = await artisanService.getMyEarnings();
        if (response.success) {
          setEarnings(response.data);
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
        return <FaHourglassHalf className="text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'bookings', label: 'Bookings', icon: FaCalendarAlt },
    { id: 'earnings', label: 'Earnings', icon: FaWallet },
    { id: 'profile', label: 'Profile', icon: FaUser },
  ];

  const pendingBookings = bookings.filter(b => b.status === 'paid');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-sm p-6 mb-6 text-white">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center mr-6">
              {(user as any)?.profileImage ? (
                <img
                  src={(user as any).profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <FaUser className="text-white text-3xl" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-primary-100">Manage your business and bookings</p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-primary-100">Total Earnings</p>
              <p className="text-3xl font-bold">
                {formatCurrency((user as any)?.totalEarnings || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{(user as any)?.completedJobs || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaBriefcase className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{(user as any)?.rating || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaStar className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaHourglassHalf className="text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{(user as any)?.reviewCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-green-600" />
              </div>
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
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
                  
                  {/* Recent Bookings */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View All
                      </button>
                    </div>
                    
                    {bookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-xl p-4 mb-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{booking.service}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                            </p>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {bookings.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No bookings yet</p>
                    )}
                  </div>
                </motion.div>
              )}

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
                      <p className="text-gray-500">No bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="border border-gray-200 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{booking.service}</h3>
                              <p className="text-sm text-gray-600">
                                {(booking.user as any).firstName} {(booking.user as any).lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                              </p>
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                <span className="ml-1">{getStatusLabel(booking.status)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary-600">
                                {formatCurrency(booking.pricing.totalAmount)}
                              </p>
                              {booking.status === 'paid' && (
                                <button className="text-sm text-primary-600 hover:underline mt-2">
                                  Start Job
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'earnings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">My Earnings</h2>
                  
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : earnings ? (
                    <div className="space-y-6">
                      {/* Earnings Summary */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-primary-50 rounded-xl p-4">
                          <p className="text-primary-600 text-sm">Total Earnings</p>
                          <p className="text-2xl font-bold text-primary-700">
                            {formatCurrency(earnings.totalEarnings)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                          <p className="text-green-600 text-sm">Completed Jobs</p>
                          <p className="text-2xl font-bold text-green-700">
                            {earnings.completedJobs}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4">
                          <p className="text-blue-600 text-sm">This Month</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {formatCurrency(earnings.monthlyEarnings?.[0]?.total || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Monthly Chart */}
                      {earnings.monthlyEarnings?.length > 0 && (
                        <div className="h-64">
                          <h3 className="font-semibold text-gray-900 mb-4">Monthly Earnings</h3>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={earnings.monthlyEarnings.reverse()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="_id" 
                                tickFormatter={(value) => `${value.month}/${value.year}`}
                              />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                labelFormatter={(label) => `${label.month}/${label.year}`}
                              />
                              <Line type="monotone" dataKey="total" stroke="#3b82f6" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-12">No earnings data available</p>
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
                        Bio
                      </label>
                      <textarea
                        defaultValue={(user as any)?.bio}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate (₦)
                      </label>
                      <input
                        type="number"
                        defaultValue={(user as any)?.hourlyRate}
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
