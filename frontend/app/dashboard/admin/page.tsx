'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaBriefcase, 
  FaCalendarAlt, 
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaChartLine,
  FaUserCheck,
  FaCog
} from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminService } from '@/services';
import { formatCurrency, formatNumber } from '@/utils/helpers';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [artisans, setArtisans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await adminService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadArtisans = async () => {
    try {
      const response = await adminService.getArtisans();
      if (response.success) {
        setArtisans(response.data);
      }
    } catch (error) {
      console.error('Failed to load artisans:', error);
    }
  };

  const handleApproveArtisan = async (id: string) => {
    try {
      await adminService.approveArtisan(id);
      loadArtisans();
    } catch (error) {
      console.error('Failed to approve artisan:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'artisans', label: 'Artisans', icon: FaBriefcase },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = dashboardData?.stats;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gray-900 rounded-2xl shadow-sm p-6 mb-6 text-white">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400">Manage your platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalUsers || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Artisans</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalArtisans || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaBriefcase className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.totalBookings || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.revenue?.totalRevenue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaDollarSign className="text-yellow-600" />
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
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'users') loadUsers();
                      if (tab.id === 'artisans') loadArtisans();
                    }}
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
                  
                  {/* Charts */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Stats */}
                    <div className="h-64">
                      <h3 className="font-medium text-gray-900 mb-4">Monthly Bookings</h3>
                      {dashboardData?.monthlyStats?.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dashboardData.monthlyStats.reverse()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="_id" 
                              tickFormatter={(v) => `${v.month}/${v.year.toString().slice(2)}`}
                            />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Revenue Chart */}
                    <div className="h-64">
                      <h3 className="font-medium text-gray-900 mb-4">Monthly Revenue</h3>
                      {dashboardData?.monthlyStats?.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={dashboardData.monthlyStats.reverse()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="_id" 
                              tickFormatter={(v) => `${v.month}/${v.year.toString().slice(2)}`}
                            />
                            <YAxis />
                            <Tooltip formatter={(v: number) => formatCurrency(v)} />
                            <Bar dataKey="revenue" fill="#22c55e" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Top Artisans */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Top Artisans</h3>
                    <div className="space-y-3">
                      {dashboardData?.topArtisans?.map((artisan: any) => (
                        <div
                          key={artisan.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <img
                              src={artisan.profileImage}
                              alt={artisan.firstName}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {artisan.firstName} {artisan.lastName}
                              </p>
                              <p className="text-sm text-gray-500">{artisan.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              <FaStar className="text-yellow-400 mr-1" />
                              <span>{artisan.rating}</span>
                            </div>
                            <p className="text-sm text-gray-500">{artisan.completedJobs} jobs</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Users</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Phone</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4">{user.phone}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button className="text-red-600 hover:underline text-sm">
                                Deactivate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'artisans' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Artisans</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Category</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {artisans.map((artisan) => (
                          <tr key={artisan.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <img
                                  src={artisan.profileImage}
                                  alt={artisan.firstName}
                                  className="w-8 h-8 rounded-lg object-cover mr-3"
                                />
                                {artisan.firstName} {artisan.lastName}
                              </div>
                            </td>
                            <td className="py-3 px-4">{artisan.category}</td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  artisan.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {artisan.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {!artisan.isApproved && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {!artisan.isApproved && (
                                <button
                                  onClick={() => handleApproveArtisan(artisan.id)}
                                  className="text-green-600 hover:underline text-sm mr-3"
                                >
                                  Approve
                                </button>
                              )}
                              <button className="text-red-600 hover:underline text-sm">
                                Deactivate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Commission (%)
                      </label>
                      <input
                        type="number"
                        defaultValue={10}
                        min="0"
                        max="50"
                        className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Percentage deducted from each booking
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Save Settings
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
