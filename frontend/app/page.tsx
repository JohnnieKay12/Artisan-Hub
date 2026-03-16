'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaSearch, 
  FaStar, 
  FaShieldAlt, 
  FaClock, 
  FaTools,
  FaWrench,
  FaBolt,
  FaHammer,
  FaPaintRoller,
  FaBroom,
  FaSnowflake,
  FaCut,
  FaCamera,
  FaUtensils
} from 'react-icons/fa';
import { artisanService } from '@/services';
import { Artisan } from '@/types';

const categories = [
  { name: 'Plumbing', icon: FaWrench, color: 'bg-blue-500', count: 120 },
  { name: 'Electrical', icon: FaBolt, color: 'bg-yellow-500', count: 95 },
  { name: 'Carpentry', icon: FaHammer, color: 'bg-amber-600', count: 80 },
  { name: 'Painting', icon: FaPaintRoller, color: 'bg-purple-500', count: 110 },
  { name: 'Cleaning', icon: FaBroom, color: 'bg-green-500', count: 150 },
  { name: 'HVAC', icon: FaSnowflake, color: 'bg-cyan-500', count: 45 },
  { name: 'Hair Styling', icon: FaCut, color: 'bg-pink-500', count: 200 },
  { name: 'Photography', icon: FaCamera, color: 'bg-indigo-500', count: 60 },
  { name: 'Catering', icon: FaUtensils, color: 'bg-orange-500', count: 75 },
];

const features = [
  {
    icon: FaStar,
    title: 'Verified Artisans',
    description: 'All artisans are thoroughly vetted and background checked for your peace of mind.',
  },
  {
    icon: FaShieldAlt,
    title: 'Secure Payments',
    description: 'Your payments are held securely and only released when the job is completed.',
  },
  {
    icon: FaClock,
    title: 'On-Time Service',
    description: 'Book appointments that fit your schedule. Our artisans value your time.',
  },
  {
    icon: FaTools,
    title: 'Quality Guarantee',
    description: 'Every service comes with a satisfaction guarantee. We stand behind our artisans.',
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredArtisans, setFeaturedArtisans] = useState<Artisan[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadFeaturedArtisans();
  }, []);

  const loadFeaturedArtisans = async () => {
    try {
      const response = await artisanService.getArtisans({ 
        sortBy: 'rating', 
        limit: 4 
      });
      if (response.success) {
        setFeaturedArtisans(response.data);
      }
    } catch (error) {
      console.error('Failed to load featured artisans:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/artisans?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Skilled Artisans for{' '}
              <span className="text-primary-200">Any Job</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Connect with trusted professionals for all your home service needs. 
              From plumbing to painting, we have got you covered.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-4 focus:ring-primary-300"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-primary-100">
              <span>Popular:</span>
              {['Plumbing', 'Electrical', 'Cleaning', 'Painting'].map((service) => (
                <Link
                  key={service}
                  href={`/artisans?category=${service}`}
                  className="hover:text-white underline"
                >
                  {service}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the right professional for your specific needs. Browse our wide range of service categories.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/artisans?category=${category.name}`}
                  className="block p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="text-white text-xl" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} artisans</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to find and book your perfect artisan.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Search', description: 'Browse artisans by category, location, or rating.' },
              { step: '2', title: 'Compare', description: 'View profiles, reviews, and pricing to find the best match.' },
              { step: '3', title: 'Book', description: 'Schedule an appointment that works for you.' },
              { step: '4', title: 'Enjoy', description: 'Sit back and relax while your artisan does the work.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We are committed to providing the best service experience for both customers and artisans.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artisans */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Artisans
              </h2>
              <p className="text-gray-600">
                Top-rated professionals ready to help you
              </p>
            </div>
            <Link
              href="/artisans"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredArtisans.map((artisan, index) => (
              <motion.div
                key={artisan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/artisans/${artisan.id}`}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={artisan.profileImage}
                        alt={`${artisan.firstName} ${artisan.lastName}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full flex items-center space-x-1">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm font-medium">{artisan.rating}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">
                        {artisan.firstName} {artisan.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{artisan.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary-600 font-semibold">
                          ₦{artisan.hourlyRate.toLocaleString()}/hr
                        </span>
                        <span className="text-sm text-gray-500">
                          {artisan.completedJobs} jobs
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their perfect artisan on our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/artisans"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Find an Artisan
            </Link>
            <Link
              href="/register?type=artisan"
              className="bg-secondary-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-secondary-600 transition-colors"
            >
              Become an Artisan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
