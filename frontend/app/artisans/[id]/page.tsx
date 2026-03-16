'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaBriefcase,
  FaClock,
  FaCheckCircle,
  FaCalendarAlt,
  FaDollarSign,
  FaComment,
  FaArrowLeft
} from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { artisanService } from '@/services';
import { Artisan, Review } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ArtisanProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, userType } = useAuth();
  
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'portfolio'>('about');

  useEffect(() => {
    if (params.id) {
      loadArtisan();
    }
  }, [params.id]);

  const loadArtisan = async () => {
    try {
      const response = await artisanService.getArtisan(params.id as string);
      if (response.success) {
        setArtisan(response.data);
      }
    } catch (error) {
      console.error('Failed to load artisan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/booking?artisan=${params.id}`);
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/chat?artisan=${params.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Artisan not found</h2>
          <Link href="/artisans" className="text-primary-600 hover:underline">
            Browse other artisans
          </Link>
        </div>
      </div>
    );
  }

  const center = {
    lat: artisan.location.coordinates[1],
    lng: artisan.location.coordinates[0],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back to results
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-800">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={artisan.profileImage}
                  alt={`${artisan.firstName} ${artisan.lastName}`}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover"
                />
                {artisan.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full">
                    <FaCheckCircle className="text-lg" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {artisan.firstName} {artisan.lastName}
                    </h1>
                    <p className="text-gray-600">{artisan.category}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="font-semibold">{artisan.rating}</span>
                        <span className="text-gray-500 ml-1">({artisan.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <FaMapMarkerAlt className="mr-1" />
                        <span>{artisan.location.city}, {artisan.location.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <button
                      onClick={handleMessage}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FaComment className="mr-2" />
                      Message
                    </button>
                    {userType !== 'artisan' && (
                      <button
                        onClick={handleBookNow}
                        className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <FaCalendarAlt className="mr-2" />
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">{artisan.yearsOfExperience}</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">{artisan.completedJobs}</div>
                <div className="text-sm text-gray-600">Jobs Completed</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">{formatCurrency(artisan.hourlyRate)}</div>
                <div className="text-sm text-gray-600">Hourly Rate</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">{artisan.serviceRadius}km</div>
                <div className="text-sm text-gray-600">Service Radius</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {['about', 'reviews', 'portfolio'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'about' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid lg:grid-cols-3 gap-8"
              >
                {/* Bio & Skills */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-600 leading-relaxed">{artisan.bio}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {artisan.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {daysOfWeek.map((day) => {
                        const dayData = (artisan.availability as any)[day];
                        return (
                          <div
                            key={day}
                            className={`p-3 rounded-lg ${
                              dayData.isAvailable ? 'bg-green-50' : 'bg-gray-50'
                            }`}
                          >
                            <div className="text-sm font-medium capitalize text-gray-900">{day}</div>
                            {dayData.isAvailable ? (
                              <div className="text-sm text-green-600">
                                {dayData.open} - {dayData.close}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">Unavailable</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <FaPhone className="w-5 mr-3" />
                        <span>{artisan.phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaEnvelope className="w-5 mr-3" />
                        <span>{artisan.email}</span>
                      </div>
                      <div className="flex items-start text-gray-600">
                        <FaMapMarkerAlt className="w-5 mr-3 mt-1" />
                        <span>{artisan.location.address}, {artisan.location.city}, {artisan.location.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                    <div className="rounded-xl overflow-hidden">
                      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                        <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={center}
                          zoom={14}
                        >
                          <Marker position={center} />
                        </GoogleMap>
                      </LoadScript>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {(artisan as any).reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {(artisan as any).reviews.map((review: Review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary-600 font-semibold">
                                {(review.user as any).firstName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {(review.user as any).firstName} {(review.user as any).lastName}
                              </div>
                              <div className="text-sm text-gray-500">{formatDate(review.createdAt)}</div>
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
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No reviews yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'portfolio' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {artisan.portfolio?.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artisan.portfolio.map((item, index) => (
                      <div key={index} className="rounded-xl overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title || 'Portfolio item'}
                          className="w-full h-48 object-cover"
                        />
                        {(item.title || item.description) && (
                          <div className="p-3 bg-gray-50">
                            {item.title && <div className="font-medium text-gray-900">{item.title}</div>}
                            {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No portfolio items yet</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
